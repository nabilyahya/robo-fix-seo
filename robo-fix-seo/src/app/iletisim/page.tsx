// FILE: app/iletisim/page.tsx

import Footer from "@/components/Footer";
import Header from "@/components/Header";
import Link from "next/link";
import Script from "next/script";

export const metadata = {
  title: "İletişim | Robonarim — Robot Süpürge Tamiri Bursa",
  description:
    "Robot süpürgeniz için ücretsiz arıza tespiti, garantili onarım ve Bursa içi ücretsiz alım–teslim. 48 saatte hızlı servis. WhatsApp: +90 551 522 2067.",
  alternates: { canonical: "https://www.robonarim.com/iletisim" },
  openGraph: {
    title: "İletişim | Robonarim",
    description:
      "Ücretsiz arıza tespiti, garantili parça değişimi ve 48 saatte hızlı onarım. Bursa içi ücretsiz alım–teslim.",
    url: "https://www.robonarim.com/iletisim",
    type: "website",
    locale: "tr_TR",
    siteName: "Robonarim",
  },
};

function Badge({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-full border border-blue-300/40 bg-blue-50/60 px-3 py-1 text-xs text-blue-700 backdrop-blur-sm">
      {children}
    </span>
  );
}

// ✅ في بيئتك Next يتوقع searchParams كـ Promise.
//   لذلك نصرّح به كـ Promise وننتظره داخل الدالة.
type SP = Promise<{ ok?: string; err?: string }>;

