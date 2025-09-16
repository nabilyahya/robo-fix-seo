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
const RANGE_ALL = `${SHEET_NAME}!A:P` as const; // 16 columns

export type CustomerRow = [
  string, // A: ID
  string, // B: PublicId
  string, // C: Name
  string, // D: Phone
  string, // E: Address
  string, // F: DeviceType
  string, // G: Issue
  string, // H: RepairCost
  string, // I: Status
  string, // J: CreatedAt
  string, // K: UpdatedAt
  string, // L: WhatsAppOptIn (TRUE/FALSE)
  string, // M: PortalPassHash
  string, // N: PortalPassHint
  string, // O: PdfURL
  string // P: Notes
];

/** Append a customer row */
export async function appendCustomer(row: CustomerRow) {
  const sheets = await sheetsClient();
  await sheets.spreadsheets.values.append({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
    range: RANGE_ALL,
    valueInputOption: "USER_ENTERED",
    requestBody: { values: [row] },
  });
}

/** Load ALL values (including header) */
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
  if (values.length === 0) return { rows: [] };
  const body = values.slice(1);
  const rows = body.filter((r) => r && r.length >= 2) as CustomerRow[];
  return { rows };
}

/** Find by internal ID (col A). Returns 1-based index for Sheets ranges. */
export async function findRowById(id: string) {
  const values = await loadValues();
  let rowIndex = -1;

  const wanted = (id ?? "").toString().trim();

  for (let i = 1; i < values.length; i++) {
    const cell = (values[i]?.[0] ?? "").toString().trim();

    // طابق كنص أولاً، ولو ما ظبط جرّب مقارنة رقمية
    const sameText = cell === wanted;
    const sameNumber =
      cell !== "" &&
      wanted !== "" &&
      !Number.isNaN(Number(cell)) &&
      !Number.isNaN(Number(wanted)) &&
      Number(cell) === Number(wanted);

    if (sameText || sameNumber) {
      rowIndex = i + 1; // 1-based للـ Sheets
      break;
    }
  }

  return {
    rowIndex,
    row: rowIndex > 0 ? (values[rowIndex - 1] as any[]) : null,
  };
}

/** Find by publicId (col B). Returns 1-based index for Sheets ranges. */
// src/lib/sheets.ts (أضف/حدّث هذا فقط)
export async function findRowByPublicId(publicId: string) {
  const sheets = await sheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
    range: `${SHEET_NAME}!A:Z`, // نجلب الصف كاملاً
  });
  const values = (res.data.values ?? []) as string[][];
  let rowIndex = -1;
  for (let i = 1; i < values.length; i++) {
    // K = index 10
    if ((values[i][10] || "").trim() === publicId.trim()) {
      rowIndex = i + 1; // 1-based
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
