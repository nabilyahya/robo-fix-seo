// src/lib/finance.ts
// يعتمد على sheetsClient الموجود لديك في src/lib/sheets.ts
import { sheetsClient } from "@/lib/sheets";

export const FINANCE_SHEET = "Finance" as const;
export type TxType = "income" | "expense";

export type FinanceRow = {
  id?: string; // رقم الصف (اختياري للرجوع)
  date: string; // A - YYYY-MM-DD
  type: TxType; // B
  category: string; // C
  amount: number; // D
  currency: string; // E (TRY)
  tax_rate: number; // F - %
  tax_included: boolean; // G - TRUE/FALSE
  net: number; // H
  created_at: string; // I  ✅ moved here
  gross: number; // J
  party?: string; // K
  method?: string; // L
  note?: string; // M
  ref_id?: string; // N
  tax: number; // O  ✅ moved here
};

/* =========================
   Helpers for this sheet only
========================= */
async function appendRow(sheetName: string, row: any[]) {
  const sheets = await sheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
    range: `${sheetName}!A:O`,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

async function readRange(sheetName: string, a1: string): Promise<any[][]> {
  const sheets = await sheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
    range: `${sheetName}!${a1}`,
  });
  return (res.data.values ?? []) as any[][];
}

/* =========================
   حساب الضريبة
========================= */
export function computeTax(
  amount: number,
  taxRate: number,
  taxIncluded: boolean
) {
  const r = taxRate / 100;
  if (taxIncluded) {
    const net = amount / (1 + r);
    const tax = amount - net;
    return { net: round2(net), tax: round2(tax), gross: round2(amount) };
  } else {
    const tax = amount * r;
    const gross = amount + tax;
    return { net: round2(amount), tax: round2(tax), gross: round2(gross) };
  }
}
function round2(n: number) {
  return Math.round(n * 100) / 100;
}

/* =========================
   إضافة صف جديد
   ترتيب الأعمدة بعد التعديل:
   A date, B type, C category, D amount, E currency, F tax_rate,
   G tax_included, H net, I created_at, J gross, K party, L method,
   M note, N ref_id, O tax
========================= */
export async function addFinanceRow(input: {
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
}) {
  const currency = input.currency ?? "TRY";
  const tax_rate = input.tax_rate ?? 20;
  const tax_included = input.tax_included ?? false;
  const { net, tax, gross } = computeTax(input.amount, tax_rate, tax_included);
  const created_at = new Date().toISOString();

  // ✅ الانتباه لترتيب الأعمدة الجديد (created_at في I, tax في O)
  const row = [
    input.date, // A date
    input.type, // B type
    input.category, // C category
    input.amount, // D amount
    currency, // E currency
    tax_rate, // F tax_rate
    tax_included ? "TRUE" : "FALSE", // G tax_included
    net, // H net
    created_at, // I created_at  ✅
    gross, // J gross
    input.party ?? "", // K party
    input.method ?? "", // L method
    input.note ?? "", // M note
    input.ref_id ?? "", // N ref_id
    tax, // O tax        ✅
  ];

  await appendRow(FINANCE_SHEET, "values" in row ? (row as any) : row);
  return { ok: true };
}

/* =========================
   قراءة مع فلاتر اختيارية
========================= */
export async function listFinanceRows(opts?: {
  from?: string;
  to?: string;
  type?: TxType;
}) {
  // نقرأ كل الأعمدة A..O — السطر الأول عناوين
  const values = await readRange(FINANCE_SHEET, "A:O");
  const rows = (values ?? []).slice(1).map((r: any[], idx: number) => {
    // حافظ على ترتيب الاستخراج موافقًا تمامًا لترتيب الأعمدة الجديد
    const [
      date, // A
      type, // B
      category, // C
      amount, // D
      cur, // E
      tax_rate, // F
      ti, // G
      net, // H
      created_at, // I  ✅
      gross, // J
      party, // K
      method, // L
      note, // M
      ref_id, // N
      tax, // O  ✅
    ] = r;

    const obj: FinanceRow = {
      id: String(idx + 2),
      date: String(date ?? ""),
      type: String(type ?? "") as TxType,
      category: String(category ?? ""),
      amount: Number(amount ?? 0),
      currency: String(cur ?? "TRY"),
      tax_rate: Number(tax_rate ?? 0),
      tax_included: String(ti ?? "").toUpperCase() === "TRUE",
      net: Number(net ?? 0),
      created_at: String(created_at ?? ""), // ✅
      gross: Number(gross ?? 0),
      party: party ? String(party) : "",
      method: method ? String(method) : "",
      note: note ? String(note) : "",
      ref_id: ref_id ? String(ref_id) : "",
      tax: Number(tax ?? 0), // ✅
    };
    return obj;
  });

  return rows.filter((r) => {
    if (opts?.type && r.type !== opts.type) return false;
    if (opts?.from && r.date < opts.from) return false;
    if (opts?.to && r.date > opts.to) return false;
    return true;
  });
}

/* =========================
   ملخّص الفترة (اختياري)
========================= */
export async function summarizeFinance(opts?: { from?: string; to?: string }) {
  const rows = await listFinanceRows(opts);
  const sum = (ns: number[]) =>
    Math.round(ns.reduce((a, b) => a + b, 0) * 100) / 100;

  const income = rows.filter((r) => r.type === "income");
  const expense = rows.filter((r) => r.type === "expense");

  const incomeNet = sum(income.map((r) => r.net));
  const incomeTax = sum(income.map((r) => r.tax)); // من O
  const incomeGross = sum(income.map((r) => r.gross));

  const expenseNet = sum(expense.map((r) => r.net));
  const expenseTax = sum(expense.map((r) => r.tax)); // من O
  const expenseGross = sum(expense.map((r) => r.gross));

  const profit = round2(incomeNet - expenseGross);

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
