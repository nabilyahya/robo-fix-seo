import StatusBadge, {
  STATUSES,
  type StatusKey,
  normalizeStatus,
} from "@/components/StatusBadge";
import { findRowById, updateCells, SHEET_NAME } from "@/lib/sheets";
import { formatSheetDate } from "@/lib/date";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const OPTIONS = Object.keys(STATUSES) as StatusKey[];

export const metadata = { title: "Robonarim | ملف عميل" };

/** ====== Server Action: حفظ جميع الحقول ====== */
async function saveAllAction(id: string, formData: FormData): Promise<void> {
  "use server";

  const { rowIndex, row } = await findRowById(id);
  if (!row || rowIndex < 0) throw new Error("Customer not found");

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const address = String(formData.get("address") ?? "").trim();
  const deviceType = String(formData.get("deviceType") ?? "").trim();
  const issue = String(formData.get("issue") ?? "").trim();
  const repairCost = String(formData.get("repairCost") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "");
  const status = statusRaw as StatusKey;
  if (!OPTIONS.includes(status)) throw new Error("Invalid status value");

  // B..G
  await updateCells(`'${SHEET_NAME}'!B${rowIndex}:G${rowIndex}`, [
    [name, phone, address, deviceType, issue, repairCost],
  ]);

  // H: الحالة
  await updateCells(`'${SHEET_NAME}'!H${rowIndex}:H${rowIndex}`, [[status]]);

  // J: آخر تحديث
  await updateCells(`'${SHEET_NAME}'!J${rowIndex}:J${rowIndex}`, [
    [new Date().toISOString()],
  ]);

  revalidatePath(`/customers/${id}`);
  revalidatePath(`/customers`);
  redirect("/customers?updated=1");
}

/** ====== صفحة التفاصيل ====== */
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>; // ✅ Next 15 expects Promise here
}) {
  const { id } = await params; // ✅
  const { row } = await findRowById(id);
  if (!row) return <div className="p-8">غير موجود (ID: {id})</div>;

  // A: id, B: name, C: phone, D: address, E: deviceType, F: issue, G: repairCost,
  // H: status, I: createdAt, J: updatedAt, K: publicId, L: passCode
  const [
    _id,
    name,
    phone,
    address,
    deviceType,
    issue,
    repairCost,
    status,
    createdAt, // I
    updatedAt, // J
    publicId, // K
  ] = row as any[];

  const normalizedStatus = normalizeStatus(status as string);

  return (
    <div className="px-4 py-8 max-w-5xl mx-auto">
      {/* رأس الصفحة */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold">{name || "عميل بدون اسم"}</h1>
          <div className="text-sm text-neutral-600 mt-1">
            رقم الطلب الداخلي: <span className="font-mono">{id}</span>
          </div>
        </div>
        <StatusBadge status={normalizedStatus} />
      </div>

      {/* بطاقات معلومات */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white border rounded-2xl p-4">
          <div className="text-sm text-neutral-500">أُنشئ في</div>
          <div className="font-medium">{formatSheetDate(createdAt)}</div>
        </div>
        <div className="bg-white border rounded-2xl p-4">
          <div className="text-sm text-neutral-500">آخر تحديث</div>
          <div className="font-medium">{formatSheetDate(updatedAt)}</div>
        </div>
        <div className="bg-white border rounded-2xl p-4">
          <div className="text-sm text-neutral-500">رابط التتبّع</div>
          <a
            className="font-medium underline"
            href={`/track/${publicId || ""}`}
            target="_blank"
          >
            /track/{publicId || "—"}
          </a>
        </div>
      </div>

      {/* فورم التعديل */}
      <form
        action={saveAllAction.bind(null, id)}
        className="bg-white border rounded-2xl p-6 shadow"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input name="name" label="اسم العميل" defaultValue={name} />
          <Input name="phone" label="الهاتف" defaultValue={phone} />
          <div className="md:col-span-2">
            <Input name="address" label="العنوان" defaultValue={address} />
          </div>
          <Input
            name="deviceType"
            label="نوع الجهاز"
            defaultValue={deviceType}
          />
          <Input name="issue" label="العطل" defaultValue={issue} />
          <Input
            name="repairCost"
            label="تكلفة الصيانة (مبدئية)"
            defaultValue={repairCost}
          />

          <div>
            <label className="block text-sm text-neutral-600 mb-1">
              الحالة
            </label>
            <select
              name="status"
              defaultValue={normalizedStatus}
              className="w-full px-3 py-2 rounded-xl border border-neutral-300 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              {OPTIONS.map((k) => (
                <option key={k} value={k}>
                  {STATUSES[k].label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-6 flex items-center justify-end gap-3">
          <a
            href="/customers"
            className="px-4 py-2 rounded-xl border border-neutral-300 hover:bg-neutral-50"
          >
            رجوع
          </a>
          <button className="px-5 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
            حفظ التغييرات
          </button>
        </div>
      </form>
    </div>
  );
}

function Input({
  name,
  label,
  defaultValue,
}: {
  name: string;
  label: string;
  defaultValue?: string;
}) {
  return (
    <div>
      <label className="block text-sm text-neutral-600 mb-1">{label}</label>
      <input
        name={name}
        defaultValue={defaultValue}
        className="w-full px-3 py-2 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
      />
    </div>
  );
}
