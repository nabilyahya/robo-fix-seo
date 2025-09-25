"use client";

import { useEffect, useState, useTransition } from "react";
import { fetchTxAction } from "../_actions";

export default function TxTable() {
  const [rows, setRows] = useState<any[]>([]);
  const [pending, start] = useTransition();
  const [from, setFrom] = useState<string>("");
  const [to, setTo] = useState<string>("");

  const reload = () =>
    start(() =>
      fetchTxAction({ from: from || undefined, to: to || undefined }).then(
        setRows
      )
    );

  useEffect(() => {
    reload();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      {/* فلاتر مرنة للموبايل */}
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-end gap-2 mb-3">
        <label className="text-sm">
          من
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>
        <label className="text-sm">
          إلى
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 w-full rounded border px-3 py-2"
          />
        </label>
        <button
          onClick={reload}
          disabled={pending}
          className="mt-1 sm:mt-0 rounded bg-slate-900 text-white px-4 py-2"
        >
          {pending ? "..." : "تحديث"}
        </button>
      </div>

      {/* موبايل: بطاقات — ديسكتوب: جدولك كما هو */}
      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {rows.map((r, i) => (
          <article
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-3 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-medium">{r.date}</div>
              <span
                className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-medium ${
                  r.type === "income"
                    ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200"
                    : "bg-rose-50 text-rose-700 ring-1 ring-rose-200"
                }`}
              >
                {r.type === "income" ? "وارد" : "مصروف"}
              </span>
            </div>

            <div className="mt-1 text-slate-700 text-sm">{r.category}</div>

            <div className="mt-2 grid grid-cols-3 gap-2 text-right">
              <KV label="Net" value={`${num(r.net)} ${r.currency}`} />
              <KV label="Tax" value={`${num(r.tax)} ${r.currency}`} />
              <KV label="Gross" value={`${num(r.gross)} ${r.currency}`} />
            </div>

            <div className="mt-2 grid grid-cols-2 gap-2 text-[12px] text-slate-600">
              <KVL label="الجهة" value={r.party || "—"} />
              <KVL label="طريقة" value={r.method || "—"} />
              <KVL
                label="ملاحظة"
                value={r.note || "—"}
                className="col-span-2"
              />
              <KVL label="Ref" value={r.ref_id || "—"} />
            </div>
          </article>
        ))}

        {!rows.length && (
          <div className="rounded-xl border border-dashed p-6 text-center text-slate-500">
            لا توجد حركات
          </div>
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="bg-slate-50 text-slate-600">
              <th className="p-2 text-left">التاريخ</th>
              <th className="p-2">النوع</th>
              <th className="p-2 text-left">التصنيف</th>
              <th className="p-2">Net</th>
              <th className="p-2">Tax</th>
              <th className="p-2">Gross</th>
              <th className="p-2 text-left">الجهة</th>
              <th className="p-2">طريقة</th>
              <th className="p-2 text-left">ملاحظة</th>
              <th className="p-2">Ref</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-t">
                <td className="p-2">{r.date}</td>
                <td className="p-2 text-center">{r.type}</td>
                <td className="p-2">{r.category}</td>
                <td className="p-2 text-right">
                  {num(r.net)} {r.currency}
                </td>
                <td className="p-2 text-right">
                  {num(r.tax)} {r.currency}
                </td>
                <td className="p-2 text-right">
                  {num(r.gross)} {r.currency}
                </td>
                <td className="p-2">{r.party}</td>
                <td className="p-2 text-center">{r.method}</td>
                <td className="p-2">{r.note}</td>
                <td className="p-2 text-center">{r.ref_id}</td>
              </tr>
            ))}
            {!rows.length && (
              <tr>
                <td className="p-3 text-center text-slate-500" colSpan={10}>
                  لا توجد حركات
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function num(n: number) {
  return (Number(n) || 0).toLocaleString();
}

function KV({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg bg-slate-50 p-2">
      <div className="text-[11px] text-slate-500">{label}</div>
      <div className="text-sm font-semibold">{value}</div>
    </div>
  );
}
function KVL({
  label,
  value,
  className = "",
}: {
  label: string;
  value: string;
  className?: string;
}) {
  return (
    <div className={`flex items-center justify-between ${className}`}>
      <span className="text-slate-500">{label}</span>
      <span className="font-medium text-slate-700">{value}</span>
    </div>
  );
}
