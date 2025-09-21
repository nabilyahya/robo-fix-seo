// src/app/customers/[id]/server-actions.ts
"use server";

import { StatusKey } from "@/components/StatusBadge";
import { SHEET_NAME, findRowById, updateCells } from "@/lib/sheets";
import { revalidatePath } from "next/cache";

const COL_STATUS = "H"; // الحالة
const COL_UPDATED = "J"; // ✅ آخر تحديث الصحيح

export async function updateStatus(id: string, nextStatus: StatusKey) {
  const { rowIndex, row } = await findRowById(id);
  if (rowIndex < 0 || !row) throw new Error("Customer not found");

  const rStatus = `'${SHEET_NAME}'!${COL_STATUS}${rowIndex}:${COL_STATUS}${rowIndex}`;
  const rUpdated = `'${SHEET_NAME}'!${COL_UPDATED}${rowIndex}:${COL_UPDATED}${rowIndex}`;

  await updateCells(rStatus, [[nextStatus]]);
  await updateCells(rUpdated, [[new Date().toISOString()]]);
  revalidatePath(`/customers/${id}`);
  revalidatePath("/customers");

  return { ok: true, id, status: nextStatus, rowIndex };
}
