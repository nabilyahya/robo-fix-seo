// src/app/customers/CustomerTable.tsx
import Link from "next/link";
import StatusBadge, {
  type StatusKey,
  normalizeStatus,
} from "@/components/StatusBadge";
import { formatSheetDate } from "@/lib/date";
import { findRowById, updateCells, SHEET_NAME } from "@/lib/sheets";
import QuickReceiveButton from "./QuickReceiveButton";
import { revalidatePath } from "next/cache";

// ======= Server Action: تحديث الحالة إلى picked_up =======
export async function markReceivedAction(id: string): Promise<void> {
  "use server";
  const { rowIndex } = await findRowById(id);
  if (rowIndex < 0) throw new Error("Customer not found");
  await updateCells(`'${SHEET_NAME}'!H${rowIndex}:H${rowIndex}`, [
    ["picked_up"],
  ]);
  await updateCells(`'${SHEET_NAME}'!J${rowIndex}:J${rowIndex}`, [
    [new Date().toISOString()],
  ]);
  revalidatePath("/customers");
}

// هل العميل بمرحلة “بانتظار الجلب” بصيَغ عربية/تركية؟
function isAwaitingPickup(raw: string | undefined | null): boolean {
  if (!raw) return false;
  const s = String(raw).toLowerCase();
  if (s.includes("بانتظار") && s.includes("الجلب")) return true; // عربي
  if (s.includes("pickup") && (s.includes("wait") || s.includes("await")))
    return true; // EN
  if (s.includes("alım") && s.includes("beklen")) return true; // TR
  return (
    normalizeStatus(raw) !== "picked_up" &&
    (s.includes("بانتظار") || s.includes("beklen") || s.includes("await"))
  );
}

type Row = any[];

/**
 * الأعمدة المتوقعة:
 * A: ID | B: Name | C: Phone | D: Address | E: Device | F: Issue | G: Cost | H: Status | I/J/K: Dates
 */
export default function CustomerTable({ rows }: { rows: Row[] }) {
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
          const createdRaw = r[9] ?? r[8] ?? "";
          const updatedRaw = r[10] ?? "";

          const normalized = normalizeStatus(rawStatus) as StatusKey;
          const showQuickBtn = isAwaitingPickup(rawStatus);

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

              {/* هنا التعديل: زر تم الاستلام (يسار) + فتح التفاصيل (يمين) */}
              <div className="mt-4 flex items-center justify-between">
                {showQuickBtn ? (
                  <QuickReceiveButton
                    onConfirm={markReceivedAction.bind(null, id)}
                  />
                ) : (
                  <span /> /* مكان فارغ لحفظ التوازن إذا ما في زر سريع */
                )}

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
              <th className="p-3">تاريخ الإنشاء</th>
              <th className="p-3">آخر تحديث</th>
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
              const createdRaw = r[9] ?? r[8] ?? "";
              const updatedRaw = r[10] ?? "";

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
