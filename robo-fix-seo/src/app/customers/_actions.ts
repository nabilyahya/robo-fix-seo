"use server";

import { normalizeStatus, type StatusKey } from "@/components/StatusBadge";
import { findRowById, updateCells, SHEET_NAME } from "@/lib/sheets";
import { revalidatePath } from "next/cache";
import { getNextStatus } from "@/lib/status-flow";

/** Google Sheet columns:
 * H = status, J = updated_at,
 * N = return_reason, O = extra_cost, P = diagnosis_note
 */
const COL_STATUS = "H";
const COL_UPDATED = "J";
const COL_RETURN_REASON = "N"; // سبب المرتجع
const COL_EXTRA_COST = "O"; // تكلفة إضافية
const COL_DIAGNOSIS_NOTE = "P"; // ✅ وصف/ملاحظة العطل (بدل M)

type ReturnReason = "price_disagreement" | "no_parts";

type AdvancePayload = {
  id: string;
  currentStatus?: string;
  forceNext?: StatusKey;
  meta?: {
    // لمسار المرتجع
    return_reason?: ReturnReason;
    // لإنهاء الفحص
    diagnosis_note?: string;
    extra_cost?: string | number;
  };
};

const NEXT_DEFAULT: Partial<Record<StatusKey, StatusKey | undefined>> = {
  pending_picked_up: "picked_up",
  picked_up: "checking",
  checking: "checked_waiting_ok",
  checked_waiting_ok: undefined, // قرار يدوي (موافقة/مرتجع)
  approved_repairing: "repaired_waiting_del",
  repaired_waiting_del: "delivered_success",

  // return flow
  return_waiting_del: "return_delivered",
  return_delivered: undefined,

  delivered_success: undefined,
  canceled: undefined,
};

export async function advanceStatusAction(
  arg: string | AdvancePayload
): Promise<{ ok: boolean; next?: StatusKey }> {
  try {
    const id = typeof arg === "string" ? arg : arg.id;

    const { rowIndex, row } = await findRowById(id);
    if (rowIndex < 0 || !row) return { ok: false };

    const rawInSheet = (row[7] ?? "picked_up") as string;
    const current = normalizeStatus(
      typeof arg === "string" ? rawInSheet : arg.currentStatus ?? rawInSheet
    );

    // === تحديد الحالة التالية
    let next: StatusKey | undefined =
      typeof arg === "string" ? undefined : arg.forceNext;

    if (!next) {
      const maybeGetNext =
        (getNextStatus as unknown as
          | ((s: StatusKey) => StatusKey | undefined)
          | undefined) ?? undefined;

      const viaFlow = maybeGetNext?.(current);
      next = viaFlow ?? NEXT_DEFAULT[current];
    }

    const meta = typeof arg === "string" ? undefined : arg.meta;

    // === لا انتقال (طرفية/قرار يدوي) لكن عندنا حقول نكتبها
    if (!next) {
      const ops: Promise<any>[] = [];

      if (meta?.return_reason !== undefined) {
        ops.push(
          updateCells(
            `'${SHEET_NAME}'!${COL_RETURN_REASON}${rowIndex}:${COL_RETURN_REASON}${rowIndex}`,
            [[meta.return_reason]]
          )
        );
      }
      if (meta?.diagnosis_note !== undefined) {
        ops.push(
          updateCells(
            `'${SHEET_NAME}'!${COL_DIAGNOSIS_NOTE}${rowIndex}:${COL_DIAGNOSIS_NOTE}${rowIndex}`,
            [[String(meta.diagnosis_note || "")]]
          )
        );
      }
      if (meta?.extra_cost !== undefined) {
        ops.push(
          updateCells(
            `'${SHEET_NAME}'!${COL_EXTRA_COST}${rowIndex}:${COL_EXTRA_COST}${rowIndex}`,
            [[String(meta.extra_cost || "")]]
          )
        );
      }
      ops.push(
        updateCells(
          `'${SHEET_NAME}'!${COL_UPDATED}${rowIndex}:${COL_UPDATED}${rowIndex}`,
          [[new Date().toISOString()]]
        )
      );

      if (ops.length) await Promise.all(ops);
      revalidatePath("/customers");
      return { ok: true, next: current };
    }

    // === كتابة الحالة الجديدة
    const writes: Promise<any>[] = [
      updateCells(
        `'${SHEET_NAME}'!${COL_STATUS}${rowIndex}:${COL_STATUS}${rowIndex}`,
        [[next]]
      ),
      updateCells(
        `'${SHEET_NAME}'!${COL_UPDATED}${rowIndex}:${COL_UPDATED}${rowIndex}`,
        [[new Date().toISOString()]]
      ),
    ];

    // بداية مسار المرتجع: خزّن السبب في N
    if (next === "return_waiting_del" && meta?.return_reason) {
      writes.push(
        updateCells(
          `'${SHEET_NAME}'!${COL_RETURN_REASON}${rowIndex}:${COL_RETURN_REASON}${rowIndex}`,
          [[meta.return_reason]]
        )
      );
    }

    // إنهاء الفحص: خزّن الملاحظة في P والتكلفة في O
    if (next === "checked_waiting_ok") {
      if (meta?.diagnosis_note !== undefined) {
        writes.push(
          updateCells(
            `'${SHEET_NAME}'!${COL_DIAGNOSIS_NOTE}${rowIndex}:${COL_DIAGNOSIS_NOTE}${rowIndex}`,
            [[String(meta.diagnosis_note || "")]]
          )
        );
      }
      if (meta?.extra_cost !== undefined) {
        writes.push(
          updateCells(
            `'${SHEET_NAME}'!${COL_EXTRA_COST}${rowIndex}:${COL_EXTRA_COST}${rowIndex}`,
            [[String(meta.extra_cost || "")]]
          )
        );
      }
    }

    await Promise.all(writes);

    revalidatePath("/customers");
    return { ok: true, next };
  } catch (e) {
    console.error("advanceStatusAction error:", e);
    return { ok: false };
  }
}
