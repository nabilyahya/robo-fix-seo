import { sheetsClient } from "@/lib/sheets";

const SHEET = "Users"; // اسم الورقة Users

type UserRow = [string, string, string, string]; // A:ID, B:Name, C:Role, D:Password

export type User = { id: string; name: string; role: string };

export async function verifyUser(
  name: string,
  password: string
): Promise<User | null> {
  const sheets = await sheetsClient();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
    range: `${SHEET}!A:D`,
  });

  const values = (res.data.values ?? []) as string[][];
  // تخطي الهيدر
  for (let i = 1; i < values.length; i++) {
    const [id, nm, role, pass] = (values[i] ?? []) as UserRow;
    if (
      (nm ?? "").trim() === name.trim() &&
      (pass ?? "").trim() === password.trim()
    ) {
      return {
        id: (id ?? "").trim(),
        name: nm.trim(),
        role: (role ?? "").trim(),
      };
    }
  }
  return null;
}
