"use client";

import { useEffect, useState, useCallback } from "react";
import { Cookie, Settings2 } from "lucide-react";

// 👇 غيّر النسخة عند تعديل الشكل/المنطق كي تُجبر المتصفح يعيد التخزين
const CONSENT_KEY = "robonarim_consent_v2";

type ConsentBooleans = {
  analytics: boolean;
  ads: boolean;
};
type StoredConsent = ConsentBooleans & { decided: boolean };

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
  }
}

function toGranted(value: boolean) {
  return value ? "granted" : "denied";
}

/** إرسال الإشارات إلى gtag (Consent Mode v2) */
function applyConsent(consent: ConsentBooleans) {
  if (!window.gtag) return;
  window.gtag("consent", "update", {
    analytics_storage: toGranted(consent.analytics),
    ad_storage: toGranted(consent.ads),
    ad_user_data: toGranted(consent.ads),
    ad_personalization: toGranted(consent.ads),
  });
}

/** بعد الموافقة، نرسل page_view لأننا عطّلنا الإرسال التلقائي */
function sendPageViewOnce() {
  if (!window.gtag) return;
  const href = window.location.href;
  const pathWithQuery = window.location.pathname + window.location.search;
  window.gtag("event", "page_view", {
    page_location: href,
    page_path: pathWithQuery,
  });
}

export default function ConsentBanner() {
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false); // إظهار/إخفاء البانر
  const [showDetails, setShowDetails] = useState(false); // لوحة التفضيلات
  const [consent, setConsent] = useState<ConsentBooleans>({
    analytics: false,
    ads: false,
  });

  // تحميل الحالة من localStorage
  useEffect(() => {
    setMounted(true);
    try {
      const raw = localStorage.getItem(CONSENT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw) as StoredConsent;
        if (parsed?.decided) {
          // طبّق آخر تفضيلات
          applyConsent(parsed);
          setConsent(parsed);
          setOpen(false);
          return;
        }
      }
      // تظهر للمرة الأولى
      setOpen(true);
    } catch {
      setOpen(true);
    }
  }, []);

  const persist = useCallback((next: StoredConsent) => {
    localStorage.setItem(CONSENT_KEY, JSON.stringify(next));
  }, []);

  const acceptAll = useCallback(() => {
    const next: StoredConsent = { analytics: true, ads: true, decided: true };
    setConsent(next);
    applyConsent(next);
    persist(next);
    sendPageViewOnce();
    setOpen(false);
  }, [persist]);

  const rejectAll = useCallback(() => {
    const next: StoredConsent = { analytics: false, ads: false, decided: true };
    setConsent(next);
    applyConsent(next);
    persist(next);
    setOpen(false);
  }, [persist]);

  const savePrefs = useCallback(() => {
    const next: StoredConsent = { ...consent, decided: true };
    applyConsent(next);
    persist(next);
    if (next.analytics) sendPageViewOnce();
    setOpen(false);
  }, [consent, persist]);

  // لا ترندر أثناء SSR لتفادي أي اختلافات
  if (!mounted || !open) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Çerez izinleri"
      className="fixed inset-x-0 bottom-0 z-[100] mx-auto w-full max-w-3xl px-3 pb-3"
    >
      <div className="rounded-2xl border bg-card text-card-foreground shadow-2xl ring-1 ring-black/5 backdrop-blur supports-[backdrop-filter]:bg-card/95">
        {/* رأس البانر */}
        <div className="flex items-start gap-3 p-4 sm:p-5">
          <div className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
            <Cookie className="h-5 w-5 text-primary" />
          </div>

          <div className="flex-1">
            <h2 className="text-sm font-extrabold tracking-[-0.01em] sm:text-base">
              Çerez Tercihleri
            </h2>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground sm:text-sm">
              Bu site deneyiminizi geliştirmek için çerezler kullanır.
              İstatistik (analitik) ve reklam çerezlerini kabul etmek isterseniz
              aşağıdan yönetebilirsiniz.{" "}
              <a
                href="/kvkk" // ← سياسة الخصوصية/‏KVKK (بدّل الرابط)
                className="font-semibold text-primary underline-offset-2 hover:underline"
              >
                Gizlilik Politikası
              </a>
              .
            </p>
          </div>

          <button
            onClick={() => setShowDetails((s) => !s)}
            className="inline-flex items-center gap-2 rounded-md border px-3 py-2 text-xs font-semibold hover:bg-accent hover:text-accent-foreground sm:text-sm"
            aria-expanded={showDetails}
          >
            <Settings2 className="h-4 w-4" />
            Tercihleri Yönet
          </button>
        </div>

        {/* لوحة التفضيلات */}
        {showDetails && (
          <div className="px-4 pb-3 sm:px-5">
            <div className="divide-y rounded-xl border bg-background/50">
              <PrefRow
                title="Analitik Çerezleri"
                desc="Ziyaretlerinizi anonim olarak ölçmemizi sağlar."
                checked={consent.analytics}
                onChange={(v) => setConsent((c) => ({ ...c, analytics: v }))}
              />
              <PrefRow
                title="Reklam Çerezleri"
                desc="Daha alakalı reklamlar gösterebilmemize yardımcı olur."
                checked={consent.ads}
                onChange={(v) => setConsent((c) => ({ ...c, ads: v }))}
              />
            </div>
          </div>
        )}

        {/* الأزرار */}
        <div className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-end sm:gap-3 sm:p-5">
          <button
            onClick={rejectAll}
            className="inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-semibold hover:bg-accent hover:text-accent-foreground"
          >
            Yalnızca Zorunlu
          </button>

          {showDetails ? (
            <button
              onClick={savePrefs}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-95"
            >
              Tercihleri Kaydet
            </button>
          ) : (
            <button
              onClick={acceptAll}
              className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-bold text-primary-foreground hover:opacity-95"
            >
              Tümünü Kabul Et
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** صف تفضيل مع سويتش بسيط */
function PrefRow({
  title,
  desc,
  checked,
  onChange,
}: {
  title: string;
  desc: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-start gap-3 px-4 py-3 sm:px-5">
      <div className="flex-1">
        <p className="text-sm font-semibold">{title}</p>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>

      <label className="relative inline-flex h-6 w-11 cursor-pointer items-center">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={checked}
          onChange={(e) => onChange(e.target.checked)}
          aria-label={title}
        />
        <span className="absolute inset-0 rounded-full bg-muted transition peer-checked:bg-primary/70" />
        <span className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background shadow transition peer-checked:translate-x-5" />
      </label>
    </div>
  );
}
