// src/app/customers/[id]/server-actions.ts
"use server";

import { StatusKey } from "@/components/StatusBadge";
import { SHEET_NAME, findRowById, updateCells } from "@/lib/sheets";
import { revalidatePath } from "next/cache";

// ثوابت الأعمدة حسب شيتك الحالي:
const COL_STATUS = "H"; // الحالة
const COL_UPDATED = "K"; // آخر تحديث

export async function updateStatus(id: string, nextStatus: StatusKey) {
  const { rowIndex, row } = await findRowById(id);
  if (rowIndex < 0 || !row) throw new Error("Customer not found");

  const rStatus = `'${SHEET_NAME}'!${COL_STATUS}${rowIndex}:${COL_STATUS}${rowIndex}`;
  const rUpdated = `'${SHEET_NAME}'!${COL_UPDATED}${rowIndex}:${COL_UPDATED}${rowIndex}`;

  await updateCells(rStatus, [[nextStatus]]);
  revalidatePath(`/customers/${id}`);
  revalidatePath("/customers");
  await updateCells(rUpdated, [[new Date().toISOString()]]);

  return {
    ok: true,
    id,
    status: nextStatus,
    rowIndex,
    ranges: { rStatus, rUpdated },
  };
}
