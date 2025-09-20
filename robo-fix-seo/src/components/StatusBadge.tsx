// src/components/StatusBadge.tsx

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

  // ✅ حالات المرتجع الجديدة
  return_waiting_del: {
    label: "مرتجع – بانتظار التوصيل",
    color: "bg-fuchsia-600",
  },
  return_delivered: {
    label: "تم توصيل المرتجع",
    color: "bg-emerald-700",
  },

  delivered_success: { label: "تم التوصيل – نجاح", color: "bg-emerald-600" },
} as const;

export type StatusKey = keyof typeof STATUSES;

// TR labels (عرض فقط)
const TR_LABELS: Record<StatusKey, string> = {
  pending_picked_up: "Alım bekleniyor",
  picked_up: "Cihaz teslim alındı",
  canceled: "İşlem iptal edildi",
  checking: "İnceleme yapılıyor",
  checked_waiting_ok: "İnceleme tamamlandı – onay bekleniyor",
  approved_repairing: "Onaylandı – onarım sürüyor",
  repaired_waiting_del: "Onarım tamamlandı – teslimat bekliyor",

  // ✅
  return_waiting_del: "İade – teslimat bekliyor",
  return_delivered: "İade müşteriye teslim edildi",

  delivered_success: "Teslimat başarıyla gerçekleştirildi",
};

/** تحويل أي قيمة نصية (عربي/تركي/قديمة) إلى مفتاح StatusKey صالح */
export function normalizeStatus(input?: string | null): StatusKey {
  const fallback: StatusKey = "picked_up";
  if (!input) return fallback;

  if ((Object.keys(STATUSES) as StatusKey[]).includes(input as StatusKey)) {
    return input as StatusKey;
  }

  const s = String(input).trim().toLowerCase();

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

    // ✅ المرتجع
    "مرتجع بانتظار التوصيل": "return_waiting_del",
    "مرتجع – بانتظار التوصيل": "return_waiting_del",
    "تم توصيل المرتجع": "return_delivered",
  };
  if (exactAr[input]) return exactAr[input];

  // Heuristics: AR/TR
  if (s.includes("مرتجع") || s.includes("iade")) {
    if (s.includes("بانتظار") || s.includes("bekliyor"))
      return "return_waiting_del";
    if (s.includes("تم توصيل") || s.includes("teslim edildi"))
      return "return_delivered";
  }

  if (s.includes("جلب")) return "picked_up";
  if (s.includes("فحص"))
    return s.includes("جار") ? "checking" : "checked_waiting_ok";
  if (s.includes("موافق")) return "approved_repairing";
  if (s.includes("تصليح") || s.includes("صيانة")) return "approved_repairing";
  if (s.includes("توصيل")) return "repaired_waiting_del";
  if (s.includes("نجاح")) return "delivered_success";

  if (s.includes("inceleme"))
    return s.includes("devam") ? "checking" : "checked_waiting_ok";
  if (s.includes("onay")) return "approved_repairing";
  if (s.includes("tamir")) return "approved_repairing";
  if (s.includes("teslim"))
    return s.includes("beklen") ? "repaired_waiting_del" : "delivered_success";
  if (s.includes("iptal")) return "canceled";
  if (s.includes("alım") && s.includes("beklen")) return "pending_picked_up";

  return fallback;
}

export function getStatusLabel(
  key: StatusKey,
  locale: "ar" | "tr" = "ar"
): string {
  if (locale === "tr") return TR_LABELS[key];
  return STATUSES[key].label;
}

export default function StatusBadge({
  status,
  locale = "ar",
}: {
  status: string | StatusKey;
  locale?: "ar" | "tr";
}) {
  const key = normalizeStatus(status);
  const color = STATUSES[key].color;
  const label = getStatusLabel(key, locale);

  return (
    <span
      className={`inline-flex items-center gap-2 ${color} text-white px-3 py-1 rounded-full text-xs`}
    >
      {label}
    </span>
  );
}
