"use client";

import { useMemo, useState, useTransition } from "react";
import { normalizeStatus, STATUSES } from "@/components/StatusBadge";
import { getNextStatus } from "@/lib/status-flow";
import type { StatusKey } from "@/lib/status-flow";

/** عنوان الزر بحسب "الحالة الهدف" (المرحلة التالية) */
const NEXT_LABEL_BY_TARGET: Record<StatusKey, string | null> = {
  picked_up: "تم الاستلام", // من بانتظار الجلب -> تم جلب الجهاز
  checking: "بدء الفحص",
  checked_waiting_ok: "إنهاء الفحص",
  approved_repairing: "اعتماد التصليح",
  repaired_waiting_del: "إنهاء التصليح",
  delivered_success: "تسليم للعميل",

  // غير مستخدمة كهدف مباشر للأزرار:
  pending_picked_up: null,
  canceled: null,
};

type Props = {
  id: string;
  currentStatus: string; // قد يأتي عربي/تركي — نطبّعه
  /** Server Action تُرجِع ok + الحالة التالية (اختياري) */
  onConfirm: (id: string) => Promise<{ ok: boolean; next?: StatusKey }>;
};

export default function NextStatusButton({
  id,
  currentStatus,
  onConfirm,
}: Props) {
  const [optimistic, setOptimistic] = useState<StatusKey | null>(null);
  const [isPending, startTransition] = useTransition();
  const [toast, setToast] = useState<string | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);

  // الحالة الحالية (بعد التطبيع) — نفضّل القيمة المتفائلة عند التحديث
  const current: StatusKey = optimistic ?? normalizeStatus(currentStatus);

  // احسب المرحلة التالية
  const next: StatusKey | null = useMemo(
    () => getNextStatus(current),
    [current]
  );

  // نص الزر واللون بحسب "المرحلة القادمة"
  const label = next ? NEXT_LABEL_BY_TARGET[next] ?? "التالي" : null;
  const colorClass =
    next && STATUSES[next]?.color ? STATUSES[next].color : "bg-neutral-400";
  const disabled = !next || isPending;

  const confirmAndRun = () => {
    if (!next || disabled) return;

    // تحديث تفاؤلي
    setOptimistic(next);

    startTransition(async () => {
      try {
        const res = await onConfirm(id);
        if (!res.ok) {
          setOptimistic(null);
          setToast("تعذر تحديث الحالة. حاول مجددًا.");
          setTimeout(() => setToast(null), 2200);
          return;
        }
        setToast("تم التحديث بنجاح ✅");
        setTimeout(() => setToast(null), 1500);
      } catch {
        setOptimistic(null);
        setToast("حدث خطأ غير متوقع.");
        setTimeout(() => setToast(null), 2200);
      } finally {
        setShowConfirm(false);
      }
    });
  };

  if (!label) {
    // لا نعرض زر إذا وصلت المرحلة النهائية أو حالة خارج التدفق
    return (
      <button
        type="button"
        className="px-3 py-2 rounded-xl border border-neutral-300 text-neutral-400 cursor-not-allowed"
        disabled
        title="لا يوجد مرحلة لاحقة"
      >
        — لا يوجد مرحلة لاحقة —
      </button>
    );
  }

  return (
    <div className="relative">
      {/* زر الإجراء */}
      <button
        type="button"
        onClick={() => setShowConfirm(true)}
        disabled={disabled}
        className={`inline-flex items-center gap-2 ${colorClass} text-white px-3 py-2 rounded-xl shadow-sm disabled:opacity-60`}
        title={`تحديث إلى: ${STATUSES[next!].label}`}
      >
        {isPending && (
          <svg
            className="h-4 w-4 animate-spin"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
          </svg>
        )}
        <span>{label}</span>
      </button>

      {/* توست بسيط */}
      {toast && (
        <div className="absolute -bottom-11 left-0 z-10 rounded-lg bg-black/80 text-white text-xs px-3 py-1">
          {toast}
        </div>
      )}

      {/* Popup تأكيد */}
      {showConfirm && next && (
        <>
          {/* خلفية شفافة */}
          <div
            className="fixed inset-0 bg-black/30 z-[60]"
            onClick={() => !isPending && setShowConfirm(false)}
          />
          {/* نافذة التأكيد */}
          <div className="fixed inset-0 z-[61] flex items-center justify-center p-4">
            <div className="w-full max-w-sm rounded-2xl border bg-white shadow-xl">
              <div className={`h-1 w-full rounded-t-2xl ${colorClass}`} />
              <div className="p-5">
                <h3 className="text-base font-semibold mb-1">تأكيد العملية</h3>
                <p className="text-sm text-neutral-600">
                  سيتم تحديث الحالة إلى:{" "}
                  <span className="font-medium">{STATUSES[next].label}</span>
                </p>
                <div className="mt-5 flex items-center justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setShowConfirm(false)}
                    disabled={isPending}
                    className="px-3 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50 disabled:opacity-60"
                  >
                    إلغاء
                  </button>
                  <button
                    type="button"
                    onClick={confirmAndRun}
                    disabled={isPending}
                    className={`px-3 py-2 rounded-xl text-white ${colorClass} disabled:opacity-60`}
                  >
                    تأكيد
                  </button>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
