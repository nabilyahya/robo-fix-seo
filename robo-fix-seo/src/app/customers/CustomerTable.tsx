"use client";

import Link from "next/link";
import StatusBadge, {
  type StatusKey,
  normalizeStatus,
} from "@/components/StatusBadge";
import NextStatusButton from "@/components/NextStatusButton";
import { formatSheetDate } from "@/lib/date";

type Row = any[];
type ReturnReason = "price_disagreement" | "no_parts";

export default function CustomerTable({
  rows,
  role,
  onConfirmSimple,
  forceApprove,
  forceReturn,
  ustaFinishCheck,
  copy,
  isPending,
  isKargo,
  isUsta,
  isAdmin,
  isPriv,
}: {
  rows: Row[];
  role?: string;
  onConfirmSimple: (id: string) => Promise<{ ok: boolean; next?: any }>;
  forceApprove: (id: string, rawStatus: string) => Promise<any>;
  forceReturn: (
    id: string,
    rawStatus: string,
    rr: ReturnReason
  ) => Promise<any>;
  ustaFinishCheck: (id: string, rawStatus: string) => Promise<any>;
  copy: (text: string) => Promise<void>;
  isPending: boolean;
  isKargo: boolean;
  isUsta: boolean;
  isAdmin: boolean;
  isPriv: boolean;
}) {
  return (
    <div className="space-y-5">
      {/* ===== Mobile Cards ===== */}
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
          const passCode = String(r[11] ?? "");
          const returnReason = (r[13] ?? "") as string;
          const extraCost = String(r[14] ?? "");
          const diagNote = String(r[15] ?? "");
          const il = String(r[16] ?? "");
          const ilce = String(r[17] ?? "");
          const mahalle = String(r[18] ?? "");
          const sokak = String(r[19] ?? "");
          const apNo = String(r[20] ?? "");
          const daireNo = String(r[21] ?? "");

          const status = normalizeStatus(rawStatus) as StatusKey;
          const phoneDigits = sanitizePhone(phone);

          if (
            isKargo &&
            !(
              [
                "pending_picked_up",
                "repaired_waiting_del",
                "return_waiting_del",
              ] as StatusKey[]
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

          const showReturnReason =
            status === "return_waiting_del" || status === "return_delivered";

          // ===== عرض (UI) =====
          const displayCity = makeDisplayCity(il, ilce);
          const displayStreet = makeDisplayStreet(
            mahalle,
            sokak,
            apNo,
            daireNo
          );
          const displayAddress =
            [displayCity, displayStreet].filter(Boolean).join(" — ") ||
            address ||
            "—";

          // ===== خرائط (Directions أو Search) =====
          const structured = { il, ilce, mahalle, sokak, apNo, daireNo };
          const hasStruct = hasStructuredAddress(structured);
          const mapsDestination = hasStruct
            ? makeMapsDestination(structured)
            : "";
          const mapsHref = hasStruct
            ? makeMapsDirectionsUrl(mapsDestination)
            : makeMapsSearchUrl(normalizeFreeformAddressForSearch(address));
          const mapsTitle = hasStruct
            ? mapsDestination
            : normalizeFreeformAddressForSearch(address);

          return (
            <li
              key={id}
              className="rounded-2xl bg-white/95 backdrop-blur ring-1 ring-black/5 p-4 shadow-md hover:shadow-lg transition border-l-4"
              style={{
                borderLeftColor:
                  status === "delivered_success" ||
                  status === "return_delivered"
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
                    : status === "return_waiting_del"
                    ? "#a21caf"
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
                {!isUsta && (
                  <>
                    <InfoRow label="الموقع" value={displayAddress} clamp />
                    {mapsHref && (
                      <div className="mt-1 flex justify-end">
                        <a
                          href={mapsHref}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800"
                          title={mapsTitle}
                        >
                          <span aria-hidden>📍</span>
                          اتجاهات Google
                        </a>
                      </div>
                    )}
                  </>
                )}

                {(isUsta || isPriv) && (
                  <div className="flex items-start justify-between gap-3">
                    <span className="text-neutral-500">رمز الفيش</span>
                    <span className="text-neutral-900 text-right">
                      {passCode || "—"}
                      {passCode && (
                        <button
                          onClick={() => copy(passCode)}
                          className="ml-2 inline-flex items-center px-2 py-0.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-50"
                        >
                          نسخ
                        </button>
                      )}
                    </span>
                  </div>
                )}

                {showReturnReason && (
                  <InfoRow
                    label="سبب المرتجع"
                    value={
                      returnReason === "no_parts"
                        ? "عدم تواجد قطع"
                        : returnReason === "price_disagreement"
                        ? "عدم الاتفاق على السعر"
                        : "—"
                    }
                  />
                )}

                {isPriv && diagNote && (
                  <InfoRow label="ملاحظة الفحص" value={diagNote} clamp />
                )}
                {isPriv && (
                  <InfoRow label="تكلفة إضافية" value={extraCost || "—"} />
                )}

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

              {/* اتصال/واتساب */}
              {!isUsta && (
                <div className="mt-4 flex items-center gap-2">
                  {phoneDigits ? (
                    <>
                      <a
                        href={`tel:${phoneDigits}`}
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50"
                      >
                        اتصال
                      </a>
                      {!isKargo && (
                        <a
                          href={`https://wa.me/${phoneDigits}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50"
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

              {/* أزرار الحالة */}
              <div className="mt-2 flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  {isUsta && status === "checking" ? (
                    <button
                      className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-800 disabled:opacity-50"
                      onClick={() => ustaFinishCheck(id, rawStatus)}
                      disabled={isPending}
                    >
                      إنهاء الفحص — بانتظار الموافقة
                    </button>
                  ) : isUsta && status === "checked_waiting_ok" ? (
                    <>
                      <button
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 disabled:opacity-50"
                        onClick={() => forceApprove(id, rawStatus)}
                        disabled={isPending}
                      >
                        تمت الموافقة – جارِ التصليح
                      </button>
                      <button
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-fuchsia-300 bg-fuchsia-50 hover:bg-fuchsia-100 text-fuchsia-800 disabled:opacity-50"
                        onClick={async () => {
                          const r = window.prompt(
                            "سبب المرتجع:\n1) عدم الاتفاق على السعر\n2) عدم تواجد قطع",
                            "1"
                          );
                          if (!r) return;
                          const rr =
                            r.trim() === "2"
                              ? "no_parts"
                              : "price_disagreement";
                          await forceReturn(id, rawStatus, rr as any);
                        }}
                        disabled={isPending}
                      >
                        مرتجع
                      </button>
                    </>
                  ) : isKargo ? (
                    status === "return_waiting_del" ? (
                      <button
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 disabled:opacity-50"
                        onClick={() => onConfirmSimple(id)}
                        disabled={isPending}
                      >
                        تم توصيل المرتجع
                      </button>
                    ) : (
                      (
                        [
                          "pending_picked_up",
                          "repaired_waiting_del",
                        ] as StatusKey[]
                      ).includes(status) && (
                        <NextStatusButton
                          id={id}
                          currentStatus={rawStatus}
                          onConfirm={onConfirmSimple}
                        />
                      )
                    )
                  ) : (
                    <NextStatusButton
                      id={id}
                      currentStatus={rawStatus}
                      onConfirm={onConfirmSimple}
                    />
                  )}
                </div>

                {/* زر التفاصيل: مخفي للكارجو دائماً */}
                {!(isUsta || isKargo) && (
                  <Link
                    href={`/customers/${id}`}
                    className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-neutral-300 bg-white hover:bg-neutral-50"
                  >
                    التفاصيل
                  </Link>
                )}
              </div>
            </li>
          );
        })}
      </ul>

      {/* ===== Desktop Table ===== */}
      <div className="hidden md:block rounded-2xl bg-white/95 backdrop-blur ring-1 ring-black/5 shadow-xl overflow-hidden">
        <div className="overflow-auto">
          <table className="w-full text-sm">
            <thead className="bg-neutral-50 sticky top-0 z-10">
              <tr className="text-left text-neutral-700">
                <th className="p-3 font-semibold">العميل</th>
                {!isUsta && <th className="p-3 font-semibold">الهاتف</th>}
                {!isUsta && (
                  <>
                    <th className="p-3 font-semibold whitespace-nowrap">
                      İlçe / İl
                    </th>
                    <th className="p-3 font-semibold whitespace-nowrap">
                      Mah. • Sk. • No
                    </th>
                    <th className="p-3 font-semibold whitespace-nowrap">
                      خريطة
                    </th>
                  </>
                )}
                <th className="p-3 font-semibold">الجهاز</th>
                <th className="p-3 font-semibold">العطل</th>
                <th className="p-3 font-semibold">التكلفة</th>
                <th className="p-3 font-semibold">الحالة</th>
                {(isUsta || isPriv) && (
                  <th className="p-3 font-semibold whitespace-nowrap">
                    رمز الفيش (L)
                  </th>
                )}
                {isPriv && (
                  <>
                    <th className="p-3 font-semibold whitespace-nowrap">
                      ملاحظة الفحص (P)
                    </th>
                    <th className="p-3 font-semibold whitespace-nowrap">
                      تكلفة إضافية (O)
                    </th>
                  </>
                )}
                <th className="p-3 font-semibold whitespace-nowrap">
                  سبب المرتجع
                </th>
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
                const passCode = String(r[11] ?? "");
                const returnReason = r[13] ?? "";
                const extraCost = String(r[14] ?? "");
                const diagNote = String(r[15] ?? "");
                const il = String(r[16] ?? "");
                const ilce = String(r[17] ?? "");
                const mahalle = String(r[18] ?? "");
                const sokak = String(r[19] ?? "");
                const apNo = String(r[20] ?? "");
                const daireNo = String(r[21] ?? "");
                const status = normalizeStatus(rawStatus) as StatusKey;

                if (
                  isKargo &&
                  !(
                    [
                      "pending_picked_up",
                      "repaired_waiting_del",
                      "return_waiting_del",
                    ] as StatusKey[]
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

                // عرض
                const displayCity = makeDisplayCity(il, ilce);
                const displayStreet = makeDisplayStreet(
                  mahalle,
                  sokak,
                  apNo,
                  daireNo
                );

                // خرائط
                const structured = { il, ilce, mahalle, sokak, apNo, daireNo };
                const hasStruct = hasStructuredAddress(structured);
                const mapsDestination = hasStruct
                  ? makeMapsDestination(structured)
                  : "";
                const mapsHref = hasStruct
                  ? makeMapsDirectionsUrl(mapsDestination)
                  : makeMapsSearchUrl(
                      normalizeFreeformAddressForSearch(address)
                    );
                const mapsTitle = hasStruct
                  ? mapsDestination
                  : normalizeFreeformAddressForSearch(address);

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
                      <>
                        <td className="p-3 whitespace-nowrap">
                          {displayCity || "—"}
                        </td>
                        <td
                          className="p-3 max-w-[320px] truncate"
                          title={displayStreet || address}
                        >
                          {displayStreet || address || "—"}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {mapsHref ? (
                            <a
                              href={mapsHref}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg border border-sky-200 bg-sky-50 hover:bg-sky-100 text-sky-800"
                              title={mapsTitle}
                            >
                              <span aria-hidden>📍</span>
                              خريطة
                            </a>
                          ) : (
                            <span className="text-xs text-neutral-400">—</span>
                          )}
                        </td>
                      </>
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

                    {(isUsta || isPriv) && (
                      <td className="p-3 whitespace-nowrap">
                        {passCode || "—"}{" "}
                        {passCode && (
                          <button
                            onClick={() => copy(passCode)}
                            className="ml-2 inline-flex items-center px-2 py-0.5 text-xs rounded-lg border border-slate-300 hover:bg-slate-50"
                          >
                            نسخ
                          </button>
                        )}
                      </td>
                    )}

                    {isPriv && (
                      <>
                        <td
                          className="p-3 max-w-[280px] truncate"
                          title={diagNote}
                        >
                          {diagNote || "—"}
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          {extraCost || "—"}
                        </td>
                      </>
                    )}

                    <td className="p-3 whitespace-nowrap">
                      {status === "return_waiting_del" ||
                      status === "return_delivered"
                        ? (returnReason as string) === "no_parts"
                          ? "عدم تواجد قطع"
                          : (returnReason as string) === "price_disagreement"
                          ? "عدم الاتفاق على السعر"
                          : "—"
                        : "—"}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {formatSheetDate(createdRaw)}
                    </td>
                    <td className="p-3 whitespace-nowrap">
                      {formatSheetDate(updatedRaw)}
                    </td>
                    <td className="p-3">
                      {isKargo ? (
                        status === "return_waiting_del" ? (
                          <button
                            className="inline-flex items-center gap-2 px-3 py-2 rounded-xl border border-emerald-300 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 disabled:opacity-50"
                            onClick={() => onConfirmSimple(id)}
                            disabled={isPending}
                          >
                            تم توصيل المرتجع
                          </button>
                        ) : (
                          (
                            [
                              "pending_picked_up",
                              "repaired_waiting_del",
                            ] as StatusKey[]
                          ).includes(status) && (
                            <NextStatusButton
                              id={id}
                              currentStatus={rawStatus}
                              onConfirm={onConfirmSimple}
                            />
                          )
                        )
                      ) : isUsta ? (
                        (
                          [
                            "picked_up",
                            "approved_repairing",
                            "repaired_waiting_del",
                          ] as StatusKey[]
                        ).includes(status) && (
                          <NextStatusButton
                            id={id}
                            currentStatus={rawStatus}
                            onConfirm={onConfirmSimple}
                          />
                        )
                      ) : (
                        <NextStatusButton
                          id={id}
                          currentStatus={rawStatus}
                          onConfirm={onConfirmSimple}
                        />
                      )}
                    </td>

                    {!(isUsta || isKargo) && (
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

/* ============ Helpers ============ */

function sanitizePhone(p: string) {
  return (p || "").replace(/\D+/g, "");
}

/* عرض فقط */
function makeDisplayCity(il?: string, ilce?: string) {
  const _il = (il ?? "").trim();
  const _ilce = (ilce ?? "").trim();
  if (_ilce && _il) return `${_ilce} / ${_il}`;
  return [_ilce || _il].filter(Boolean).join(" ");
}
function makeDisplayStreet(
  mahalle?: string,
  sokak?: string,
  apNo?: string,
  daireNo?: string
) {
  const parts: string[] = [];
  if (mahalle) parts.push(mahalle.trim());
  if (sokak) parts.push(sokak.trim());
  if (apNo) parts.push(`No ${String(apNo).trim()}`);
  if (daireNo) parts.push(`Daire ${String(daireNo).trim()}`);
  return parts.join(" • ");
}

/* خرائط: Directions عندما تتوفر الحقول المهيكلة */
function hasStructuredAddress(o: {
  il?: string;
  ilce?: string;
  mahalle?: string;
  sokak?: string;
  apNo?: string;
  daireNo?: string;
}) {
  return [o.il, o.ilce, o.mahalle, o.sokak, o.apNo, o.daireNo].some(
    (v) => String(v ?? "").trim() !== ""
  );
}
function makeMapsDestination(opts: {
  il?: string;
  ilce?: string;
  mahalle?: string;
  sokak?: string;
  apNo?: string;
  daireNo?: string;
}) {
  const { il, ilce, mahalle, sokak, apNo, daireNo } = opts;
  const segs: string[] = [];
  if (mahalle) segs.push(`${mahalle.trim()} Mah.`);
  if (sokak) segs.push(`${sokak.trim()} Sk.`);
  if (apNo) segs.push(`No:${String(apNo).trim()}`);
  if (daireNo) segs.push(`D:${String(daireNo).trim()}`);
  if (ilce) segs.push(ilce.trim());
  if (il) segs.push(il.trim());
  return segs.join(", ");
}
function makeMapsDirectionsUrl(destination: string) {
  return destination
    ? `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(
        destination
      )}`
    : "";
}

/* خرائط: Search عندما لا تتوفر حقول مهيكلة */
function normalizeFreeformAddressForSearch(address?: string) {
  let s = String(address ?? "").trim();
  s = s.replace(/—/g, ", ").replace(/\s*\/\s*/g, ", ");
  s = s.replace(/\bAp\s*No\.?\s*(\d+)/i, "No:$1");
  s = s.replace(/\bDaire\s*No\.?\s*(\d+)/i, "D:$1");
  return s;
}
function makeMapsSearchUrl(query: string) {
  return query
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        query
      )}`
    : "";
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
