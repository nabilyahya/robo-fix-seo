// src/lib/status-flow.ts
export type StatusKey =
  | "pending_picked_up"
  | "picked_up"
  | "checking"
  | "checked_waiting_ok"
  | "approved_repairing"
  | "repaired_waiting_del"
  | "delivered_success"
  | "canceled";

/** تسلسل المراحل */
export const FLOW: StatusKey[] = [
  "pending_picked_up",
  "picked_up",
  "checking",
  "checked_waiting_ok",
  "approved_repairing",
  "repaired_waiting_del",
  "delivered_success",
];

/** عنوان الزر بحسب المرحلة التالية (عربي) */
export const NEXT_LABEL: Record<StatusKey, string | null> = {
  pending_picked_up: "تم الاستلام",
  picked_up: "بدء الفحص",
  checking: "إنهاء الفحص",
  checked_waiting_ok: "اعتماد التصليح",
  approved_repairing: "إنهاء التصليح",
  repaired_waiting_del: "تسليم للعميل",
  delivered_success: null,
  canceled: null,
};

export function getNextStatus(current: StatusKey): StatusKey | null {
  // الحالات النهائية: لا زر ولا مرحلة لاحقة
  if (current === "delivered_success" || current === "canceled") {
    return null;
  }

  const i = FLOW.indexOf(current);
  if (i === -1) {
    // لو حالة غير معروفة، لا نقترح انتقال تلقائي
    return null;
  }
  if (i >= FLOW.length - 1) {
    return null; // آخر مرحلة بالتدفق
  }
  return FLOW[i + 1];
}
