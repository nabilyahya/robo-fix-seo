"use server";

import { addFinanceRow, listFinanceRows, TxType } from "@/lib/finance";
import { revalidatePath } from "next/cache";

export async function createTxAction(form: FormData) {
  const date = String(form.get("date"));
  const type = String(form.get("type")) as TxType;
  const category = String(form.get("category"));
  const amount = Number(form.get("amount"));
  const currency = String(form.get("currency") || "TRY");
  const tax_rate = Number(form.get("tax_rate") || 20);
  const tax_included = String(form.get("tax_included") || "false") === "true";
  const party = String(form.get("party") || "");
  const method = String(form.get("method") || "");
  const note = String(form.get("note") || "");
  const ref_id = String(form.get("ref_id") || "");

  if (!date || !type || !category || !amount) {
    throw new Error("الحقول الأساسية مطلوبة");
  }

  await addFinanceRow({
    date,
    type,
    category,
    amount,
    currency,
    tax_rate,
    tax_included,
    party,
    method,
    note,
    ref_id,
  });
  revalidatePath("/admin/finance");
}

export async function fetchTxAction(params?: {
  from?: string;
  to?: string;
  type?: TxType;
}) {
  return await listFinanceRows(params);
}
