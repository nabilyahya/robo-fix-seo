// app/customers/CustomersClient.tsx
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import StatusBadge, {
  type StatusKey,
  normalizeStatus,
} from "@/components/StatusBadge";
import NextStatusButton from "@/components/NextStatusButton";
import { advanceStatusAction } from "./_actions";
import { formatSheetDate } from "@/lib/date";

type Row = any[];

type Props = {
  rows?: Row[] | null;
  showSuccess?: boolean;
  role?: string; // "Kargo" | "Usta" | ...
  fetchError?: string; // رسالة خطأ تقنية اختيارية من السيرفر
};

const ACTION_LABELS: Partial<Record<StatusKey, string>> = {
  pending_picked_up: "تم الاستلام",
  picked_up: "جار الفحص",
  checking: "تم الفحص بانتظار الموافقة",
  checked_waiting_ok: "إنهاء التصليح",
  approved_repairing: "تم التصليح بانتظار التوصيل",
  repaired_waiting_del: "تم التوصيل",
};

const STATUS_SORT_WEIGHT: Record<StatusKey, number> = {
  checking: 0,
  approved_repairing: 1,
  repaired_waiting_del: 2,
  checked_waiting_ok: 3,
  delivered_success: 90,
  canceled: 90,
  picked_up: 99,
  pending_picked_up: 99,
} as const;

function sanitizePhone(p: string) {
  return (p || "").replace(/\D+/g, "");
}
function parseDMYToEpoch(v: unknown): number | null {
  if (typeof v === "number") return v;
  if (typeof v !== "string") return null;
  const m = v.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4})$/);
  if (!m) {
    const t = Date.parse(v);
    return Number.isNaN(t) ? null : t;
  }
  const [, dd, mm, yyyy] = m;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return d.getTime();
}

