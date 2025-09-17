// src/app/customers/layout.tsx
import { cookies } from "next/headers";
import { verifySession, getSessionFromRequestCookie } from "@/lib/session";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

export default async function CustomersLayout({
  children,
}: {
  children: ReactNode;
}) {
  const cookieJar = cookies();
  const token = (await cookieJar).get("robosess")?.value ?? null;
  const session = verifySession(token ?? undefined);
  if (!session) {
    // لو بدون جلسة صالحة نوجّه
    redirect("/login");
  }

  // لو جلسة صالحة نكمل ونعرض children (قوائم، صفحات)
  return <div>{children}</div>;
}
