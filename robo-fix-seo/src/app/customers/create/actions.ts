// app/customers/create/actions.ts
"use server";

import fs from "node:fs";
import path from "node:path";
import { PassThrough } from "node:stream";
import { normalizeStatus } from "@/components/StatusBadge";
import {
  appendCustomerRow12,
  getNextNumericId,
  isValueUsed,
  findRowByPublicId,
  updateCells,
  SHEET_NAME,
} from "@/lib/sheets";
import { sendWhatsAppText } from "@/lib/whatsapp";
import { buildTeslimatHTML } from "@/templates/teslimat";
import { google } from "googleapis";

/* ============================
   Logs
============================ */
const TAG = "[createCustomer]";
function log(msg: string, meta?: unknown) {
  if (meta !== undefined) {
    try {
      console.log(TAG, msg, JSON.stringify(meta));
    } catch {
      console.log(TAG, msg);
    }
  } else {
    console.log(TAG, msg);
  }
}
function logError(msg: string, err: unknown) {
  const safe =
    err instanceof Error
      ? { name: err.name, message: err.message, stack: err.stack }
      : err;
  console.error(`${TAG} ${msg}`, safe);
}

/* ============================
   Helpers
============================ */
function siteBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  );
}
function buildTrackUrl(publicId: string) {
  return `${siteBaseUrl()}/track/${publicId}`;
}
function genPass6(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
/** RN-YYYY-2xxxxx */
async function genUniqueReceiptNo(): Promise<string> {
  const year = new Date().getFullYear();
  while (true) {
    const suffix = "2" + Math.floor(10000 + Math.random() * 90000).toString();
    const candidate = `RN-${year}-${suffix}`;
    const exists = await isValueUsed(10, candidate); // col K = index 10
    if (!exists) return candidate;
  }
}

/* ============================
   HTML -> PDF (Puppeteer-core on Vercel, Puppeteer locally)
============================ */
async function htmlToPdfBuffer(html: string): Promise<Buffer> {
  const isVercel = !!process.env.VERCEL || !!process.env.VERCEL_ENV;

  // نحدّد الحزمة ومصار الإطلاق حسب البيئة
  let puppeteer: any;
  let launchOptions: any = { headless: true };

  if (isVercel) {
    const chromium = (await import("@sparticuz/chromium")).default;

    // إعدادات يوصي فيها Sparticuz/فريسِل
    chromium.setHeadlessMode = true;
    chromium.setGraphicsMode = false;

    puppeteer = await import("puppeteer-core");

    // NOTE: chromium.args تحتوي flags مناسبة للسيرفرلس (no-sandbox…)
    launchOptions = {
      ...launchOptions,
      args: chromium.args,
      executablePath: await chromium.executablePath(),
      defaultViewport: chromium.defaultViewport,
      ignoreHTTPSErrors: true,
    };
  } else {
    // محليًا نستعمل puppeteer الكامل (أسرع وأسهل)
    puppeteer = await import("puppeteer");
    // نحاول تلقّي مسار المتصفح المُثبّت
    // puppeteer.executablePath() متوفرة محليًا
    const localExec = (puppeteer as any).executablePath?.() as
      | string
      | undefined;
    if (localExec) {
      launchOptions = { ...launchOptions, executablePath: localExec };
    }
  }

  const browser = await puppeteer.launch(launchOptions);
  log("puppeteer launched", { isVercel });

  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "networkidle0" });
    const pdf: Buffer =
      typeof page.pdf === "function"
        ? await page.pdf({
            format: "A4",
            printBackground: true,
            margin: {
              top: "18mm",
              bottom: "18mm",
              left: "18mm",
              right: "18mm",
            },
          })
        : Buffer.from([]);
    log("pdf generated", { bytes: pdf.length });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
    log("puppeteer closed");
  }
}

