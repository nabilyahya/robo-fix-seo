// app/customers/CustomersClient.tsx
"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import CustomerTable from "./CustomerTable";
import { advanceStatusAction } from "./_actions";
import { normalizeStatus, type StatusKey } from "@/components/StatusBadge";

/* =========================
   أنواع وتهيئات عامة
========================= */

type Row = any[];
type ConfirmResult = { ok: boolean; next?: any };

type Props = {
  rows?: Row[] | null;
  showSuccess?: boolean;
  role?: string; // "Kargo" | "Usta" | "Admin" | "CallCenter" ...
  fetchError?: string;
};

// تسميات للحالات (للـ UI فقط)
const ACTION_LABELS: Partial<Record<StatusKey, string>> = {
  pending_picked_up: "تم الاستلام",
  picked_up: "جار الفحص",
  checking: "تم الفحص بانتظار الموافقة",
  checked_waiting_ok: "إنهاء التصليح",
  approved_repairing: "تم التصليح بانتظار التوصيل",
  repaired_waiting_del: "تم التوصيل",
  return_waiting_del: "تسليم المرتجع",
  return_delivered: "تم توصيل المرتجع",
};

const STATUS_SORT_WEIGHT: Record<StatusKey, number> = {
  checking: 0,
  checked_waiting_ok: 1,
  approved_repairing: 2,
  repaired_waiting_del: 3,
  return_waiting_del: 3,
  delivered_success: 90,
  canceled: 90,
  return_delivered: 90,
  picked_up: 99,
  pending_picked_up: 99,
} as const;

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

