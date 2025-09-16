// src/app/track/[publicId]/page.tsx
import StatusBadge, {
  type StatusKey,
  normalizeStatus,
  STATUSES,
} from "@/components/StatusBadge";
import { findRowByPublicId } from "@/lib/sheets";
import { formatSheetDate } from "@/lib/date";

export const metadata = { title: "Robonarim | Sipariş Takibi" };

/**
 * Sayfa, K sütunundaki publicId ile arama yapar ve
 * L sütunundaki şifre (passCode) varsa giriş ister.
 *
 * Sayfa düzeni (senin tablon):
 * A id, B name, C phone, D address, E device, F issue, G cost,
 * H status, I createdAt, J lastUpdated (opsiyonel/boş olabilir),
 * K publicId, L passCode
 */
export default async function Page({
  params,
  searchParams,
}: {
  params: { publicId: string };
  searchParams?: { pass?: string };
}) {
  const { row } = await findRowByPublicId(params.publicId);
  if (!row) return <div className="p-6">Bağlantı geçersiz.</div>;

  const [
    _id,
    name,
    _phone,
    address,
    deviceType,
    issue,
    _cost,
    statusRaw,
    createdAt,
    lastUpdated,
    _publicId, // K
    passCode, // L
  ] = row as any[];

  const needsPass = Boolean((passCode ?? "").toString().trim());
  const entered = (searchParams?.pass ?? "").trim();
  const ok = !needsPass || (entered && entered === String(passCode).trim());

  const status = (normalizeStatus(statusRaw as string) ||
    "picked_up") as StatusKey;
  const statusLabel = STATUSES[status]?.label ?? "—";

  // Duruma göre kısa açıklama (TR)
  const statusHint: Record<string, string> = {
    picked_up: "Cihazınız teslim alındı, ön kontroller yapılıyor.",
    checking: "Teknik ekibimiz arıza tespiti yapıyor.",
    checked_waiting_ok:
      "Tespit tamamlandı — devam etmek için onayınızı bekliyoruz.",
    approved_repairing: "Onay alındı — şu anda onarım sürecinde.",
    repaired_waiting_del: "Onarım tamamlandı — teslimat planlanıyor.",
    delivered_success: "Teslimat başarıyla gerçekleştirildi. İyi kullanımlar!",
    canceled: "İşlem iptal edildi.",
  };

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
      {/* Parola kapısı */}
      {needsPass && !ok ? (
        <div className="bg-white border rounded-2xl p-5 shadow-sm">
          <h1 className="text-xl font-bold mb-2">Cihaz Durumu</h1>
          <p className="text-neutral-600 mb-4">
            Detaylara erişmek için lütfen parolanızı girin.
          </p>
          <form method="get" className="flex items-center gap-3">
            <input
              name="pass"
              defaultValue={entered}
              placeholder="Parola"
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              inputMode="numeric"
            />
            <button className="px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
              Görüntüle
            </button>
          </form>
          {entered && entered !== String(passCode).trim() && (
            <div className="mt-3 text-sm text-red-600">Parola yanlış.</div>
          )}
        </div>
      ) : (
        <>
          {/* Hero */}
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-5 mb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-emerald-700">Takip Numarası</div>
                <div className="text-lg font-bold tracking-wide">
                  {params.publicId}
                </div>
              </div>
              <StatusBadge status={status} />
            </div>
            <p className="mt-3 text-neutral-700">
              {statusHint[status] ?? "Durumunuz düzenli olarak güncellenir."}
            </p>
          </div>

          {/* Özet kartları (mobil uyumlu) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Card title="Müşteri Adı" value={name || "—"} />
            <Card title="Durum" value={statusLabel} />
            <Card title="Cihaz" value={deviceType || "—"} />
            <Card title="Arıza" value={issue || "—"} />
            <Card title="Adres" value={address || "—"} />
          </div>

          {/* Zaman bilgisi */}
          <div className="bg-white border rounded-2xl p-5 shadow-sm">
            <h2 className="text-base font-semibold mb-3">Zaman Çizelgesi</h2>
            <ul className="space-y-3">
              <TimelineItem
                label="Oluşturulma"
                value={formatSheetDate(createdAt)}
              />
              <TimelineItem
                label="Son güncelleme"
                value={formatSheetDate(lastUpdated || createdAt)}
              />
            </ul>
          </div>

          <div className="mt-4 text-sm text-neutral-600">
            Bu sayfa güncel durumları yansıtır. Takip numaranızı saklamayı
            unutmayın.
          </div>
        </>
      )}
    </div>
  );
}

/* Küçük yardımcı bileşenler */
function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white border rounded-2xl p-4 shadow-sm">
      <div className="text-sm text-neutral-500">{title}</div>
      <div className="font-medium mt-1 break-words">{value}</div>
    </div>
  );
}

function TimelineItem({ label, value }: { label: string; value: string }) {
  return (
    <li className="flex items-start gap-3">
      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
      <div>
        <div className="text-sm text-neutral-500">{label}</div>
        <div className="font-medium">{value || "—"}</div>
      </div>
    </li>
  );
}
