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
  }, []);

  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="flex flex-wrap items-end gap-2 mb-3">
        <label className="text-sm">
          من
          <input
            type="date"
            value={from}
            onChange={(e) => setFrom(e.target.value)}
            className="mt-1 rounded border px-2 py-1"
          />
        </label>
        <label className="text-sm">
          إلى
          <input
            type="date"
            value={to}
            onChange={(e) => setTo(e.target.value)}
            className="mt-1 rounded border px-2 py-1"
          />
        </label>
        <button
          onClick={reload}
          disabled={pending}
          className="rounded bg-slate-900 text-white px-3 py-2"
        >
          {pending ? "..." : "تحديث"}
        </button>
      </div>

      <div className="overflow-auto">
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
                  {r.net?.toLocaleString()} {r.currency}
                </td>
                <td className="p-2 text-right">
                  {r.tax?.toLocaleString()} {r.currency}
                </td>
                <td className="p-2 text-right">
                  {r.gross?.toLocaleString()} {r.currency}
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
