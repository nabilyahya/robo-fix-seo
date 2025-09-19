"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, FormEvent } from "react";

export default function TrackEntryClient() {
  const router = useRouter();
  const [pass, setPass] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setErr(null);

    const cleaned = (pass || "").toString().trim().replace(/\D+/g, "");
    if (cleaned.length !== 6) {
      setErr("Lütfen 6 haneli fiş şifresini girin.");
      inputRef.current?.focus();
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

      <form
        onSubmit={handleSubmit}
        className="flex flex-col sm:flex-row gap-3 sm:gap-4"
      >
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
          disabled={pass.length === 0}
        >
          Durumu Göster
        </button>
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
