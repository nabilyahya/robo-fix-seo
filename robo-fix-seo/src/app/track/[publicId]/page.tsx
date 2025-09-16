import StatusBadge, {
  type StatusKey,
  normalizeStatus,
  STATUSES,
} from "@/components/StatusBadge";
import { findRowByPublicId } from "@/lib/sheets";
import { formatSheetDate } from "@/lib/date";

type NextPageProps<P extends Record<string, any> = {}> = {
  params: Promise<P>;
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export const metadata = { title: "Robonarim | Sipariş Takibi" };

export default async function Page({
  params,
  searchParams,
}: NextPageProps<{ publicId: string }>) {
  const { publicId } = await params;
  const sp = (await searchParams) || {};
  const { row } = await findRowByPublicId(publicId);
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
  const entered = (typeof sp.pass === "string" ? sp.pass : "").trim();
  const ok = !needsPass || (entered && entered === String(passCode).trim());

  const status = (normalizeStatus(statusRaw as string) ||
    "picked_up") as StatusKey;
  const statusLabel = STATUSES[status]?.label ?? "—";

  return (
    <div className="px-4 py-6 max-w-2xl mx-auto">
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
          <div className="rounded-3xl bg-gradient-to-br from-emerald-50 to-emerald-100 border border-emerald-200 p-5 mb-4">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-sm text-emerald-700">Takip Numarası</div>
                <div className="text-lg font-bold tracking-wide">
                  {publicId}
                </div>
              </div>
              <StatusBadge status={status} />
            </div>
            <p className="mt-3 text-neutral-700">
              Durumunuz düzenli olarak güncellenir.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Card title="Müşteri Adı" value={name || "—"} />
            <Card title="Durum" value={statusLabel} />
            <Card title="Cihaz" value={deviceType || "—"} />
            <Card title="Arıza" value={issue || "—"} />
            <Card title="Adres" value={address || "—"} />
          </div>

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
        </>
      )}
    </div>
  );
}

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
