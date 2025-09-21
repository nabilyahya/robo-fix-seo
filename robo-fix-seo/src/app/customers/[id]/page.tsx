import StatusBadge, {
  STATUSES,
  type StatusKey,
  normalizeStatus,
} from "@/components/StatusBadge";
import {
  findRowById,
  updateCells,
  SHEET_NAME,
  sheetsClient,
} from "@/lib/sheets";
import { formatSheetDate } from "@/lib/date";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const OPTIONS = Object.keys(STATUSES) as StatusKey[];

export const metadata = { title: "Robonarim | ملف عميل" };

/* ========= Helpers ========= */
function joinAddress(
  il: string,
  ilce: string,
  mahalle: string,
  sokak: string,
  apNo: string,
  daireNo: string
) {
  const l1 = [il, ilce].filter(Boolean).join(" / ");
  const parts: string[] = [];
  if (mahalle) parts.push(mahalle);
  if (sokak) parts.push(`Sokak ${sokak}`);
  if (apNo) parts.push(`Ap No ${apNo}`);
  if (daireNo) parts.push(`Daire ${daireNo}`);
  const l2 = parts.join(" • ");
  return [l1, l2].filter(Boolean).join(" — ");
}

/** ====== Server Action: حفظ جميع الحقول ====== */
async function saveAllAction(id: string, formData: FormData): Promise<void> {
  "use server";

  const { rowIndex, row } = await findRowById(id);
  if (!row || rowIndex < 0) throw new Error("Customer not found");

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  const deviceType = String(formData.get("deviceType") ?? "").trim();
  const issue = String(formData.get("issue") ?? "").trim();
  const repairCost = String(formData.get("repairCost") ?? "").trim();
  const statusRaw = String(formData.get("status") ?? "");
  const status = statusRaw as StatusKey;
  if (!OPTIONS.includes(status)) throw new Error("Invalid status value");

  // العنوان المفصّل
  const il = String(formData.get("il") ?? "").trim();
  const ilce = String(formData.get("ilce") ?? "").trim();
  const mahalle = String(formData.get("mahalle") ?? "").trim();
  const sokak = String(formData.get("sokak") ?? "").trim();
  const apNo = String(formData.get("apNo") ?? "").trim();
  const daireNo = String(formData.get("daireNo") ?? "").trim();

  // نحدّث العمود D بصيغة مجمّعة للتوافق
  const addressCombined = joinAddress(il, ilce, mahalle, sokak, apNo, daireNo);

  // B..G (ملحوظة: D = addressCombined)
  await updateCells(`'${SHEET_NAME}'!B${rowIndex}:G${rowIndex}`, [
    [name, phone, addressCombined, deviceType, issue, repairCost],
  ]);

  // Q..V: العنوان المفصّل
  await updateCells(`'${SHEET_NAME}'!Q${rowIndex}:V${rowIndex}`, [
    [il, ilce, mahalle, sokak, apNo, daireNo],
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
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { rowIndex, row } = await findRowById(id);
  if (!row || rowIndex < 0)
    return <div className="p-8">غير موجود (ID: {id})</div>;

  // A..L حسب التخطيط الحالي
  const [
    _id,
    name,
    phone,
    address, // D (مجمّع قديم)
    deviceType,
    issue,
    repairCost,
    status,
    createdAt, // I
    updatedAt, // J
    _publicId, // K (رقم الفيش — لم نعد نستخدمه للتتبّع)
    passCode, // L ✅ رمز الفيش (رقم التتبّع)
  ] = (row as any[]).map((x) => (x ?? "").toString());

  // قراءة العنوان المفصّل من Q..V لملء القيم الافتراضية
  const sheets = await sheetsClient();
  const addrRes = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.GOOGLE_SHEETS_ID!,
    range: `'${SHEET_NAME}'!Q${rowIndex}:V${rowIndex}`,
  });
  const [Q, R, S, T, U, V] = ((addrRes.data.values?.[0] ?? []) as string[]).map(
    (x) => x ?? ""
  );
  const il = Q || "";
  const ilce = R || "";
  const mahalle = S || "";
  const sokak = T || "";
  const apNo = U || "";
  const daireNo = V || "";

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
            href={`/track/${passCode || ""}`} // ✅ الرمز من العمود L
            target="_blank"
          >
            /track/{passCode || "—"}
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

          {/* عنوان مفصّل Q..V */}
          <fieldset className="md:col-span-2">
            <legend className="text-sm text-neutral-600 mb-2">
              العنوان (İl / İlçe / Mahalle / Sokak / Ap / Daire)
            </legend>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-3">
              <Input name="il" label="İl" defaultValue={il} />
              <Input name="ilce" label="İlçe" defaultValue={ilce} />
              <Input name="mahalle" label="Mahalle" defaultValue={mahalle} />
              <Input name="sokak" label="Sokak" defaultValue={sokak} />
              <Input name="apNo" label="Ap No" defaultValue={apNo} />
              <Input name="daireNo" label="Daire No" defaultValue={daireNo} />
            </div>
            <div className="text-xs text-neutral-500 mt-1">
              يتم أيضًا توليد حقل العنوان القديم (D) تلقائيًا من هذه القيم.
            </div>
          </fieldset>

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
