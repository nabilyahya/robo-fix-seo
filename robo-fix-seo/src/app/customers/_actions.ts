"use server";

import { normalizeStatus, type StatusKey } from "@/components/StatusBadge";
import { findRowById, updateCells, SHEET_NAME } from "@/lib/sheets";
import { revalidatePath } from "next/cache";
import { getNextStatus } from "@/lib/status-flow";

/** Google Sheet columns: H = status, J = updated_at, N = return_reason */
const COL_STATUS = "H";
const COL_UPDATED = "J";
const COL_RETURN_REASON = "N"; // ✅ كما طلبت

type ReturnReason = "price_disagreement" | "no_parts";

type AdvancePayload = {
  id: string;
  currentStatus?: string; // raw status من الواجهة إن وُجد
  forceNext?: StatusKey; // مثال: "return_waiting_del"
  meta?: { return_reason?: ReturnReason };
};

const NEXT_DEFAULT: Partial<Record<StatusKey, StatusKey | undefined>> = {
  pending_picked_up: "picked_up",
  picked_up: "checking",
  checking: "checked_waiting_ok",
  // checked_waiting_ok قرار يدوي
  approved_repairing: "repaired_waiting_del",
  repaired_waiting_del: "delivered_success",

  // مسار المرتجع:
  return_waiting_del: "return_delivered",

  // نهايات:
  delivered_success: undefined,
  canceled: undefined,
  return_delivered: undefined,
  checked_waiting_ok: undefined,
};

export async function advanceStatusAction(
  arg: string | AdvancePayload
): Promise<{ ok: boolean; next?: StatusKey }> {
  try {
    const id = typeof arg === "string" ? arg : arg.id;

    const { rowIndex, row } = await findRowById(id);
    if (rowIndex < 0 || !row) return { ok: false };

    const rawInSheet = (row[7] ?? "picked_up") as string; // H
    const current = normalizeStatus(
      typeof arg === "string" ? rawInSheet : arg.currentStatus ?? rawInSheet
    );

    // لو في forceNext استخدمه
    let next: StatusKey | undefined =
      typeof arg === "string" ? undefined : arg.forceNext;

    // وإلا استنتجه
    if (!next) {
      const nextFn =
        (getNextStatus as unknown as
          | ((s: StatusKey) => StatusKey | undefined)
          | undefined) ?? undefined;

      const n1 = nextFn ? nextFn(current) : undefined;
      next = n1 ?? (NEXT_DEFAULT[current] as StatusKey | undefined);
    }

    // لا انتقال (طرفية/قرار يدوي)
    if (!next) {
      // إن كان هناك return_reason احفظه حتى بدون تبديل الحالة
      if (typeof arg !== "string" && arg.meta?.return_reason) {
        await updateCells(
          `'${SHEET_NAME}'!${COL_RETURN_REASON}${rowIndex}:${COL_RETURN_REASON}${rowIndex}`,
          [[arg.meta.return_reason]]
        );
        await updateCells(
          `'${SHEET_NAME}'!${COL_UPDATED}${rowIndex}:${COL_UPDATED}${rowIndex}`,
          [[new Date().toISOString()]]
        );
      }
      revalidatePath("/customers");
      return { ok: true, next: current };
    }

    // اكتب الحالة الجديدة
    await updateCells(
      `'${SHEET_NAME}'!${COL_STATUS}${rowIndex}:${COL_STATUS}${rowIndex}`,
      [[next]]
    );

    // عند بدء مسار المرتجع احفظ السبب في N
    if (
      next === "return_waiting_del" &&
      typeof arg !== "string" &&
      arg.meta?.return_reason
    ) {
      await updateCells(
        `'${SHEET_NAME}'!${COL_RETURN_REASON}${rowIndex}:${COL_RETURN_REASON}${rowIndex}`,
        [[arg.meta.return_reason]]
      );
    }

    // حدّث آخر تحديث
    await updateCells(
      `'${SHEET_NAME}'!${COL_UPDATED}${rowIndex}:${COL_UPDATED}${rowIndex}`,
      [[new Date().toISOString()]]
    );

    revalidatePath("/customers");
    return { ok: true, next };
  } catch {
    return { ok: false };
  }
}
