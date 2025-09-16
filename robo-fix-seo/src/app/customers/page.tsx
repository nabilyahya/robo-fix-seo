// src/app/customers/page.tsx
import CustomerTable from "./CustomerTable";
import { readAll } from "@/lib/sheets";

export const metadata = { title: "Robonarim | العملاء" };

// ✅ Next 15 يعرّف searchParams كـ Promise
type NextPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

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
