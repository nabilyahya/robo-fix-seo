// app/track/page.tsx
import { Suspense } from "react";
import TrackEntryClient from "./TrackEntryClient";
import Image from "next/image";
import logo from "../../../public/logo.png";

export const metadata = { title: "Robonarim | Sipariş Takibi" };
export const dynamic = "force-dynamic";

export default function Page() {
  return (
    <div
      className="min-h-screen"
      style={{
        background:
          "radial-gradient(900px 520px at 100% -10%, rgba(38,198,218,.16), transparent 60%), radial-gradient(720px 480px at 0% 120%, rgba(30,136,229,.14), transparent 60%), linear-gradient(180deg,#f7fbff 0%,#f2f7fc 100%)",
        backgroundAttachment: "fixed",
      }}
    >
      <div className="max-w-3xl mx-auto px-4 py-10 sm:py-12">
        <header className="flex items-center gap-4 mb-6">
          <div className="relative">
            <div className="absolute -inset-2 rounded-2xl bg-gradient-to-br from-blue-200/60 to-cyan-200/60 blur-md" />
            <div className="relative rounded-2xl bg-white ring-1 ring-slate-200 shadow-[0_10px_40px_rgba(30,136,229,0.22)] p-1.5">
              <Image
                src={logo}
                alt="Robonarim Logo"
                width={44}
                height={44}
                className="rounded-xl"
                priority
              />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight text-[#0f5ea8]">
              Robonarim
            </h1>
            <p className="text-sm text-slate-600">
              Kesin Teşhis • Hızlı Onarım • Bursa içi Kurye
            </p>
          </div>
        </header>

        <Suspense
          fallback={
            <div className="p-6 text-gray-500 text-sm">Yükleniyor…</div>
          }
        >
          <TrackEntryClient />
        </Suspense>
      </div>
    </div>
  );
}
