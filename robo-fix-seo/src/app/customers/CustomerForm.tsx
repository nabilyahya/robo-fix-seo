// app/customers/CustomerForm.tsx
"use client";

import { useTransition, useState } from "react";
import { createCustomer } from "@/app/customers/create/actions";
import Spinner from "@/components/Spinner";

type CreateResult = {
  publicId: string;
  pass: string;
  pdfDirectUrl: string | null;
  pdfViewUrl: string | null;
};

export default function CustomerForm() {
  const [isPending, start] = useTransition();
  const [result, setResult] = useState<CreateResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  return (
    <div className="max-w-2xl mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          setErr(null);
          const fd = new FormData(e.currentTarget as HTMLFormElement);
          start(async () => {
            try {
              const res = (await createCustomer(fd)) as any;
              setResult({
                publicId: res.publicId,
                pass: res.pass,
                pdfDirectUrl: res.pdfDirectUrl,
                pdfViewUrl: res.pdfViewUrl,
              });
            } catch (e: any) {
              setErr(e?.message || "تعذر إنشاء العميل. حاول لاحقًا.");
            }
          });
        }}
        className="grid grid-cols-1 gap-4 bg-white p-6 rounded-2xl shadow border"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            placeholder="اسم العميل"
            className="input"
            required
          />
          <input
            name="phone"
            placeholder="الهاتف (مع رمز الدولة)"
            className="input"
            required
          />
          <input
            name="address"
            placeholder="العنوان"
            className="input md:col-span-2"
            required
          />
          <input
            name="deviceType"
            placeholder="نوع الجهاز"
            className="input"
            required
          />
          <input name="issue" placeholder="العطل" className="input" required />
          <input
            name="repairCost"
            placeholder="تكلفة الصيانة (اختياري)"
            className="input"
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="whatsappOptIn"
            defaultChecked
            className="accent-emerald-600"
          />
          موافقة على مراسلة واتساب
        </label>

        <button disabled={isPending} className="btn-primary">
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <Spinner /> جاري إنشاء العميل…
            </span>
          ) : (
            "حفظ"
          )}
        </button>

        {err && (
          <div className="rounded-xl border border-red-200 bg-red-50 text-red-700 px-3 py-2 text-sm">
            {err}
          </div>
        )}
      </form>

      {result && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="font-medium">تم إنشاء العميل بنجاح ✅</div>
          <div className="text-sm mt-2">
            رقم الفيش: <span className="font-mono">{result.publicId}</span>
          </div>
          <div className="text-sm mt-1">
            كلمة المرور (اعرضها مرة واحدة للعميل):{" "}
            <span className="font-mono">{result.pass}</span>
          </div>

          {/* أزرار PDF */}
          <div className="mt-4 flex items-center gap-3">
            {result.pdfDirectUrl ? (
              <a
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700"
                href={result.pdfDirectUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                تحميل PDF (Teslimat Fişi)
              </a>
            ) : (
              <span className="text-sm text-amber-700">
                ⚠️ تعذر توليد/رفع PDF الآن — يمكنك إعادة المحاولة لاحقًا.
              </span>
            )}

            {result.pdfViewUrl && (
              <a
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-emerald-600 text-emerald-700 hover:bg-emerald-50"
                href={result.pdfViewUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                فتح على Google Drive
              </a>
            )}
          </div>

          <div className="text-xs text-slate-600 mt-2">
            سيتم مشاركة الفيش كـ PDF — الرابط مباشر للتنزيل ومناسب للإرسال
            للعميل.
          </div>
        </div>
      )}
    </div>
  );
}