export default function CustomersClient({
  rows,
  showSuccess,
  role,
  fetchError,
}: Props) {
  const safeRows = useMemo<Row[]>(
    () => (Array.isArray(rows) ? rows : []),
    [rows]
  );

  const roleKey = (role || "").toLowerCase();
  const isKargo = roleKey === "kargo";
  const isUsta = roleKey === "usta";

  // واجهة محلية (بدون calls)
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"" | StatusKey>("");
  const [sort, setSort] = useState<
    | "updated_desc"
    | "updated_asc"
    | "created_desc"
    | "created_asc"
    | "name_asc"
    | "name_desc"
  >("updated_desc");
  const [openFilters, setOpenFilters] = useState(false);

  // خيارات الحالة (بعد اعتبار الدور)
  const statusOptions = useMemo(() => {
    const s = new Set<StatusKey>();
    for (const r of safeRows) {
      const normalized = normalizeStatus(
        (r[7] ?? "picked_up") as string
      ) as StatusKey;
      if (isKargo) {
        if (
          !(
            ["pending_picked_up", "repaired_waiting_del"] as StatusKey[]
          ).includes(normalized)
        )
          continue;
      } else if (isUsta) {
        if (
          !(
            [
              "picked_up",
              "checking",
              "checked_waiting_ok",
              "approved_repairing",
              "repaired_waiting_del",
            ] as StatusKey[]
          ).includes(normalized)
        )
          continue;
      }
      s.add(normalized);
    }
    return Array.from(s);
  }, [safeRows, isKargo, isUsta]);

  // فلترة بحسب الدور + البحث + الحالة
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();

    return safeRows.filter((r) => {
      const name = (r[1] ?? "") as string;
      const phone = (r[2] ?? "") as string;
      const address = (r[3] ?? "") as string;
      const device = (r[4] ?? "") as string;
      const issue = (r[5] ?? "") as string;
      const st = normalizeStatus((r[7] ?? "picked_up") as string) as StatusKey;

      if (isKargo) {
        if (
          !(
            ["pending_picked_up", "repaired_waiting_del"] as StatusKey[]
          ).includes(st)
        )
          return false;
      } else if (isUsta) {
        if (
          !(
            [
              "picked_up",
              "checking",
              "checked_waiting_ok",
              "approved_repairing",
              "repaired_waiting_del",
            ] as StatusKey[]
          ).includes(st)
        )
          return false;
      }

      if (status && st !== status) return false;

      if (!qq) return true;
      const haystack =
        `${name} ${phone} ${address} ${device} ${issue}`.toLowerCase();
      return haystack.includes(qq);
    });
  }, [safeRows, q, status, isKargo, isUsta]);

  // ترتيب: وزن الحالة أولاً (checking أول – لم يبدأ أخير)
  const sorted = useMemo(() => {
    const arr = [...filtered];
    arr.sort((a, b) => {
      const sa = normalizeStatus((a[7] ?? "picked_up") as string) as StatusKey;
      const sb = normalizeStatus((b[7] ?? "picked_up") as string) as StatusKey;
      const wa = STATUS_SORT_WEIGHT[sa] ?? 50;
      const wb = STATUS_SORT_WEIGHT[sb] ?? 50;
      if (wa !== wb) return wa - wb;

      if (sort === "name_asc" || sort === "name_desc") {
        const cmp = String(a[1] ?? "").localeCompare(String(b[1] ?? ""), "ar");
        return sort === "name_asc" ? cmp : -cmp;
      }
      if (sort === "created_desc" || sort === "created_asc") {
        const av = parseDMYToEpoch(a[8]);
        const bv = parseDMYToEpoch(b[8]);
        if (av == null || bv == null) return 0;
        return sort === "created_desc" ? bv - av : av - bv;
      }
      const av = parseDMYToEpoch(a[9]);
      const bv = parseDMYToEpoch(b[9]);
      if (av == null || bv == null) return 0;
      return sort === "updated_asc" ? av - bv : bv - av;
    });
    return arr;
  }, [filtered, sort]);

  // بطاقات فارغة/خطأ
  function EmptyCard({ roleKey }: { roleKey: string }) {
    let title = "لا توجد نتائج للعرض";
    let desc = "جرّب تعديل الفلاتر أو البحث.";
    if (roleKey === "kargo") {
      title = "لا توجد مهام توصيل الآن";
      desc = "لا توجد طلبات بانتظار الجلب أو بانتظار التسليم حاليًا.";
    } else if (roleKey === "usta") {
      title = "لا توجد أجهزة للتصليح الآن";
      desc = "لا توجد أجهزة جاهزة للفحص أو التصليح حاليًا.";
    }
    return (
      <div className="rounded-2xl bg-white/95 backdrop-blur ring-1 ring-black/5 shadow-xl p-8 text-center">
        <div className="mx-auto mb-3 h-12 w-12 rounded-2xl bg-slate-100 flex items-center justify-center">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 text-slate-400"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M12 2a5 5 0 0 0-5 5v2H6a2 2 0 0 0-2 2v6h16v-6a2 2 0 0 0-2-2h-1V7a5 5 0 0 0-5-5Zm0 2a3 3 0 0 1 3 3v2H9V7a3 3 0 0 1 3-3Z"
            />
          </svg>
        </div>
        <h2 className="text-lg font-semibold text-slate-800">{title}</h2>
        <p className="mt-1 text-slate-600">{desc}</p>
      </div>
    );
  }
  function ErrorCard({ message }: { message: string }) {
    return (
      <div className="rounded-2xl bg-red-50 ring-1 ring-red-200 p-6 text-red-800">
        <div className="flex items-start gap-3">
          <svg
            viewBox="0 0 24 24"
            className="h-6 w-6 text-red-600"
            aria-hidden="true"
          >
            <path
              fill="currentColor"
              d="M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z"
            />
          </svg>
          <div>
            <div className="font-semibold">حدثت مشكلة تقنية</div>
            <p className="mt-1 text-sm">
              {message ||
                "هناك مشكلة في الاتصال بالإنترنت أو في مصدر البيانات. يرجى المحاولة لاحقًا."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <main className="relative min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900">
      <div className="pointer-events-none absolute inset-0 opacity-20 mix-blend-overlay [background-image:radial-gradient(#ffffff22_1px,transparent_1px)] [background-size:16px_16px]" />
      <div className="relative z-10 px-4 py-8 max-w-7xl mx-auto">
        {/* الهيدر */}
        <div className="mb-4 flex items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white">
              قائمة العملاء
            </h1>
            <p className="text-slate-300 text-sm md:text-base mt-1">
              عرض وتحديث الحالات حسب دور المستخدم.
            </p>
          </div>
          {!(isKargo || isUsta) && (
            <Link
              href="/customers/create"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-600/20 hover:bg-emerald-600 focus:outline-none focus:ring-4 focus:ring-emerald-300 transition"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
                <path
                  fill="currentColor"
                  d="M12 5c.55 0 1 .45 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H6a1 1 0 1 1 0-2h5V6c0-.55.45-1 1-1Z"
                />
              </svg>
              عميل جديد
            </Link>
          )}
        </div>

        {/* أدوات الفلترة (زر على الموبايل) */}
        <div className="mb-3 md:mb-4">
          <div className="md:hidden mb-2">
            <button
              onClick={() => setOpenFilters((v) => !v)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/95 text-slate-900 ring-1 ring-black/5 shadow hover:bg-white"
              aria-expanded={openFilters}
              aria-controls="filters-panel"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5">
                <path
                  fill="currentColor"
                  d="M3 6h18v2H3V6Zm4 5h10v2H7v-2Zm-2 5h14v2H5v-2Z"
                />
              </svg>
              فلترة
            </button>
          </div>

          <div
            id="filters-panel"
            className={`rounded-2xl bg-white/95 backdrop-blur ring-1 ring-black/5 shadow-xl p-3 md:p-4 ${
              openFilters ? "block" : "hidden"
            } md:block`}
          >
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <label htmlFor="q" className="sr-only">
                  بحث
                </label>
                <div className="relative">
                  <input
                    id="q"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="ابحث بالاسم، الجهاز، العطل…"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pl-10 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200"
                  />
                  <svg
                    viewBox="0 0 24 24"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
                    aria-hidden="true"
                  >
                    <path
                      fill="currentColor"
                      d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 5L20.49 19l-5-5Z"
                    />
                  </svg>
                </div>
              </div>

              <div>
                <label htmlFor="status" className="sr-only">
                  الحالة
                </label>
                <select
                  id="status"
                  value={status}
                  onChange={(e) => setStatus(e.target.value as "" | StatusKey)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200"
                >
                  <option value="">كل الحالات</option>
                  {statusOptions.map((s) => (
                    <option key={s} value={s}>
                      {ACTION_LABELS[s] ?? s.replaceAll("_", " ")}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="sort" className="sr-only">
                  ترتيب
                </label>
                <select
                  id="sort"
                  value={sort}
                  onChange={(e) => setSort(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200"
                >
                  <option value="updated_desc">أحدث تحديث</option>
                  <option value="updated_asc">أقدم تحديث</option>
                  <option value="created_desc">الأحدث إنشاءً</option>
                  <option value="created_asc">الأقدم إنشاءً</option>
                  <option value="name_asc">الاسم (تصاعدي)</option>
                  <option value="name_desc">الاسم (تنازلي)</option>
                </select>
              </div>
            </div>

            <div className="mt-3 text-sm text-slate-600">
              عرض{" "}
              <span className="font-medium text-slate-900">
                {sorted.length}
              </span>{" "}
              من{" "}
              <span className="font-medium text-slate-900">
                {safeRows.length}
              </span>{" "}
              عميل
            </div>
          </div>
        </div>

        {/* عرض الأخطاء/الفراغ/المحتوى */}
        {fetchError ? (
          <ErrorCard message={fetchError} />
        ) : sorted.length === 0 ? (
          <EmptyCard roleKey={roleKey} />
        ) : (
          <CustomerTable rows={sorted} role={roleKey} />
        )}
      </div>
    </main>
  );
}

/** ======= الكروت للموبايل + الجدول للديسكتوب ======= */
function CustomerTable({ rows, role }: { rows: Row[]; role?: string }) {
  const isKargo = role === "kargo";
  const isUsta = role === "usta";

  return (
    <div className="space-y-5">
      {/* Mobile cards */}
      <ul className="md:hidden space-y-3">
        {rows.map((r) => {
          const id = r[0];
          const name = (r[1] ?? "") as string;
          const phone = (r[2] ?? "") as string;
          const address = (r[3] ?? "") as string;
          const device = (r[4] ?? "") as string;
          const issue = (r[5] ?? "") as string;
          const cost = (r[6] ?? "") as string;
          const rawStatus = (r[7] ?? "picked_up") as string;
          const createdRaw = r[8] ?? "";
          const updatedRaw = r[9] ?? "";

          const status = normalizeStatus(rawStatus) as StatusKey;
          const phoneDigits = sanitizePhone(phone);

          if (
            isKargo &&
            !(
              ["pending_picked_up", "repaired_waiting_del"] as StatusKey[]
            ).includes(status)
          )
            return null;
          if (
            isUsta &&
            !(
              [
                "picked_up",
                "checking",
                "checked_waiting_ok",
                "approved_repairing",
                "repaired_waiting_del",
              ] as StatusKey[]
            ).includes(status)
          )
            return null;

          return (
            <li
              key={id}
              className="rounded-2xl bg-white/95 backdrop-blur ring-1 ring-black/5 p-4 shadow-md hover:shadow-lg transition border-l-4"
              style={{
                borderLeftColor:
                  status === "delivered_success"
                    ? "#10b981"
                    : status === "picked_up"
                    ? "#3b82f6"
                    : status === "canceled"
                    ? "#ef4444"
                    : (
                        [
                          "approved_repairing",
                          "checking",
                          "checked_waiting_ok",
                        ] as StatusKey[]
                      ).includes(status)
                    ? "#f59e0b"
                    : "#cbd5e1",
              }}
            >
              {/* رأس البطاقة */}
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-base font-semibold leading-6 truncate">
                    {name || "—"}
                  </div>
                  {!isUsta && (
                    <div className="mt-1 text-sm text-neutral-600">
                      {phone || "—"}
                    </div>
                  )}
                </div>
                <StatusBadge status={status} />
              </div>

              {/* مختصر */}
              <div className="mt-3 text-sm">
                <InfoRow
                  label="الحالة"
                  value={ACTION_LABELS[status] ?? status.replaceAll("_", " ")}
                />
                <InfoRow label="الجهاز" value={device || "—"} clamp />
                <InfoRow label="التكلفة" value={cost || "—"} />
                <div className="mt-1 flex items-center justify-between">
                  <span className="text-neutral-500">التواريخ</span>
                  <span className="text-neutral-800">
                    {formatSheetDate(createdRaw)} •{" "}
                    {formatSheetDate(updatedRaw)}
                  </span>
                </div>
              </div>

              {/* تفاصيل إضافية قابلة للطي — نخفي العنوان عن Usta */}
              {((!isUsta && address) || issue) && (
                <details className="group mt-2">
                  <summary className="cursor-pointer select-none text-sm text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-2">
                    عرض التفاصيل
                    <svg
                      viewBox="0 0 24 24"
                      className="h-4 w-4 transition group-open:rotate-180"
                      aria-hidden="true"
                    >
                      <path fill="currentColor" d="M7 10l5 5 5-5z" />
                    </svg>
                  </summary>
                  <div className="mt-2 space-y-1 text-sm">
                    {!isUsta && (
                      <InfoRow label="العنوان" value={address || "—"} />
                    )}
                    <InfoRow label="العطل" value={issue || "—"} />
                  </div>
                </details>
              )}

              {/* سطر 1: اتصال/واتساب — مخفي بالكامل لـ Usta */}
              {!isUsta && (
                <div className="mt-4 flex items-center gap-2">
                  {phoneDigits ? (
                    <>
                      <a
                        href={`tel:${phoneDigits}`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50"
                        aria-label={`اتصال بـ ${name}`}
                      >
                        اتصال
                      </a>
                      {/* Kargo بدون واتساب */}
                      {role !== "kargo" && (
                        <a
                          href={`https://wa.me/${phoneDigits}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50"
                          aria-label={`واتساب ${name}`}
                        >
                          واتساب
                        </a>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-neutral-500">
                      الهاتف غير متوفر
                    </span>
                  )}
                </div>
              )}

              {/* سطر 2: تغيير الحالة + التفاصيل — التفاصيل مخفية لـ Usta */}
              <div className="mt-2 flex items-center justify-between gap-2">
                <div>
                  {isKargo ? (
                    (
                      [
                        "pending_picked_up",
                        "repaired_waiting_del",
                      ] as StatusKey[]
                    ).includes(status) ? (
                      <NextStatusButton
                        id={id}
                        currentStatus={rawStatus}
                        onConfirm={advanceStatusAction}
                      />
                    ) : null
                  ) : isUsta ? (
                    (
                      [
                        "picked_up",
                        "checking",
                        "checked_waiting_ok",
                        "approved_repairing",
                      ] as StatusKey[]
                    ).includes(status) ? (
                      <NextStatusButton
                        id={id}
                        currentStatus={rawStatus}
                        onConfirm={advanceStatusAction}
                      />
                    ) : null
                  ) : (
                    <NextStatusButton
                      id={id}
                      currentStatus={rawStatus}
                      onConfirm={advanceStatusAction}
                    />
                  )}
                </div>

                {!isUsta && (
                  <Link
                    href={`/customers/${id}`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50"
                    aria-label={`فتح تفاصيل ${name}`}
                  >
                    التفاصيل
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* Desktop table */}
      <div className="hidden md:block rounded-2xl bg-white/95 backdrop-blur ring-1 ring-black/5 shadow-xl overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 sticky top-0 z-10">
              <tr className="text-left text-neutral-700">
                <th className="p-3 font-semibold">العميل</th>
                {!isUsta && <th className="p-3 font-semibold">الهاتف</th>}
                {!isUsta && <th className="p-3 font-semibold">العنوان</th>}
                <th className="p-3 font-semibold">الجهاز</th>
                <th className="p-3 font-semibold">العطل</th>
                <th className="p-3 font-semibold">التكلفة</th>
                <th className="p-3 font-semibold">الحالة</th>
                <th className="p-3 font-semibold whitespace-nowrap">
                  تاريخ الإنشاء
                </th>
                <th className="p-3 font-semibold whitespace-nowrap">
                  آخر تحديث
                </th>
                <th className="p-3"></th>
                {!isUsta && <th className="p-3"></th>}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => {
                const id = r[0];
                const name = r[1] ?? "";
                const phone = r[2] ?? "";
                const address = r[3] ?? "";
                const device = r[4] ?? "";
                const issue = r[5] ?? "";
                const cost = r[6] ?? "";
                const rawStatus = (r[7] ?? "picked_up") as string;
                const createdRaw = r[8] ?? "";
                const updatedRaw = r[9] ?? "";
                const status = normalizeStatus(rawStatus) as StatusKey;

                if (
                  isKargo &&
                  !(
                    ["pending_picked_up", "repaired_waiting_del"] as StatusKey[]
                  ).includes(status)
                )
                  return null;
                if (
                  isUsta &&
                  !(
                    [
                      "picked_up",
                      "checking",
                      "checked_waiting_ok",
                      "approved_repairing",
                      "repaired_waiting_del",
                    ] as StatusKey[]
                  ).includes(status)
                )
                  return null;

                return (
                  <tr key={id} className="border-t hover:bg-neutral-50">
                    <td
                      className="p-3 font-medium max-w-[220px] truncate"
                      title={String(name)}
                    >
                      {name}
                    </td>
                    {!isUsta && (
                      <td className="p-3 whitespace-nowrap">{phone}</td>
                    )}
                    {!isUsta && (
                      <td
                        className="p-3 max-w-[320px] truncate"
                        title={String(address)}
                      >
                        {address}
                      </td>
                    )}
                    <td
                      className="p-3 max-w-[220px] truncate"
                      title={String(device)}
                    >
                      {device}
                    </td>
                    <td
                      className="p-3 max-w-[260px] truncate"
                      title={String(issue)}
                    >
                      {issue}
                    </td>
                    <td className="p-3">{cost || "—"}</td>
                    <td className="p-3">
                      <StatusBadge status={status} />
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {formatSheetDate(createdRaw)}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {formatSheetDate(updatedRaw)}
                    </td>
                    <td className="p-3">
                      {isKargo ? (
                        (
                          [
                            "pending_picked_up",
                            "repaired_waiting_del",
                          ] as StatusKey[]
                        ).includes(status) && (
                          <NextStatusButton
                            id={id}
                            currentStatus={rawStatus}
                            onConfirm={advanceStatusAction}
                          />
                        )
                      ) : isUsta ? (
                        (
                          [
                            "picked_up",
                            "checking",
                            "checked_waiting_ok",
                            "approved_repairing",
                          ] as StatusKey[]
                        ).includes(status) && (
                          <NextStatusButton
                            id={id}
                            currentStatus={rawStatus}
                            onConfirm={advanceStatusAction}
                          />
                        )
                      ) : (
                        <NextStatusButton
                          id={id}
                          currentStatus={rawStatus}
                          onConfirm={advanceStatusAction}
                        />
                      )}
                    </td>
                    {!isUsta && (
                      <td className="p-3 text-right">
                        <Link
                          className="inline-flex items-center gap-1 text-emerald-700 hover:text-emerald-800 underline decoration-dotted"
                          href={`/customers/${id}`}
                        >
                          فتح
                          <svg
                            viewBox="0 0 24 24"
                            className="h-4 w-4"
                            aria-hidden="true"
                          >
                            <path
                              fill="currentColor"
                              d="M13 5l7 7-7 7v-4H4v-6h9V5z"
                            />
                          </svg>
                        </Link>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function InfoRow({
  label,
  value,
  clamp = false,
}: {
  label: string;
  value: string;
  clamp?: boolean;
}) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-neutral-500">{label}</span>
      <span
        className={`text-neutral-900 text-right ${clamp ? "line-clamp-2" : ""}`}
      >
        {value || "—"}
      </span>
    </div>
  );
}
