"use server";

import { randomUUID } from "crypto";
import { sendWhatsAppText } from "@/lib/whatsapp";
import {
  appendCustomerRow12,
  getNextNumericId,
  isValueUsed,
} from "@/lib/sheets";
import { normalizeStatus } from "@/components/StatusBadge";

/** رابط التتبّع */
function buildTrackUrl(publicId: string) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  return `${base}/track/${publicId}`;
}

/** كود 6 أرقام */
function genPass6(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/** رقم فيش فريد بصيغة RN-YYYY-2xxxxx */
async function genUniqueReceiptNo(): Promise<string> {
  const year = new Date().getFullYear();
  while (true) {
    const suffix = "2" + Math.floor(10000 + Math.random() * 90000).toString(); // 2xxxxx
    const candidate = `RN-${year}-${suffix}`;
    const exists = await isValueUsed(10, candidate); // K = index 10
    if (!exists) return candidate;
  }
}

/** الحالة الافتراضية عند الإنشاء (يمكنك تبديلها لـ "picked_up" إن أردت) */
const INITIAL_STATUS: string = "pending_picked_up";

export async function createCustomer(formData: FormData) {
  // قراءة بيانات النموذج
  const name = String(formData.get("name") || "").trim();
  const phone = String(formData.get("phone") || "").trim();
  const address = String(formData.get("address") || "").trim();
  const deviceType = String(formData.get("deviceType") || "").trim();
  const issue = String(formData.get("issue") || "").trim();
  const repairCost = String(formData.get("repairCost") || "").trim();
  const whatsappOptIn = String(formData.get("whatsappOptIn") || "") === "on";

  // ID رقمي بسيط متسلسل
  const numericId = await getNextNumericId();
  const id = String(numericId); // A

  // رقم الفيش (K) فريد
  const publicId = await genUniqueReceiptNo();

  // رمز الفيش (L) — 6 أرقام غير مُشفّر (مطلوب للعميل)
  const passCode = genPass6();

  const nowISO = new Date().toISOString();

  // الحالة (H) — نطبعها باستخدام normalizer لو احتجنا
  const status = normalizeStatus(INITIAL_STATUS);

  // ترتيب الحقول (A..L)
  await appendCustomerRow12([
    id, // A ID
    name, // B
    phone, // C
    address, // D
    deviceType, // E
    issue, // F
    repairCost, // G
    status, // H
    nowISO, // I created
    nowISO, // J updated
    publicId, // K رقم الفيش
    passCode, // L رمز الفيش
  ]);

  // إشعار واتساب (اختياري)
  const notifyPhone = process.env.WHATSAPP_TARGET_PHONE || "";
  if (notifyPhone) {
    const msg =
      `📢 عميل جديد تمّت إضافته\n\n` +
      `👤 الاسم: ${name}\n` +
      `📱 الهاتف: ${phone}\n` +
      `🔗 رابط التتبّع: ${buildTrackUrl(publicId)}\n` +
      `🔐 رمز التتبّع: ${passCode}`;
    try {
      await sendWhatsAppText(notifyPhone, msg);
    } catch (e) {
      console.error("WhatsApp notify failed:", e);
    }
  }

  // نُعيد القيم التي قد تحتاجها بالواجهة
  return { id, publicId, pass: passCode };
}