/* =========================
   المكوّن الرئيسي
========================= */

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

  // أدوار المستخدم
  const roleKey = (role || "").trim().toLowerCase();
  const isKargo = roleKey === "kargo";
  const isUsta = roleKey === "usta";
  const isAdmin = roleKey === "admin";
  const isCallCenter =
    roleKey === "callcenter" || roleKey === "call-center" || roleKey === "cc";
  const isPriv = isAdmin || isCallCenter;

  // refresh بعد تنفيذ الـ actions
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const withRefresh = async <T,>(fn: () => Promise<T>): Promise<T> => {
    const res = await fn();
    startTransition(() => router.refresh());
    return res;
  };

  // حقول الفلاتر
  const [q, setQ] = useState("");
  const [passQ, setPassQ] = useState(""); // بحث برمز الفيش (L)
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

  // خيارات الحالات المتاحة حسب الدور
  const statusOptions = useMemo(() => {
    const s = new Set<StatusKey>();
    for (const r of safeRows) {
      const normalized = normalizeStatus((r[7] ?? "picked_up") as string);
      if (isKargo) {
        if (
          !(
            [
              "pending_picked_up",
              "repaired_waiting_del",
              "return_waiting_del",
            ] as StatusKey[]
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
      s.add(normalized as StatusKey);
    }
    return Array.from(s);
  }, [safeRows, isKargo, isUsta]);

  // فلترة
  const filtered = useMemo(() => {
    const qq = q.trim().toLowerCase();
    const pq = passQ.trim().toLowerCase();

    return safeRows.filter((r) => {
      const name = (r[1] ?? "") as string;
      const phone = (r[2] ?? "") as string;
      const address = (r[3] ?? "") as string;
      const device = (r[4] ?? "") as string;
      const issue = (r[5] ?? "") as string;
      const st = normalizeStatus((r[7] ?? "picked_up") as string) as StatusKey;

      const passCode = String(r[11] ?? ""); // L
      const returnReason = (r[13] ?? "") as string; // N
      const extraCost = String(r[14] ?? ""); // O
      const diagNote = String(r[15] ?? ""); // P

      const il = String(r[16] ?? "");
      const ilce = String(r[17] ?? "");
      const mahalle = String(r[18] ?? "");
      const sokak = String(r[19] ?? "");
      const apNo = String(r[20] ?? "");
      const daireNo = String(r[21] ?? "");

      if (isKargo) {
        if (
          !(
            [
              "pending_picked_up",
              "repaired_waiting_del",
              "return_waiting_del",
            ] as StatusKey[]
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
      if (pq && !passCode.toLowerCase().includes(pq)) return false;

      if (!qq) return true;
      const haystack =
        `${name} ${phone} ${address} ${device} ${issue} ${returnReason} ${passCode} ${extraCost} ${diagNote} ${il} ${ilce} ${mahalle} ${sokak} ${apNo} ${daireNo}`.toLowerCase();
      return haystack.includes(qq);
    });
  }, [safeRows, q, passQ, status, isKargo, isUsta]);

  // ترتيب
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

  /* =========================
     إجراءات مع refresh + typing مضبوط
  ========================= */

  // هذا هو التوقيع المطلوب من CustomerTable
  const onConfirmSimple = (id: string): Promise<ConfirmResult> =>
    withRefresh<ConfirmResult>(async () => {
      const res = (await advanceStatusAction(id)) as any;
      // لو السيرفر ما رجّع ok صراحةً
      if (res && typeof res === "object" && "ok" in res)
        return res as ConfirmResult;
      return { ok: true, next: res?.next };
    });

  const forceApprove = (id: string, rawStatus: string) =>
    withRefresh(() =>
      advanceStatusAction({
        id,
        currentStatus: rawStatus,
        forceNext: "approved_repairing",
      } as any)
    );

  type ReturnReason = "price_disagreement" | "no_parts";
  const forceReturn = (id: string, rawStatus: string, rr: ReturnReason) =>
    withRefresh(() =>
      advanceStatusAction({
        id,
        currentStatus: rawStatus,
        forceNext: "return_waiting_del",
        meta: { return_reason: rr },
      } as any)
    );

  const ustaFinishCheck = (id: string, rawStatus: string) =>
    withRefresh(async () => {
      const note = window.prompt("اكتب ملاحظة/عذر الفحص:", "") ?? undefined;
      if (note === undefined) return { ok: false };
      let extra: string | undefined = undefined;
      const hasExtra = window.confirm("هل توجد تكاليف إضافية؟");
      if (hasExtra) {
        const v = window.prompt("قيمة التكلفة الإضافية (ل.ت):", "");
        if (v === null) return { ok: false };
        extra = v.trim();
      }
      return advanceStatusAction({
        id,
        currentStatus: rawStatus,
        forceNext: "checked_waiting_ok",
        meta: { diagnosis_note: note ?? "", extra_cost: extra ?? "" },
      } as any);
    });

  async function copy(text: string) {
    try {
      await navigator.clipboard.writeText(text);
      alert("تم نسخ رمز الفيش");
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      alert("تم نسخ رمز الفيش");
    }
  }

  /* =========================
     UI: الهيدر + الفلاتر + العرض
  ========================= */

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

          {/* مخفي للكارجو والستا */}
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

        {/* أدوات الفلترة */}
        <div className="mb-3 md:mb-4">
          <div className="md:hidden mb-2">
            <button
              onClick={() => setOpenFilters((v) => !v)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white/95 text-slate-900 ring-1 ring-black/5 shadow hover:bg-white"
              aria-expanded={openFilters}
              aria-controls="filters-panel"
            >
              <svg viewBox="0 0 24 24" className="h-5 w-5" aria-hidden="true">
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
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {/* بحث عام */}
              <div className="md:col-span-2">
                <label htmlFor="q" className="sr-only">
                  بحث عام
                </label>
                <div className="relative">
                  <input
                    id="q"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                    placeholder="ابحث بالاسم، الجهاز، العطل…"
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 pl-10 text-slate-900 placeholder:text-slate-400 shadow-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200"
                  />
                  {/* أيقونة آمنة بدون مسارات d طويلة */}
                  <svg
                    viewBox="0 0 24 24"
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="11" cy="11" r="7" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                </div>
              </div>

              {/* بحث برمز الفيش */}
              <div>
                <label htmlFor="passq" className="sr-only">
                  رمز الفيش
                </label>
                <input
                  id="passq"
                  value={passQ}
                  onChange={(e) => setPassQ(e.target.value)}
                  placeholder="بحث برمز الفيش (L)"
                  className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2.5 text-slate-900 shadow-sm outline-none focus:border-emerald-500 focus:ring-4 focus:ring-emerald-200"
                />
              </div>

              {/* حالة */}
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

              {/* ترتيب */}
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
          <CustomerTable
            rows={sorted}
            role={roleKey}
            onConfirmSimple={onConfirmSimple}
            forceApprove={forceApprove}
            forceReturn={forceReturn}
            ustaFinishCheck={ustaFinishCheck}
            copy={copy}
            isPending={isPending}
            isKargo={isKargo}
            isUsta={isUsta}
            isAdmin={isAdmin}
            isPriv={isPriv}
          />
        )}
      </div>
    </main>
  );
}

/* =========================
   عناصر مساعدة للواجهة
========================= */

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
        {/* أيقونة عدسة آمنة */}
        <svg
          viewBox="0 0 24 24"
          className="h-6 w-6 text-slate-400"
          fill="none"
          stroke="currentColor"
          strokeWidth={2}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
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
          {/* مثلث تحذير بسيط بحروف كبيرة لتجنب مشاكل RTL */}
          <path
            fill="currentColor"
            d="M1 21H23L12 2 1 21ZM13 18H11V16H13V18ZM13 14H11V10H13V14Z"
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
