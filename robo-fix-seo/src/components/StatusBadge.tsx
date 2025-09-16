// src/app/customers/StatusBadge.tsx  (أو src/components/StatusBadge.tsx حسب مكانك)

export const STATUSES = {
  pending_picked_up: { label: "بانتظار الجلب", color: "bg-blue-600" },
  picked_up: { label: "تم جلب الجهاز", color: "bg-blue-600" },
  canceled: { label: "تم الغاء الطلب", color: "bg-red-600" },
  checking: { label: "جارِ الفحص", color: "bg-amber-500" },
  checked_waiting_ok: {
    label: "تم الفحص – بانتظار الموافقة",
    color: "bg-yellow-600",
  },
  approved_repairing: {
    label: "تمت الموافقة – جارِ التصليح",
    color: "bg-cyan-600",
  },
  repaired_waiting_del: {
    label: "تم التصليح – بانتظار التوصيل",
    color: "bg-purple-600",
  },
  delivered_success: { label: "تم التوصيل – نجاح", color: "bg-emerald-600" },
} as const;

export type StatusKey = keyof typeof STATUSES;

/** تحويل أي قيمة نصية (عربية/تركية/قديمة) إلى مفتاح StatusKey صالح */
export function normalizeStatus(input?: string | null): StatusKey {
  const fallback: StatusKey = "picked_up";
  if (!input) return fallback;

  // لو وصلت القيمة أصلاً مفتاح صحيح
  if ((Object.keys(STATUSES) as StatusKey[]).includes(input as StatusKey)) {
    return input as StatusKey;
  }

  // تحضير نص للمطابقة
  const s = String(input).trim().toLowerCase();

  // مطابقة مباشرة شائعة بالعربي
  const exactAr: Record<string, StatusKey> = {
    "بانتظار الجلب": "pending_picked_up",
    "تم جلب الجهاز": "picked_up",
    "جار الفحص": "checking",
    "جارِ الفحص": "checking",
    "تم الفحص": "checked_waiting_ok",
    "تم الفحص بانتظار الموافقة": "checked_waiting_ok",
    "تمت الموافقة": "approved_repairing",
    "جار التصليح": "approved_repairing",
    "تم التصليح": "repaired_waiting_del",
    "تم التصليح بانتظار التوصيل": "repaired_waiting_del",
    "تم التوصيل نجاح": "delivered_success",
    "تم الغاء الطلب": "canceled",
  };
  if (exactAr[input]) return exactAr[input];

  // هيوريستكس بالعربي/تركي
  if (s.includes("جلب")) return "picked_up";
  if (s.includes("فحص"))
    return s.includes("جار") ? "checking" : "checked_waiting_ok";
  if (s.includes("موافق")) return "approved_repairing";
  if (s.includes("تصليح") || s.includes("صيانة")) return "approved_repairing";
  if (s.includes("توصيل")) return "repaired_waiting_del";
  if (s.includes("نجاح")) return "delivered_success";

  // تركي شائع
  if (s.includes("inceleme"))
    return s.includes("devam") ? "checking" : "checked_waiting_ok";
  if (s.includes("onay")) return "approved_repairing";
  if (s.includes("tamir")) return "approved_repairing";
  if (s.includes("teslim"))
    return s.includes("bekleniyor")
      ? "repaired_waiting_del"
      : "delivered_success";

  return fallback;
}

export default function StatusBadge({
  status,
}: {
  status: string | StatusKey;
}) {
  const key = normalizeStatus(status);
  const s = STATUSES[key]; // مضمون أنه موجود الآن
  return (
    <span
      className={`inline-flex items-center gap-2 ${s.color} text-white px-3 py-1 rounded-full text-xs`}
    >
      {s.label}
    </span>
  );
}
