import Link from "next/link";
import StatusBadge, {
  type StatusKey,
  normalizeStatus,
} from "@/components/StatusBadge";
import { formatSheetDate } from "@/lib/date";
import { readAll } from "@/lib/sheets";
import NextStatusButton from "@/components/NextStatusButton";
import { advanceStatusAction } from "./_actions";

export const metadata = { title: "Robonarim | العملاء" };

// ✅ Next 15 يعرّف searchParams كـ Promise
type NextPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

type Row = any[];

export default async function Page({ searchParams }: NextPageProps) {
  const sp = (await searchParams) || {};
  const updatedParam = sp.updated;
  const updated =
    typeof updatedParam === "string"
      ? updatedParam
      : Array.isArray(updatedParam)
      ? updatedParam[0]
      : undefined;

  const showSuccess = updated === "1";
  const { rows } = await readAll();

  return (
    <div className="px-4 py-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-2xl font-bold">قائمة العملاء</h1>
        <a
          className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
          href="/customers/create"
        >
          + عميل جديد
        </a>
      </div>

      {showSuccess && (
        <div className="mb-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800 flex items-center justify-between">
          <span>تم حفظ التغييرات بنجاح ✅</span>
          <a
            href="/customers"
            className="text-emerald-700 underline decoration-dotted"
            title="إخفاء"
          >
            إغلاق
          </a>
        </div>
      )}

      {rows.length === 0 ? (
        <div className="rounded-xl border p-6 bg-white">
          لا يوجد عملاء حتى الآن.
        </div>
      ) : (
        <CustomerTable rows={rows} />
      )}
    </div>
  );
}

/** ============== كومبوننت الجدول/الكروت ============== */
function CustomerTable({ rows }: { rows: Row[] }) {
  return (
    <div className="space-y-4">
      {/* Mobile cards (<= md) */}
      <ul className="md:hidden space-y-3">
        {rows.map((r) => {
          const id = r[0];
          const name = r[1] ?? "";
          const phone = r[2] ?? "";
          const address = r[3] ?? "";
          const device = r[4] ?? "";
          const issue = r[5] ?? "";
          const cost = r[6] ?? "";
          const rawStatus = (r[7] ?? "picked_up") as string;
          const createdRaw = r[8] ?? "";
          const updatedRaw = r[9] ?? "";

          const normalized = normalizeStatus(rawStatus) as StatusKey;

          return (
            <li
              key={id}
              className="rounded-2xl border bg-white p-4 shadow-sm hover:shadow transition"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="text-base font-semibold leading-6">
                    {name}
                  </div>
                  <div className="mt-1 text-sm text-neutral-600">{phone}</div>
                </div>
                <StatusBadge status={normalized} />
              </div>

              <div className="mt-3 grid grid-cols-1 gap-2 text-sm">
                <InfoRow label="العنوان" value={address} />
                <InfoRow label="الجهاز" value={device} />
                <InfoRow label="العطل" value={issue} />
                <InfoRow label="التكلفة" value={cost || "—"} />
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500">التواريخ</span>
                  <span className="text-neutral-800">
                    {formatSheetDate(createdRaw)} •{" "}
                    {formatSheetDate(updatedRaw)}
                  </span>
                </div>
              </div>

              {/* يسار: الزر للمرحلة التالية — يمين: فتح التفاصيل */}
              <div className="mt-4 flex items-center justify-between">
                <NextStatusButton
                  id={id}
                  currentStatus={rawStatus}
                  onConfirm={advanceStatusAction}
                />
                <Link
                  href={`/customers/${id}`}
                  className="px-3 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50"
                >
                  فتح التفاصيل
                </Link>
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop table (>= md) */}
      <div className="hidden md:block bg-white border rounded-2xl shadow overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-neutral-50">
            <tr className="text-left">
              <th className="p-3">العميل</th>
              <th className="p-3">الهاتف</th>
              <th className="p-3">العنوان</th>
              <th className="p-3">الجهاز</th>
              <th className="p-3">العطل</th>
              <th className="p-3">التكلفة</th>
              <th className="p-3">الحالة</th>
              <th className="p-3 whitespace-nowrap">تاريخ الإنشاء</th>
              <th className="p-3 whitespace-nowrap">آخر تحديث</th>
              <th className="p-3"></th>
              <th className="p-3"></th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => {
              const id = r[0];
              const name = r[1] ?? "";
              const phone = r[2] ?? "";
              const address = r[3] ?? "";
              const device = r[4] ?? "";
              const issue = r[5] ?? "";
              const cost = r[6] ?? "";
              const rawStatus = (r[7] ?? "picked_up") as string;
              const createdRaw = r[8] ?? "";
              const updatedRaw = r[9] ?? "";
              const normalized = normalizeStatus(rawStatus) as StatusKey;

              return (
                <tr key={id} className="border-t hover:bg-neutral-50">
                  <td className="p-3 font-medium">{name}</td>
                  <td className="p-3">{phone}</td>
                  <td className="p-3">{address}</td>
                  <td className="p-3">{device}</td>
                  <td className="p-3">{issue}</td>
                  <td className="p-3">{cost}</td>
                  <td className="p-3">
                    <StatusBadge status={normalized} />
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {formatSheetDate(createdRaw)}
                  </td>
                  <td className="p-3 whitespace-nowrap">
                    {formatSheetDate(updatedRaw)}
                  </td>
                  <td className="p-3">
                    <NextStatusButton
                      id={id}
                      currentStatus={rawStatus}
                      onConfirm={advanceStatusAction}
                    />
                  </td>
                  <td className="p-3 text-right">
                    <Link className="underline" href={`/customers/${id}`}>
                      فتح
                    </Link>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-neutral-500">{label}</span>
      <span className="text-neutral-900 text-right">{value || "—"}</span>
    </div>
  );
}
