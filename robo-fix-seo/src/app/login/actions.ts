"use server";

import { verifyUser } from "@/lib/users"; // دالة تتحقق من Users Sheet
import { signSession } from "@/lib/session"; // توقيع الجلسة/الكوكي
import { redirect } from "next/navigation";

export async function loginAction(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const password = String(formData.get("password") || "");

  const user = await verifyUser(name, password); // رجّع null/undefined إذا فشل
  if (!user) {
    // ممكن ترجع قيمة تستخدمها لاظهار خطأ أو ترمي Error
    // throw new Error("INVALID_CREDENTIALS");
    return;
  }

  await signSession({ id: user.id, name: user.name, role: user.role });
  redirect("/customers");
}
