"use client";
import { useTransition, useState } from "react";

import { createCustomer } from "@/app/customers/create/actions";
import Spinner from "@/components/Spinner";

export default function CustomerForm() {
  const [isPending, start] = useTransition();
  const [result, setResult] = useState<{
    publicId: string;
    pass: string;
  } | null>(null);

  return (
    <div className="max-w-2xl mx-auto">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget as HTMLFormElement);
          start(async () => {
            const res = await createCustomer(fd);
            setResult(res);
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
      </form>

      {result && (
        <div className="mt-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200">
          <div className="font-medium">تم إنشاء العميل بنجاح ✅</div>
          <div className="text-sm mt-2">
            رابط التتبع:{" "}
            <a
              className="underline"
              href={`/track/${result.publicId}`}
              target="_blank"
            >
              /track/{result.publicId}
            </a>
          </div>
          <div className="text-sm mt-1">
            كلمة المرور (اعرضها مرة واحدة للعميل):{" "}
            <span className="font-mono">{result.pass}</span>
          </div>
        </div>
      )}
    </div>
  );
}
