"use client";

import { useTransition, useState } from "react";
import { useRouter } from "next/navigation";
import { createCustomer } from "@/app/customers/create/actions";
import Spinner from "@/components/Spinner";

type CreateResult = {
  publicId: string;
  pass: string;
  pdfDirectUrl: string | null;
  pdfViewUrl: string | null;
};

export default function CustomerForm() {
  const router = useRouter();
  const [isPending, start] = useTransition();
  const [result, setResult] = useState<CreateResult | null>(null);
  const [err, setErr] = useState<string | null>(null);

  // نقفل كل شيء أثناء الإرسال أو بعد النجاح
  const locked = isPending || !!result;

  return (
    <div className="max-w-2xl mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (locked) return; // منع الإرسال المكرر
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
              // ما بنعمل reset للفورم: بدنا المستخدم يضغط زر "إضافة عميل جديد"
            } catch (e: any) {
              setErr(e?.message || "تعذر إنشاء العميل. حاول لاحقًا.");
            }
          });
        }}
        className="grid grid-cols-1 gap-4 bg-white p-6 rounded-2xl shadow border"
      >
        <fieldset
          className="grid grid-cols-1 md:grid-cols-2 gap-4"
          disabled={locked}
        >
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
            placeholder="نوع الجهاز / الموديل"
            className="input"
            required
          />
          <input name="issue" placeholder="العطل" className="input" required />

          {/* الرقم التسلسلي (اختياري) */}
          <input
            name="deviceSN"
            placeholder="الرقم التسلسلي (اختياري)"
            className="input"
          />

          {/* الملحقات (select) */}
          <select name="deviceAccessories" className="input">
            <option value="">لا شيء</option>
            <option value="Şarj istasyonu ve kablo">
              Şarj istasyonu ve kablo
            </option>
          </select>

          <input
            name="repairCost"
            placeholder="التكلفة التقديرية (اختياري)"
            className="input md:col-span-2"
          />
        </fieldset>

        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            name="whatsappOptIn"
            defaultChecked
            className="accent-emerald-600"
            disabled={locked}
          />
          موافقة على مراسلة واتساب
        </label>

        {/* زر الحفظ: يُقفل أثناء الإرسال وبعد النجاح */}
        <button
          disabled={locked}
          aria-disabled={locked}
          className={`btn-primary ${
            locked ? "opacity-60 cursor-not-allowed" : ""
          }`}
        >
          {isPending ? (
            <span className="inline-flex items-center gap-2">
              <Spinner /> جاري إنشاء العميل…
            </span>
          ) : result ? (
            "تم الحفظ"
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

            {/* زر إضافة عميل جديد: يعمل refresh للصفحة */}
            <button
              onClick={() => router.refresh()}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700"
            >
              ⟲ إضافة عميل جديد
            </button>
          </div>

          <div className="text-xs text-slate-600 mt-2">
            لإضافة عميل آخر، اضغط زر <strong>“إضافة عميل جديد”</strong> لتحديث
            الصفحة وإعادة ضبط النموذج.
          </div>
        </div>
      )}
    </div>
  );
}
