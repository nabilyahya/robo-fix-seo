"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useRef, FormEvent } from "react";
import Turnstile from "react-turnstile";

export default function TrackEntryClient() {
  const router = useRouter();
  const sp = useSearchParams();
  const need = sp.get("need") === "1"; // لو رجع من الميدلوير
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [hp, setHp] = useState(""); // honeypot
  const [tsToken, setTsToken] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  async function verifyTurnstile() {
    if (!tsToken) return false;
    const res = await fetch("/api/turnstile/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token: tsToken }),
    });
    return res.ok;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);

    // honeypot: إن امتلأ => تجاهل (بوت)
    if (hp) return;

    const cleaned = (pass || "").toString().trim().replace(/\D+/g, "");
    if (cleaned.length !== 6) {
      setErr("Lütfen 6 haneli fiş şifresini girin.");
      inputRef.current?.focus();
      return;
    }

    // تحقّق بشري (مجاني)
    if (!tsToken) {
      setErr("Lütfen doğrulamayı tamamlayın.");
      return;
    }

    setSubmitting(true);
    const ok = await verifyTurnstile();
    if (!ok) {
      setSubmitting(false);
      setErr("Doğrulama başarısız. Lütfen tekrar deneyin.");
      return;
    }

    router.push(`/track/${cleaned}`);
  }

  return (
    <div className="bg-white border border-slate-200 rounded-3xl shadow-sm p-6 sm:p-7">
      <h2 className="text-xl font-bold mb-2 text-slate-800">Cihaz Durumu</h2>
      <p className="text-neutral-600 mb-5">
        <strong>Fiş şifresi</strong> (6 hane) ile sipariş durumunuzu
        görüntüleyin.
      </p>

      {/* تنبيه عند الرجوع من الميدلوير */}
      {need && (
        <div className="mb-4 text-sm rounded-xl border border-amber-200 bg-amber-50 text-amber-800 px-3 py-2">
          Güvenlik nedeniyle lütfen aşağıdaki doğrulamayı tamamlayın.
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* honeypot مخفي */}
        <input
          type="text"
          name="company"
          value={hp}
          onChange={(e) => setHp(e.target.value)}
          className="hidden"
          tabIndex={-1}
          autoComplete="off"
          aria-hidden="true"
        />

        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
          <input
            ref={inputRef}
            value={pass}
            onChange={(e) =>
              setPass(e.target.value.replace(/\D+/g, "").slice(0, 6))
            }
            onPaste={(e) => {
              const text = e.clipboardData.getData("text") || "";
              e.preventDefault();
              setPass(text.replace(/\D+/g, "").slice(0, 6));
            }}
            inputMode="numeric"
            pattern="\d{6}"
            maxLength={6}
            placeholder="Fiş şifresi (6 hane)"
            className="w-full px-4 py-3 rounded-xl border border-neutral-300 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-[0.25em]"
            aria-label="Fiş şifresi"
            autoFocus
            required
          />

          <button
            type="submit"
            className="inline-flex justify-center items-center px-5 py-3 rounded-xl bg-gradient-to-br from-[#1e88e5] to-[#26c6da] text-white font-semibold hover:opacity-95 disabled:opacity-60 disabled:cursor-not-allowed"
            disabled={pass.length === 0 || submitting}
          >
            {submitting ? "Kontrol ediliyor..." : "Durumu Göster"}
          </button>
        </div>

        {/* Turnstile (مجاني) */}
        <div className="mt-1">
          <Turnstile
            sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY!}
            onVerify={(token) => setTsToken(token)}
            appearance="interaction-only" // يظهر فقط عند التفاعل
          />
        </div>
      </form>

      {err && (
        <div className="mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          {err}
        </div>
      )}

      <div className="mt-4 text-xs text-slate-600 leading-relaxed">
        • Herhangi bir metni yapıştırabilirsiniz — sadece sayıları alıp 6 haneye
        kısaltırız.
        <br />• Gizliliğiniz bizim için önemli — şifre sadece görüntüleme
        içindir.
      </div>
    </div>
  );
}