/* ============================
   Google Drive auth
============================ */
function loadServiceAccountJSON(): any {
  const inline = process.env.GOOGLE_SERVICE_ACCOUNT_KEY;
  const fromFile = process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE
    ? fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE, "utf8")
    : "";
  const raw = inline || fromFile;
  if (!raw) {
    throw new Error(
      "Missing service account JSON. Set GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_SERVICE_ACCOUNT_KEY_FILE"
    );
  }
  return JSON.parse(raw);
}

function getDriveClient() {
  const cid = process.env.GOOGLE_OAUTH_CLIENT_ID;
  const cs = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
  const rt = process.env.GOOGLE_OAUTH_REFRESH_TOKEN;

  if (cid && cs && rt) {
    const oauth2 = new google.auth.OAuth2({
      clientId: cid,
      clientSecret: cs,
      redirectUri: "https://developers.google.com/oauthplayground",
    });
    oauth2.setCredentials({ refresh_token: rt });
    log("drive auth: using OAuth2");
    return google.drive({ version: "v3", auth: oauth2 });
  }

  const creds = loadServiceAccountJSON();
  const email = creds.client_email;
  const key = String(creds.private_key || "").replace(/\\n/g, "\n");
  const auth = new google.auth.JWT({
    email,
    key,
    scopes: ["https://www.googleapis.com/auth/drive"],
  });
  log("drive auth: using Service Account (fallback)");
  return google.drive({ version: "v3", auth });
}

// googleapis يحتاج Stream في media.body
function bufferToStream(buf: Buffer) {
  const stream = new PassThrough();
  stream.end(buf);
  return stream;
}

