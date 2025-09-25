"use client";

import { useState, useTransition } from "react";
import { createTxAction } from "../_actions";

export default function TxForm() {
  const [pending, start] = useTransition();
  const [open, setOpen] = useState(false); // ✅ إظهار/إخفاء على الموبايل فقط

  return (
    <div>
      {/* زر إظهار/إخفاء للموبايل فقط */}
      <div className="md:hidden mb-3">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls="txform-panel"
          className="flex w-full items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-white shadow-sm hover:opacity-90"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
            <path
              fill="currentColor"
              d={
                open
                  ? "M6 12a1 1 0 0 1 1-1h10a1 1 0 1 1 0 2H7a1 1 0 0 1-1-1Z" // رمز ناقص (إخفاء)
                  : "M12 5a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H6a1 1 0 1 1 0-2h5V6a1 1 0 0 1 1-1Z" // زائد (إظهار)
              }
            />
          </svg>
          <span className="text-sm font-medium">
            {open ? "إخفاء إضافة جديدة" : "إضافة حركة جديدة"}
          </span>
        </button>
      </div>

      {/* اللوحة: مخفية على الموبايل إذا open=false — ظاهرة دائمًا على md+ */}
      <div
        id="txform-panel"
        className={`${open ? "block" : "hidden"} md:block`}
      >
        <form
          action={(fd) => start(() => createTxAction(fd))}
          className="rounded-2xl border bg-white p-4 shadow-sm space-y-3"
        >
          <h2 className="font-semibold">إضافة حركة</h2>

          {/* نفس توزيع الحقول السابق بالضبط */}
          <div className="grid grid-cols-2 gap-3">
            <label className="text-sm">
              التاريخ
              <input
                name="date"
                type="date"
                className="mt-1 w-full rounded border px-2 py-1"
                required
              />
            </label>
            <label className="text-sm">
              النوع
              <select
                name="type"
                className="mt-1 w-full rounded border px-2 py-1"
                required
              >
                <option value="income">وارد</option>
                <option value="expense">مصروف</option>
              </select>
            </label>

            <label className="text-sm col-span-2">
              التصنيف
              <input
                name="category"
                placeholder="إيجار/كهرباء/مبيعات..."
                className="mt-1 w-full rounded border px-2 py-1"
                required
              />
            </label>

            <label className="text-sm">
              المبلغ
              <input
                name="amount"
                type="number"
                step="0.01"
                min="0"
                className="mt-1 w-full rounded border px-2 py-1"
                required
              />
            </label>

            <label className="text-sm">
              العملة
              <input
                name="currency"
                defaultValue="TRY"
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </label>

            <label className="text-sm">
              نسبة الضريبة %
              <input
                name="tax_rate"
                type="number"
                step="0.1"
                defaultValue="20"
                className="mt-1 w-full rounded border px-2 py-1"
              />
            </label>

            <label className="text-sm flex items-end gap-2">
              <input name="tax_included" type="checkbox" value="true" />
              <span>المبلغ يحتوي الضريبة</span>
            </label>

            <label className="text-sm col-span-2">
              جهة الدفع/القبض
              <input
                name="party"
                className="mt-1 w-full rounded border px-2 py-1"
                placeholder="عميل/مورد"
              />
            </label>

            <label className="text-sm">
              الطريقة
              <input
                name="method"
                className="mt-1 w-full rounded border px-2 py-1"
                placeholder="cash/bank/card"
              />
            </label>

            <label className="text-sm">
              مرجع
              <input
                name="ref_id"
                className="mt-1 w-full rounded border px-2 py-1"
                placeholder="رقم فاتورة/طلب"
              />
            </label>

            <label className="text-sm col-span-2">
              ملاحظة
              <textarea
                name="note"
                className="mt-1 w-full rounded border px-2 py-1"
                rows={2}
              />
            </label>
          </div>

          <button
            type="submit"
            disabled={pending}
            className="w-full rounded-lg bg-slate-900 text-white py-2 hover:opacity-90"
          >
            {pending ? "جارٍ الحفظ..." : "حفظ الحركة"}
          </button>
        </form>
      </div>
    </div>
  );
}
