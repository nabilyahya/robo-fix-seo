// src/app/customers/CustomerForm.tsx
"use client";

import { useTransition, useState, useRef } from "react";
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
  const formRef = useRef<HTMLFormElement>(null);

  function hardReloadSamePage() {
    if (typeof window !== "undefined") {
      window.location.replace(window.location.pathname);
    }
  }

  function softResetForm() {
    setResult(null);
    setErr(null);
    formRef.current?.reset();
    const firstInput = formRef.current?.querySelector(
      "input, select, textarea"
    ) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
    firstInput?.focus();
  }

  async function onSubmit(fd: FormData) {
    setErr(null);
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
  }

  return (
    <div className="max-w-2xl mx-auto">
      <form
        ref={formRef}
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          start(() => onSubmit(fd));
        }}
        className="grid grid-cols-1 gap-4 bg-white p-6 rounded-2xl shadow border"
      >
        {/* معلومات أساسية */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            name="name"
            placeholder="اسم العميل"
            className="input"
            required
            disabled={isPending}
          />
          <input
            name="phone"
            placeholder="الهاتف (مع رمز الدولة)"
            className="input"
            required
            disabled={isPending}
          />

          {/* ===== العنوان (مجزأ) ===== */}
          <div className="md:col-span-2">
            <div className="text-sm font-medium text-slate-700 mb-2">
              العنوان
            </div>
            <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
              <input
                name="il"
                defaultValue="Bursa"
                className="input md:col-span-2"
                readOnly
              />
              <input
                name="ilce"
                placeholder="İlçe (القضاء)"
                className="input md:col-span-2"
                required
                disabled={isPending}
              />
              <input
                name="mahalle"
                placeholder="Mahalle (الحي)"
                className="input md:col-span-2"
                required
                disabled={isPending}
              />

              <input
                name="sokak"
                placeholder="Sokak (الشارع)"
                className="input md:col-span-3"
                required
                disabled={isPending}
              />
              <input
                name="apNo"
                placeholder="Ap No (رقم البناء)"
                className="input md:col-span-1"
                disabled={isPending}
              />
              <input
                name="daireNo"
                placeholder="Daire No (رقم الشقة)"
                className="input md:col-span-2"
                disabled={isPending}
              />
            </div>
          </div>
          {/* ========================== */}

          <input
            name="deviceType"
            placeholder="نوع الجهاز / الموديل"
            className="input"
            required
            disabled={isPending}
          />
          <input
            name="issue"
            placeholder="العطل"
            className="input"
            required
            disabled={isPending}
          />

          {/* الرقم التسلسلي (اختياري) */}
          <input
            name="deviceSN"
            placeholder="الرقم التسلسلي (اختياري)"
            className="input"
            disabled={isPending}
          />

          {/* الملحقات (select) */}
          <select
            name="deviceAccessories"
            className="input"
            disabled={isPending}
          >
            <option value="">لا شيء</option>
            <option value="Şarj istasyonu ve kablo">
              Şarj istasyonu ve kablo
            </option>
          </select>

          <input
            name="repairCost"
            placeholder="التكلفة التقديرية (اختياري)"
            className="input md:col-span-2"
            disabled={isPending}
          />
        </div>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="whatsappOptIn"
            defaultChecked
            className="accent-emerald-600"
            disabled={isPending}
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
        <div className="mt-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200">
          <div className="font-medium">تم إنشاء العميل بنجاح ✅</div>
          <div className="text-sm mt-2">
            رقم الفيش: <span className="font-mono">{result.publicId}</span>
          </div>
          <div className="text-sm mt-1">
            الرمز (اعرضه مرة واحدة للعميل):{" "}
            <span className="font-mono">{result.pass}</span>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
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

            <button
              type="button"
              onClick={() =>
                navigator.clipboard?.writeText(result.pass).catch(() => {})
              }
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
              aria-label="نسخ الرمز"
              title="نسخ الرمز"
            >
              نسخ الرمز
            </button>

            <button
              type="button"
              onClick={hardReloadSamePage}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700"
              aria-label="بدء إدخال عميل جديد"
            >
              إضافة عميل جديد
            </button>

            {/* بديل بدون ريفريش */}
            {/* <button
              type="button"
              onClick={softResetForm}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-50"
            >
              إعادة الضبط بدون تحديث
            </button> */}
          </div>

          <div className="text-xs text-slate-600 mt-2">
            بعد الانتهاء من نسخ/مشاركة المعلومات، اضغط “إضافة عميل جديد” للبدء
            من جديد.
          </div>
        </div>
      )}
    </div>
  );
}
