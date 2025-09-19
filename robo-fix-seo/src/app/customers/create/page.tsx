// app/customers/create/page.tsx
export const runtime = "nodejs";

import Link from "next/link";
import CustomerForm from "../CustomerForm";

export const metadata = { title: "Robonarim | إنشاء عميل" };

export default function Page() {
  return (
    <div className="px-4 py-8 max-w-5xl mx-auto">
      {/* شريط علوي: عنوان + زر رجوع */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <h1 className="text-2xl font-bold">إنشاء عميل جديد</h1>
        <Link
          href="/customers"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700"
        >
          ← الرجوع إلى العملاء
        </Link>
      </div>

      <p className="text-neutral-600 mb-6">
        أدخل بيانات العميل وسيتم حفظها على Google Sheets تلقائياً.
      </p>

      <CustomerForm />
    </div>
  );
}
