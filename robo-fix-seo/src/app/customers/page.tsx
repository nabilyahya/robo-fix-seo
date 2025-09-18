import { readAll } from "@/lib/sheets";
import CustomersClient from "./CustomersClient";
import { cookies } from "next/headers";

export const metadata = { title: "Robonarim | العملاء" };

type NextPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

function decodeRoleFromCookie(token?: string): string | undefined {
  if (!token) return undefined;
  try {
    const [base] = token.split(".");
    if (!base) return undefined;
    // مهم: الترميز base64url وليس base64 العادي
    const json = JSON.parse(Buffer.from(base, "base64url").toString("utf-8"));
    return typeof json?.role === "string" ? json.role : undefined;
  } catch {
    return undefined;
  }
}

export default async function Page({ searchParams }: NextPageProps) {
  const sp = (await searchParams) || {};
  const updatedParam = Array.isArray(sp.updated) ? sp.updated[0] : sp.updated;
  const showSuccess = updatedParam === "1";

  let rows: any[] = [];
  let fetchError: string | undefined;

  try {
    const res = await readAll();
    rows = Array.isArray(res?.rows) ? res.rows : [];
  } catch (err: any) {
    console.error("Failed to read rows:", err);
    // رسالة مختصرة ترسل للعميل؛ التفاصيل تُسجّل في السيرفر فقط
    fetchError = "تعذر تحميل البيانات بسبب مشكلة في الشبكة أو مصدر البيانات.";
  }

  const cookieStore = await cookies();
  const sess = cookieStore.get("robosess")?.value;
  const role = decodeRoleFromCookie(sess); // مثل: "Kargo" | "Usta" | "Admin" ...

  return (
    <CustomersClient
      rows={rows}
      showSuccess={showSuccess}
      role={role}
      fetchError={fetchError}
    />
  );
}