export default async function IletisimPage({
  searchParams,
}: {
  searchParams?: SP;
}) {
  const sp = (await searchParams) ?? {};
  const ok = sp.ok === "1";
  const err = sp.err;

  // أرقام التواصل المستخدمة في الصفحة
  const phoneDisplay = "0551 522 2067";
  const phoneDigits = "+905515222067";

  return (
    <div>
      <Header />
      <main className="min-h-screen bg-gradient-to-b from-white to-blue-50">
        {/* Hero */}
        <section className="relative">
          <div className="mx-auto max-w-6xl px-4 pt-14 pb-8 md:pt-20 md:pb-12">
            <div className="flex flex-col gap-6">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                İletişim
              </h1>
              <p className="max-w-2xl text-slate-600 md:text-lg">
                Bursa içinde <strong>ücretsiz alım–teslim</strong>,{" "}
                <strong>ücretsiz arıza tespiti</strong> ve
                <strong> 48 saatte hızlı onarım</strong>. Hemen servis kaydı
                oluşturun veya WhatsApp’tan yazın.
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>Ücretsiz arıza tespiti</Badge>
                <Badge>Bursa içi ücretsiz alım–teslim</Badge>
                <Badge>48 saatte onarım</Badge>
                <Badge>Önce net fiyat onayı</Badge>
              </div>
              <div className="mt-2 flex flex-wrap gap-3">
                <a
                  href={`https://wa.me/${phoneDigits.replace(
                    "+",
                    ""
                  )}?text=Merhaba%2C%20robot%20süpürgem%20için%20servis%20talep%20ediyorum.`}
                  className="inline-flex items-center justify-center rounded-2xl bg-green-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                >
                  WhatsApp ile Yaz
                </a>
                <a
                  href={`tel:${phoneDigits}`}
                  className="inline-flex items-center justify-center rounded-2xl bg-blue-600 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                >
                  {phoneDisplay} — Ara
                </a>
              </div>

              {ok && (
                <div className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-emerald-800">
                  Talebiniz alındı. En kısa sürede sizinle iletişime geçeceğiz.
                  Teşekkürler!
                </div>
              )}
              {err && (
                <div className="mt-2 rounded-xl border border-rose-200 bg-rose-50 p-3 text-rose-800">
                  Gönderim sırasında bir sorun oluştu: {err}
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Content Grid */}
        <section className="mx-auto max-w-6xl px-4 pb-20">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Form */}
            <div
              id="form"
              className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8"
            >
              <h2 className="mb-1 text-xl font-bold text-slate-900">
                Servis Talep Formu
              </h2>
              <p className="mb-6 text-sm text-slate-600">
                Formu doldurun, ekibimiz <strong>aynı gün</strong> sizi arasın.
              </p>

              <form
                method="POST"
                action="/api/iletisim"
                className="grid grid-cols-1 gap-4"
                noValidate
              >
                <input type="hidden" name="source" value="iletisim-sayfasi" />
                {/* Honeypot */}
                <input
                  type="text"
                  name="_company"
                  className="hidden"
                  tabIndex={-1}
                  autoComplete="off"
                />

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-sm font-medium text-slate-700"
                      htmlFor="name"
                    >
                      Ad Soyad*
                    </label>
                    <input
                      id="name"
                      name="name"
                      required
                      placeholder="Örn. Ahmet Yılmaz"
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none ring-blue-500 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-sm font-medium text-slate-700"
                      htmlFor="phone"
                    >
                      Telefon*
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="05xx xxx xx xx"
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none ring-blue-500 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2"
                    />
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-sm font-medium text-slate-700"
                      htmlFor="email"
                    >
                      E-posta
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      placeholder="ornek@mail.com"
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none ring-blue-500 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label
                      className="text-sm font-medium text-slate-700"
                      htmlFor="model"
                    >
                      Marka / Model*
                    </label>
                    <input
                      id="model"
                      name="model"
                      required
                      placeholder="Örn. Roborock S7, iRobot i7…"
                      className="rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none ring-blue-500 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1">
                  <label
                    className="text-sm font-medium text-slate-700"
                    htmlFor="message"
                  >
                    Arıza Açıklaması*
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    required
                    rows={5}
                    placeholder="Cihazın sorunu nedir? (Örn. çalışmıyor, şarj olmuyor, sensör hatası…)"
                    className="resize-y rounded-xl border border-slate-300 px-3 py-2 text-sm shadow-sm outline-none ring-blue-500 placeholder:text-slate-400 focus:border-blue-500 focus:ring-2"
                  />
                </div>

                <fieldset className="grid gap-2">
                  <legend className="text-sm font-medium text-slate-700">
                    Tercih edilen iletişim
                  </legend>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="radio"
                        name="pref"
                        value="whatsapp"
                        defaultChecked
                      />{" "}
                      WhatsApp
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="pref" value="phone" /> Telefon
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input type="radio" name="pref" value="email" /> E-posta
                    </label>
                  </div>
                </fieldset>

                <label className="mt-1 inline-flex items-start gap-2 text-xs text-slate-600">
                  <input
                    type="checkbox"
                    name="kvkk"
                    required
                    className="mt-0.5"
                  />
                  Kişisel verilerimin servis talebi sürecinde işlenmesine izin
                  veriyorum (KVKK).
                </label>

                <button
                  type="submit"
                  className="mt-2 inline-flex items-center justify-center rounded-2xl bg-slate-900 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-slate-900 focus:ring-offset-2"
                >
                  Servis Kaydı Oluştur
                </button>

                <p className="text-xs text-slate-500">
                  Gönderim sorunu yaşarsanız WhatsApp’tan yazabilirsiniz.
                </p>
              </form>
            </div>

            {/* Contact & Map */}
            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
                <h2 className="mb-1 text-xl font-bold text-slate-900">
                  İletişim Bilgileri
                </h2>
                <ul className="mt-4 space-y-3 text-sm text-slate-700">
                  <li>
                    <strong>Telefon:</strong>{" "}
                    <a
                      className="text-blue-600 hover:underline"
                      href={`tel:${phoneDigits}`}
                    >
                      {phoneDisplay}
                    </a>
                  </li>
                  <li>
                    <strong>WhatsApp:</strong>{" "}
                    <a
                      className="text-green-600 hover:underline"
                      href={`https://wa.me/${phoneDigits.replace("+", "")}`}
                    >
                      Mesaj gönder
                    </a>
                  </li>
                  <li>
                    <strong>E-posta:</strong>{" "}
                    <a
                      className="text-blue-600 hover:underline"
                      href="mailto:contact@robonarim.com"
                    >
                      contact@robonarim.com
                    </a>
                  </li>
                  <li>
                    <strong>Hizmet Bölgesi:</strong> Bursa ve çevresi — ücretsiz
                    alım–teslim
                  </li>
                  <li>
                    <strong>Çalışma Saatleri:</strong> 09:00–21:00 (Pzt–Paz)
                  </li>
                </ul>
                <div className="mt-4 text-xs text-slate-500">
                  * Önce net fiyat onayı; onarım ortalama 48 saat.
                </div>
              </div>

              <div className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm">
                <iframe
                  title="Robonarim Bursa Harita"
                  src="https://www.google.com/maps?q=Bursa&output=embed"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="h-80 w-full"
                />
              </div>
            </div>
          </div>
        </section>

        {/* JSON-LD Schema */}
        <Script id="ld-localbusiness" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "Robonarim",
            url: "https://www.robonarim.com/",
            telephone: "+90 551 522 2067",
            areaServed: { "@type": "City", name: "Bursa" },
            description:
              "Robot süpürge tamiri, ücretsiz arıza tespiti, garantili parça değişimi ve Bursa içi ücretsiz alım–teslim.",
            sameAs: ["https://www.robonarim.com/"],
            openingHours: ["Mo-Su 09:00-21:00"],
            address: {
              "@type": "PostalAddress",
              addressLocality: "Bursa",
              addressCountry: "TR",
            },
            makesOffer: [{ "@type": "Offer", name: "Ücretsiz arıza tespiti" }],
            serviceType: "Robot süpürge tamiri",
          })}
        </Script>

        <Script id="ld-faq" type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: [
              {
                "@type": "Question",
                name: "Arıza tespiti ücretli mi?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Hayır, arıza tespiti ücretsizdir. Onarım öncesi net fiyat onayı alınır.",
                },
              },
              {
                "@type": "Question",
                name: "Bursa içinde alım–teslim var mı?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Evet, Bursa içinde ücretsiz alım–teslim hizmeti sağlıyoruz.",
                },
              },
              {
                "@type": "Question",
                name: "Onarım süresi ne kadar?",
                acceptedAnswer: {
                  "@type": "Answer",
                  text: "Çoğu onarım 48 saat içinde tamamlanır.",
                },
              },
            ],
          })}
        </Script>
      </main>
      <Footer />
    </div>
  );
}
