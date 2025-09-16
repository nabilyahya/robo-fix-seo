"use server";
import { genPass6, genPublicId, hashPass } from "@/lib/crypto";
import { appendCustomer } from "@/lib/sheets";

import { randomUUID } from "crypto";

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

  return { id, publicId, pass };
}
