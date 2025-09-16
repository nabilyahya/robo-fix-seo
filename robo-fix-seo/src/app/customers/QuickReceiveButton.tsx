// src/app/customers/QuickReceiveButton.tsx
"use client";

import { useState, useTransition } from "react";

export default function QuickReceiveButton({
  onConfirm,
}: {
  onConfirm: () => Promise<void>;
}) {
  const [isPending, start] = useTransition();
  const [ok, setOk] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={() => {
          setErr(null);
          start(async () => {
            try {
              await onConfirm();
              setOk(true);
              setTimeout(() => setOk(false), 2000);
            } catch (e: any) {
              setErr(e?.message || "حدث خطأ غير متوقع");
            }
          });
        }}
        className="px-3 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-60"
        disabled={isPending}
      >
        {isPending ? "جارِ التحديث..." : "تم الاستلام"}
      </button>

      {ok && <span className="text-emerald-700 text-sm">تم التحديث ✅</span>}
      {err && <span className="text-red-600 text-sm">{err}</span>}
    </div>
  );
}
