"use client";

import { useEffect, useState } from "react";
import { fetchTxAction } from "../_actions";

function sum(arr: number[]) {
  return Math.round(arr.reduce((a, b) => a + b, 0) * 100) / 100;
}

export default function SummaryCards() {
  const [data, setData] = useState<any[]>([]);
  const [monthIso, setMonthIso] = useState<string>("");

  useEffect(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    setMonthIso(`${fmt(start)} → ${fmt(end)}`);

    fetchTxAction({ from: fmt(start), to: fmt(end) }).then(setData);
  }, []);

  const income = sum(data.filter((d) => d.type === "income").map((d) => d.net));
  const expense = sum(
    data.filter((d) => d.type === "expense").map((d) => d.gross)
  ); // كمصروف احسب الإجمالي بضريبته
  const taxOut = sum(
    data.filter((d) => d.type === "expense").map((d) => d.tax)
  );
  const taxIn = sum(data.filter((d) => d.type === "income").map((d) => d.tax));
  const profit = Math.round((income - expense) * 100) / 100;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card
        title={`وارد (Net) — ${monthIso}`}
        value={`${income.toLocaleString()} TRY`}
      />
      <Card title={`مصروف (Gross)`} value={`${expense.toLocaleString()} TRY`} />
      <Card
        title={`ضريبة المبيعات (In/Out)`}
        value={`+${taxIn.toLocaleString()} / -${taxOut.toLocaleString()}`}
      />
      <Card title={`الربح/الخسارة`} value={`${profit.toLocaleString()} TRY`} />
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-2xl border bg-white p-4 shadow-sm">
      <div className="text-xs text-slate-500">{title}</div>
      <div className="mt-2 text-xl font-semibold">{value}</div>
    </div>
  );
}
