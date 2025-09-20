// src/lib/sheets.ts
import fs from "node:fs";
import { google } from "googleapis";

/** Load service account JSON from env or file */
function loadServiceAccountJSON(): any {
  const jsonStr =
    process.env.GOOGLE_SERVICE_ACCOUNT_KEY ??
    (process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE
      ? fs.readFileSync(process.env.GOOGLE_SERVICE_ACCOUNT_KEY_FILE, "utf8")
      : "");

  if (!jsonStr) {
    throw new Error(
      "Service account JSON not provided. Set GOOGLE_SERVICE_ACCOUNT_KEY or GOOGLE_SERVICE_ACCOUNT_KEY_FILE"
    );
  }
  return JSON.parse(jsonStr);
}

/** Google Sheets client (Service Account) */
export async function sheetsClient() {
  if (!process.env.GOOGLE_SHEETS_ID) {
    throw new Error("Missing GOOGLE_SHEETS_ID env");
  }
  const credentials = loadServiceAccountJSON();

  const auth = new google.auth.GoogleAuth({
    credentials,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
  return google.sheets({ version: "v4", auth });
}

export const SHEET_NAME = "Customers" as const;

/** ✅ ما زلنا نضيف صفوف جديدة حتى L (12 عمودًا) */
const RANGE_12 = `${SHEET_NAME}!A:L` as const;

/** ✅ القراءة أصبحت حتى P لجلب حقول المرتجع/التكلفة/الملاحظة */
const LAST_COL = "P" as const;
const RANGE_ALL = `${SHEET_NAME}!A:${LAST_COL}` as const;

/** صف العميل (حتى P). الأعمدة الأخيرة اختيارية للحفاظ على التوافق */
export type CustomerRow = [
  string, // A: ID
  string, // B: Name
  string, // C: Phone
  string, // D: Address
  string, // E: DeviceType
  string, // F: Issue
  string, // G: RepairCost
  string, // H: Status
  string, // I: CreatedAt (ISO)
  string, // J: UpdatedAt (ISO)
  string, // K: PublicId / ReceiptNo
  string, // L: PassCode
  string?, // M: (محجوز)
  string?, // N: return_reason
  string?, // O: extra_cost
  string? // P: diagnosis_note
];

/** Append (12-col) */
export async function appendCustomerRow12(
  row: [
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string,
    string
  ]
) {
  const sheets = await sheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
    range: RANGE_12,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

/** إبقاء الاسم القديم كـ alias */
export const appendCustomer = appendCustomerRow12;

/** Load ALL values (including header) — حتى P */
async function loadValues(): Promise<string[][]> {
  const sheets = await sheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
    range: RANGE_ALL,
  });
  return (res.data.values ?? []) as string[][];
}

/** Read all rows (skip header) */
export async function readAll(): Promise<{ rows: CustomerRow[] }> {
  const values = await loadValues();
  if (values.length <= 1) return { rows: [] };
  const body = values.slice(1);

  // نملأ حتى 16 خانة (A..P) لضمان وجود المؤشرات 11..15
  const rows = body
    .filter((r) => r && r.length >= 2)
    .map(
      (r) =>
        Array.from({ length: 16 }, (_, i) =>
          (r[i] ?? "").toString()
        ) as CustomerRow
    );
  return { rows };
}

/** ✅ ID بالعمود A — يعيد فهرس 1-based والصف */
export async function findRowById(id: string) {
  const values = await loadValues();
  let rowIndex = -1;

  const wanted = (id ?? "").toString().trim();

  for (let i = 1; i < values.length; i++) {
    const cell = (values[i]?.[0] ?? "").toString().trim();

    const sameText = cell === wanted;
    const sameNumber =
      cell !== "" &&
      wanted !== "" &&
      !Number.isNaN(Number(cell)) &&
      !Number.isNaN(Number(wanted)) &&
      Number(cell) === Number(wanted);

    if (sameText || sameNumber) {
      rowIndex = i + 1; // 1-based
      break;
    }
  }

  return {
    rowIndex,
    row: rowIndex > 0 ? (values[rowIndex - 1] as any[]) : null,
  };
}

/** البحث برقم الفيش (K = index 10) */
export async function findRowByPublicId(publicId: string) {
  const sheets = await sheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
    range: `${SHEET_NAME}!A:Z`, // يكفي ويزيد
  });
  const values = (res.data.values ?? []) as string[][];
  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    if ((values[i][10] || "").trim() === publicId.trim()) {
      rowIndex = i + 1;
      break;
    }
  }
  return {
    rowIndex,
    row: rowIndex > 0 ? (values[rowIndex - 1] as any[]) : null,
  };
}

/** NEW: البحث بواسطة رمز الفيش (L = index 11) */
export async function findRowByPassCode(passCode: string): Promise<{
  rowIndex: number; // 1-based
  row: any[] | null;
}> {
  const sheets = await sheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
    range: RANGE_ALL, // ✅ حتى P
  });
  const values = (res.data.values ?? []) as string[][];
  let rowIndex = -1;

  const wanted = (passCode ?? "").toString().trim();
  for (let i = 1; i < values.length; i++) {
    const cell = (values[i]?.[11] ?? "").toString().trim(); // L = index 11
    if (cell === wanted) {
      rowIndex = i + 1;
      break;
    }
  }

  return {
    rowIndex,
    row: rowIndex > 0 ? (values[rowIndex - 1] as any[]) : null,
  };
}

/** Update arbitrary range, e.g. Customers!I12:I12 */
export async function updateCells(range: string, values: any[][]) {
  const sheets = await sheetsClient();
  await sheets.spreadsheets.values.update({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
    range,
    valueInputOption: "USER_ENTERED",
    requestBody: { values },
  });
}

/* -------------------- أدوات مساعدة -------------------- */

/** احصل على أكبر ID في العمود A ثم +1 */
export async function getNextNumericId(): Promise<number> {
  const { rows } = await readAll();
  let maxId = 0;
  for (const r of rows) {
    const v = Number(r[0]);
    if (Number.isFinite(v) && v > maxId) maxId = v;
  }
  return maxId + 1;
}

/** افحص إن كانت قيمة مستخدمة في عمود معيّن (index يبدأ من 0) */
export async function isValueUsed(
  colIndex: number,
  value: string
): Promise<boolean> {
  const { rows } = await readAll();
  return rows.some(
    (r) => (r[colIndex] ?? "").toString().trim() === value.trim()
  );
}
