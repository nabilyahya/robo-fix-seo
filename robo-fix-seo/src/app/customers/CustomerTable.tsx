import Link from "next/link";
import StatusBadge, {
  type StatusKey,
  normalizeStatus,
} from "@/components/StatusBadge";
import { formatSheetDate } from "@/lib/date";
import NextStatusButton from "@/components/NextStatusButton";
import { advanceStatusAction } from "./_actions";

type Row = any[];

export default function CustomerTable({ rows }: { rows: Row[] }) {
  return (
    <div className="space-y-4">
      {/* Mobile */}
      <ul className="md:hidden space-y-3">
        {rows?.map((r) => {
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

      {/* Desktop */}
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
            {rows?.map((r) => {
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
