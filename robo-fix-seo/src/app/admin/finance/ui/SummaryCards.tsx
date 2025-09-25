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
  );
  const taxOut = sum(
    data.filter((d) => d.type === "expense").map((d) => d.tax)
  );
  const taxIn = sum(data.filter((d) => d.type === "income").map((d) => d.tax));
  const profit = Math.round((income - expense) * 100) / 100;

  const cards = [
    {
      title: `وارد (Net) — ${monthIso}`,
      value: `${income.toLocaleString()} TRY`,
    },
    { title: `مصروف (Gross)`, value: `${expense.toLocaleString()} TRY` },
    {
      title: `ضريبة المبيعات (In/Out)`,
      value: `+${taxIn.toLocaleString()} / -${taxOut.toLocaleString()}`,
    },
    { title: `الربح/الخسارة`, value: `${profit.toLocaleString()} TRY` },
  ];

  return (
    // موبايل: 2x2 بدون سكرول — ديسكتوب: 4 أعمدة كما هو
    <div className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
      {cards.map((c, i) => (
        <Card key={i} title={c.title} value={c.value} />
      ))}
    </div>
  );
}

function Card({ title, value }: { title: string; value: string }) {
  return (
    <div className="h-full rounded-2xl border bg-white p-3 sm:p-4 shadow-sm">
      {/* عنوان صغير قليلاً على الموبايل مع سطرين كحد أقصى */}
      <div className="text-[10.5px] sm:text-xs text-slate-500 leading-snug line-clamp-2">
        {title}
      </div>
      {/* قيمة أوضح — تكبير بسيط على الشاشات الأكبر */}
      <div className="mt-2 text-base sm:text-xl font-semibold tracking-tight">
        {value}
      </div>
    </div>
  );
}
