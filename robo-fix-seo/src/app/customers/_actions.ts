"use server";

import { normalizeStatus, type StatusKey } from "@/components/StatusBadge";
import { findRowById, updateCells, SHEET_NAME } from "@/lib/sheets";
import { revalidatePath } from "next/cache";
import { getNextStatus } from "@/lib/status-flow";

/** أعمدة Google Sheet: H = الحالة، J = آخر تحديث */
const COL_STATUS = "H";
const COL_UPDATED = "J";

/** التقدم للمرحلة التالية (Server Action) */
export async function advanceStatusAction(
  id: string
): Promise<{ ok: boolean; next?: StatusKey }> {
  const { rowIndex, row } = await findRowById(id);
  if (rowIndex < 0 || !row) return { ok: false };

  const currentRaw = row[7] as string; // H
  const current = normalizeStatus(currentRaw);
  const next = getNextStatus(current);

  // لا مرحلة لاحقة (تم التوصيل/ملغى أو آخر خطوة)
  if (!next) return { ok: true, next: current };

  await updateCells(
    `'${SHEET_NAME}'!${COL_STATUS}${rowIndex}:${COL_STATUS}${rowIndex}`,
    [[next]]
  );
  await updateCells(
    `'${SHEET_NAME}'!${COL_UPDATED}${rowIndex}:${COL_UPDATED}${rowIndex}`,
    [[new Date().toISOString()]]
  );

  // حدّث صفحة القائمة
  revalidatePath("/customers");
  return { ok: true, next };
}
