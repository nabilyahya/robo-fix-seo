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

/* =========================================================
   Customers sheet (الموجود سابقاً) — لا تغيير على السلوك
========================================================= */
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

/* =========================================================
   Finance sheet (جديد)
   الأعمدة: A:date, B:type, C:category, D:amount, E:currency,
            F:tax_rate, G:tax_included, H:net, I:tax, J:gross,
            K:party, L:method, M:note, N:ref_id, O:created_at
========================================================= */

export const FINANCE_SHEET = "Finance" as const;
const FIN_LAST_COL = "O" as const;
const FIN_RANGE_ALL = `${FINANCE_SHEET}!A:${FIN_LAST_COL}` as const;

/** نوع الحركة */
export type TxType = "income" | "expense";

/** واجهة صف المالية */
export interface FinanceRow {
  date: string; // yyyy-mm-dd
  type: TxType;
  category: string;
  amount: number;
  currency: string; // TRY
  tax_rate: number; // %
  tax_included: boolean;
  net: number;
  tax: number;
  gross: number;
  party?: string;
  method?: string;
  note?: string;
  ref_id?: string;
  created_at: string; // ISO
}

/** مساعد لحساب الضريبة (اختياري للاستخدام) */
export function computeFinanceAmounts(
  amount: number,
  taxRate: number,
  taxIncluded: boolean
) {
  const r = taxRate / 100;
  if (taxIncluded) {
    const net = amount / (1 + r);
    const tax = amount - net;
    return {
      net: round2(net),
      tax: round2(tax),
      gross: round2(amount),
    };
  } else {
    const tax = amount * r;
    const gross = amount + tax;
    return {
      net: round2(amount),
      tax: round2(tax),
      gross: round2(gross),
    };
  }
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/** إضافة صف للـ Finance (كائن عالي المستوى)
 *  - إن لم تُمرَّر net/tax/gross سنحسبها تلقائيًا من amount/tax_rate/tax_included
 */
export async function appendFinanceRow(input: {
  date: string;
  type: TxType;
  category: string;
  amount: number;
  currency?: string;
  tax_rate?: number;
  tax_included?: boolean;
  party?: string;
  method?: string;
  note?: string;
  ref_id?: string;
  // اختياري: لو حسبتها مسبقًا
  net?: number;
  tax?: number;
  gross?: number;
}) {
  const currency = input.currency ?? "TRY";
  const tax_rate = input.tax_rate ?? 20;
  const tax_included = input.tax_included ?? false;

  const computed =
    typeof input.net === "number" &&
    typeof input.tax === "number" &&
    typeof input.gross === "number"
      ? { net: input.net, tax: input.tax, gross: input.gross }
      : computeFinanceAmounts(input.amount, tax_rate, tax_included);

  const created_at = new Date().toISOString();

  const row = [
    input.date,
    input.type,
    input.category,
    input.amount,
    currency,
    tax_rate,
    tax_included ? "TRUE" : "FALSE",
    computed.net,
    computed.tax,
    computed.gross,
    input.party ?? "",
    input.method ?? "",
    input.note ?? "",
    input.ref_id ?? "",
    created_at,
  ];

  const sheets = await sheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
    range: FIN_RANGE_ALL,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

/** قراءة جميع الصفوف (مع الرؤوس) */
export async function readFinanceRaw(): Promise<string[][]> {
  const sheets = await sheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
    range: FIN_RANGE_ALL,
  });
  return (res.data.values ?? []) as string[][];
}

/** قراءة ككائنات (skip header) + فلاتر اختيارية */
export async function listFinanceRows(opts?: {
  from?: string; // yyyy-mm-dd
  to?: string; // yyyy-mm-dd
  type?: TxType;
}): Promise<FinanceRow[]> {
  const values = await readFinanceRaw();
  if (values.length <= 1) return [];

  const body = values.slice(1); // تخطي الرؤوس

  const rows: FinanceRow[] = body
    .filter((r) => r && r.length >= 4)
    .map((r) => {
      const [
        date,
        type,
        category,
        amount,
        currency,
        tax_rate,
        tax_included,
        net,
        tax,
        gross,
        party,
        method,
        note,
        ref_id,
        created_at,
      ] = r;

      return {
        date: (date || "").toString(),
        type: ((type || "").toString() as TxType) || "expense",
        category: (category || "").toString(),
        amount: Number(amount || 0),
        currency: (currency || "TRY").toString(),
        tax_rate: Number(tax_rate || 0),
        tax_included: (tax_included || "").toString().toUpperCase() === "TRUE",
        net: Number(net || 0),
        tax: Number(tax || 0),
        gross: Number(gross || 0),
        party: (party || "").toString(),
        method: (method || "").toString(),
        note: (note || "").toString(),
        ref_id: (ref_id || "").toString(),
        created_at: (created_at || "").toString(),
      };
    })
    .filter((row) => {
      if (opts?.type && row.type !== opts.type) return false;
      if (opts?.from && row.date && row.date < opts.from) return false;
      if (opts?.to && row.date && row.date > opts.to) return false;
      return true;
    });

  return rows;
}

/** ملخّص سريع لفترة محددة (اختياري) */
export async function summarizeFinance(opts?: { from?: string; to?: string }) {
  const rows = await listFinanceRows(opts);
  const income = rows.filter((r) => r.type === "income");
  const expense = rows.filter((r) => r.type === "expense");

  const sum = (arr: number[]) =>
    Math.round(arr.reduce((a, b) => a + b, 0) * 100) / 100;

  const incomeNet = sum(income.map((r) => r.net));
  const incomeTax = sum(income.map((r) => r.tax));
  const incomeGross = sum(income.map((r) => r.gross));

  const expenseNet = sum(expense.map((r) => r.net));
  const expenseTax = sum(expense.map((r) => r.tax));
  const expenseGross = sum(expense.map((r) => r.gross));

  const profit = Math.round((incomeNet - expenseGross) * 100) / 100;

  return {
    incomeNet,
    incomeTax,
    incomeGross,
    expenseNet,
    expenseTax,
    expenseGross,
    profit,
  };
}
