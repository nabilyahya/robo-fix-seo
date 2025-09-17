"use server";
import { genPass6, genPublicId, hashPass } from "@/lib/crypto";
import { appendCustomer } from "@/lib/sheets";
import { sendWhatsAppText } from "@/lib/whatsapp";

import { randomUUID } from "crypto";

function buildTrackUrl(publicId: string) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  return `${base}/track/${publicId}`;
}
export async function createCustomer(formData: FormData) {
  const name = String(formData.get("name") || "");
  const phone = String(formData.get("phone") || "");
  const address = String(formData.get("address") || "");
  const deviceType = String(formData.get("deviceType") || "");
  const issue = String(formData.get("issue") || "");
  const repairCost = String(formData.get("repairCost") || "");
  const whatsappOptIn =
    String(formData.get("whatsappOptIn") || "") === "on" ? "TRUE" : "FALSE";

  const id = randomUUID();
  const publicId = genPublicId();
  const pass = genPass6();
  const passHash = hashPass(pass);
  const now = new Date().toISOString();

  await appendCustomer([
    id,
    publicId,
    name,
    phone,
    address,
    deviceType,
    issue,
    repairCost,
    "picked_up",
    now,
    now,
    whatsappOptIn,
    passHash,
    "",
    "",
    "",
  ]);
  const notifyPhone = process.env.WHATSAPP_TARGET_PHONE || "";
  if (notifyPhone) {
    const msg =
      `📢 عميل جديد تمّت إضافته\n\n` +
      `👤 الاسم: ${name}\n` +
      `📱 الهاتف: ${phone}\n` +
      `🔗 رابط التتبّع: ${buildTrackUrl(publicId)}`;
    try {
      await sendWhatsAppText(notifyPhone, msg);
    } catch (e) {
      console.error("WhatsApp notify failed:", e);
    }
  }
  return { id, publicId, pass };
}
