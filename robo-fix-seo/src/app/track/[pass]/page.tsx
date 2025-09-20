// src/app/track/[pass]/page.tsx
import StatusBadge, {
  type StatusKey,
  normalizeStatus,
  getStatusLabel,
} from "@/components/StatusBadge";
import { findRowByPassCode } from "@/lib/sheets";
import { formatSheetDate } from "@/lib/date";
import Image from "next/image";
import logo from "../../../../public/logo.png";

type NextPageProps<P extends Record<string, any> = {}> = {
  params: Promise<P>;
};

export const metadata = { title: "Robonarim | Sipariş Takibi" };

export default async function Page({
  params,
}: NextPageProps<{ pass: string }>) {
  const { pass } = await params;

  const { row } = await findRowByPassCode(pass);
  if (!row) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-4"
        style={{
          background:
            "radial-gradient(900px 520px at 100% -10%, rgba(38,198,218,.16), transparent 60%), radial-gradient(720px 480px at 0% 120%, rgba(30,136,229,.14), transparent 60%), linear-gradient(180deg,#f7fbff 0%,#f2f7fc 100%)",
          backgroundAttachment: "fixed",
        }}
      >
        <div className="max-w-md w-full bg-white border border-slate-200 rounded-3xl shadow-sm p-6 text-center">
          <div className="text-lg font-semibold mb-1">Bağlantı geçersiz</div>
          <p className="text-slate-600">
            Lütfen doğru fiş şifresi ile tekrar deneyin.
          </p>
        </div>
      </div>
    );
  }

  const [
    _id, // A
    name, // B
    _phone, // C
    address, // D
    deviceType, // E
    issue, // F
    _cost, // G
    statusRaw, // H
    createdAt, // I
    lastUpdated, // J
    publicId, // K (görüntüleme)
    _passCode, // L
    _colM, // M (varsa)
    returnReasonRaw, // N ✅ سبب المرتجع
  ] = row as any[];

  const status = (normalizeStatus(statusRaw as string) ||
    "picked_up") as StatusKey;
  const statusLabel = getStatusLabel(status, "tr");

  const isReturnFlow =
    status === "return_waiting_del" || status === "return_delivered";

  // عرض سبب المرتجع (TR)
  const returnReasonTr =
    returnReasonRaw === "price_disagreement"
      ? "Fiyat anlaşmazlığı"
      : returnReasonRaw === "no_parts"
      ? "Parça bulunamadı"
      : "";

  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(900px 520px at 100% -10%, rgba(38,198,218,.16), transparent 60%), radial-gradient(720px 480px at 0% 120%, rgba(30,136,229,.14), transparent 60%), linear-gradient(180deg,#f7fbff 0%,#f2f7fc 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-8 sm:py-12">
        {/* Brand Header */}
        <header className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-blue-200/60 to-cyan-200/60 blur-md" />
            <div className="relative rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_10px_40px_rgba(30,136,229,0.22)] p-1.5">
              <Image
                src={logo}
                alt="Robonarim Logo"
                width={44}
                height={44}
                className="rounded-xl"
                priority
              />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0f5ea8]">
              Robonarim
            </h1>
            <p className="text-sm text-slate-600">
              Kesin Teşhis • Hızlı Onarım • Bursa içi Kurye
            </p>
          </div>
        </header>

        {/* Status Banner */}
        <div className="rounded-3xl bg-white/70 backdrop-blur border border-emerald-200 shadow-sm p-5 mb-5">
          <div className="flex items-center justify-between gap-3">
            <div>
              <div className="text-xs uppercase tracking-wide text-emerald-700">
                Takip Numarası
              </div>
              <div className="text-lg font-bold tracking-wide">{publicId}</div>
            </div>
            <StatusBadge status={status} locale="tr" />
          </div>
          <p className="mt-3 text-neutral-700">
            Durumunuz düzenli olarak güncellenir.
          </p>

          {/* توضيح إضافي لمسار المرتجع */}
          {isReturnFlow && (
            <div className="mt-3 rounded-2xl border border-fuchsia-200 bg-fuchsia-50 text-fuchsia-900 p-3 text-sm">
              {status === "return_waiting_del"
                ? "İade süreci başlatıldı. Kuryemiz ürünü size teslim edecektir."
                : "İade teslimi tamamlandı."}
            </div>
          )}
        </div>

        {/* Info Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-5">
          <Card title="Müşteri Adı" value={name || "—"} />
          <Card title="Durum" value={statusLabel} />
          <Card title="Cihaz" value={deviceType || "—"} />
          <Card title="Arıza" value={issue || "—"} />
          {isReturnFlow && (
            <Card title="İade Nedeni" value={returnReasonTr || "—"} />
          )}
          <Card
            title="Adres"
            value={address || "—"}
            className="sm:col-span-2"
          />
        </div>

        {/* Timeline */}
        <div className="bg-white border rounded-3xl p-6 shadow-sm">
          <h2 className="text-base font-semibold mb-4 text-slate-800">
            Zaman Çizelgesi
          </h2>
          <ul className="relative pl-5 space-y-4">
            {/* dikey çizgi */}
            <span className="absolute left-2 top-0 bottom-0 w-px bg-emerald-200" />
            <TimelineItem
              label="Oluşturulma"
              value={formatSheetDate(createdAt)}
            />
            <TimelineItem
              label="Son güncelleme"
              value={formatSheetDate(lastUpdated || createdAt)}
            />
            {isReturnFlow && (
              <TimelineItem
                label="İade Durumu"
                value={
                  status === "return_waiting_del"
                    ? "Teslimat bekliyor"
                    : "İade müşteriye teslim edildi"
                }
              />
            )}
          </ul>

          {/* Bottom actions */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <a
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-br from-[#1e88e5] to-[#26c6da] text-white hover:opacity-95"
            >
              Ana sayfa
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ===== Presentational Bits ===== */
function Card({
  title,
  value,
  className = "",
}: {
  title: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`bg-white border rounded-2xl p-4 shadow-sm ${className}`}>
      <div className="text-sm text-neutral-500">{title}</div>
      <div className="font-medium mt-1 break-words">{value}</div>
    </div>
  );
}

function TimelineItem({ label, value }: { label: string; value: string }) {
  return (
    <li className="relative flex items-start gap-3">
      <span className="mt-1 h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
      <div>
        <div className="text-sm text-neutral-500">{label}</div>
        <div className="font-medium">{value || "—"}</div>
      </div>
    </li>
  );
}