// retry helper
async function uploadWithRetry<T>(
  fnFactory: () => Promise<T>,
  label: string,
  tries = 3
): Promise<T> {
  let lastErr: unknown;
  for (let i = 1; i <= tries; i++) {
    try {
      return await fnFactory();
    } catch (e: any) {
      lastErr = e;
      const msg = e?.message || "";
      const isNetErr =
        /ECONNRESET|ETIMEDOUT|EAI_AGAIN|ENOTFOUND|socket hang up/i.test(msg);
      if (!isNetErr || i === tries) break;
      const delay = 500 * i;
      log(`${label} retry #${i} after ${delay}ms`, { reason: msg });
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
}

async function uploadPdfToDrive(
  fileName: string,
  pdfBuffer: Buffer
): Promise<{ fileId: string; viewUrl: string; directUrl: string }> {
  const drive = getDriveClient();

  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID; // اختياري
  const fileMeta: any = {
    name: fileName,
    mimeType: "application/pdf",
    ...(folderId ? { parents: [folderId] } : {}),
  };

  log("drive uploading", { fileName, size: pdfBuffer.length });

  // ⚠️ مهم: أنشئ media.body جديد في كل محاولة
  const createRes = await uploadWithRetry(
    () =>
      drive.files.create({
        requestBody: fileMeta,
        media: {
          mimeType: "application/pdf",
          body: bufferToStream(pdfBuffer),
        },
        uploadType: "multipart",
        fields: "id, webViewLink, webContentLink",
      }),
    "drive.create"
  );

  const fileId = (createRes.data as any).id as string;

  await uploadWithRetry(
    () =>
      drive.permissions.create({
        fileId,
        requestBody: { role: "reader", type: "anyone" },
      }),
    "drive.permissions"
  );

  const viewUrl = `https://drive.google.com/file/d/${fileId}/view`;
  const directUrl = `https://drive.google.com/uc?export=download&id=${fileId}`;
  log("drive uploaded", { fileId });
  return { fileId, viewUrl, directUrl };
}

/* ============================
   Main Action
============================ */
const INITIAL_STATUS = "pending_picked_up";

export async function createCustomer(formData: FormData) {
  log("action started");

  // 1) form
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const deviceType = String(formData.get("deviceType") || "").trim();
  const issue = String(formData.get("issue") || "").trim();
  const repairCost = String(formData.get("repairCost") || "").trim();
  const whatsappOptIn = String(formData.get("whatsappOptIn") || "") === "on";

  // حقول اختيارية
  const deviceSN = String(formData.get("deviceSN") || "").trim();
  const deviceAccessories = String(
    formData.get("deviceAccessories") || ""
  ).trim();

  log("form read", {
    hasName: !!name,
    hasPhone: !!phone,
    hasAddress: !!address,
    hasDeviceType: !!deviceType,
    hasIssue: !!issue,
    hasRepairCost: repairCost !== "",
    whatsappOptIn,
    hasSN: !!deviceSN,
    accessories: deviceAccessories || "(none)",
  });

  // 2) ids
  const numericId = await getNextNumericId();
  const id = String(numericId);
  const publicId = await genUniqueReceiptNo();
  const passCode = genPass6();

  const now = new Date();
  const nowISO = now.toISOString();
  const dateHuman = now.toLocaleDateString("tr-TR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });

  // 3) status
  const status = normalizeStatus(INITIAL_STATUS);

  // 4) save to Sheets
  await appendCustomerRow12([
    id, // A
    name, // B
    phone, // C
    address, // D
    deviceType, // E
    issue, // F
    repairCost, // G
    status, // H
    nowISO, // I
    nowISO, // J
    publicId, // K
    passCode, // L
  ]);
  log("sheet appended", { id, publicId });

  // 5) HTML -> PDF -> Drive
  const base = siteBaseUrl();
  const trackUrl = buildTrackUrl(publicId);
  const html = buildTeslimatHTML({
    receiptNo: publicId,
    dateStr: dateHuman,
    name,
    phone,
    address,
    deviceType,
    issue,
    trackUrl,
    passCode,
    companyName: "Robonarim",
    logoUrl: `${base}/logo_square.jpg`,
    assetsBaseUrl: base,
    deviceSN,
    deviceAccessories,
  });

  let pdfDirectUrl: string | null = null;
  let pdfViewUrl: string | null = null;
  let pdfFileId: string | null = null;

  try {
    const pdfBuffer = await htmlToPdfBuffer(html);
    const fileName = `Teslimat-Fisi_${publicId}.pdf`;
    const up = await uploadPdfToDrive(fileName, pdfBuffer);
    pdfDirectUrl = up.directUrl;
    pdfViewUrl = up.viewUrl;
    pdfFileId = up.fileId;

    // ✅ تحديث العمود M برابط التحميل
    if (pdfDirectUrl) {
      const { rowIndex } = await findRowByPublicId(publicId);
      if (rowIndex > 0) {
        await updateCells(`${SHEET_NAME}!M${rowIndex}:M${rowIndex}`, [
          [pdfDirectUrl],
        ]);
        log("sheet M updated", { rowIndex, pdfDirectUrl });
      } else {
        log("sheet M skipped: publicId not found", { publicId });
      }
    }
  } catch (e) {
    logError("PDF/Drive error", e);
    // نكمل بدون PDF
  }

  // 6) WhatsApp notify (اختياري)
  const notifyPhone = process.env.WHATSAPP_TARGET_PHONE || "";
  if (notifyPhone) {
    const msg =
      `📢 عميل جديد تمّت إضافته\n\n` +
      `👤 الاسم: ${name}\n` +
      `📱 الهاتف: ${phone}\n` +
      `🧾 رقم الفيش: ${publicId}\n` +
      `🔗 رابط التتبّع: ${trackUrl}\n` +
      `🔐 رمز التتبّع: ${passCode}\n` +
      (pdfViewUrl ? `📄 PDF: ${pdfViewUrl}\n` : ``);
    try {
      await sendWhatsAppText(notifyPhone, msg);
      log("whatsapp notified");
    } catch (e) {
      logError("WhatsApp notify failed", e);
    }
  }

  log("action done", { id, publicId, hasPdf: !!pdfDirectUrl });

  return {
    id,
    publicId,
    pass: passCode,
    pdfDirectUrl,
    pdfViewUrl,
    pdfFileId,
  };
}
