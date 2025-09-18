import { readAll } from "@/lib/sheets";
import CustomersClient from "./CustomersClient";
import { cookies } from "next/headers";

export const metadata = { title: "Robonarim | العملاء" };

type NextPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

// استخراج الدور من الكوكي (مشفّر base64url قبل التوقيع)
function decodeRoleFromCookie(token?: string): string | undefined {
  if (!token) return undefined;
  try {
    const [base] = token.split(".");
    if (!base) return undefined;
    const json = JSON.parse(Buffer.from(base, "base64").toString("utf-8"));
    return typeof json?.role === "string" ? json.role : undefined;
  } catch {
    return undefined;
  }
}

export default async function Page({ searchParams }: NextPageProps) {
  const sp = (await searchParams) || {};
  const updatedParam = Array.isArray(sp.updated) ? sp.updated[0] : sp.updated;
  const showSuccess = updatedParam === "1";

  const { rows } = await readAll();
  const cookieStore = await cookies();
  const sess = cookieStore.get("robosess")?.value;
  const role = decodeRoleFromCookie(sess); // "Kargo" | "Admin" | "Usta" | "call-center" | ...

  return (
    <CustomersClient
      rows={Array.isArray(rows) ? rows : []}
      showSuccess={showSuccess}
      role={role}
    />
  );
}
