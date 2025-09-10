// src/app/page.tsx
import type { Metadata } from "next";
import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import ServicesSection from "@/components/ServicesSection";
import WhyChooseUsSection from "@/components/WhyChooseUsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import BrandsSection from "@/components/BrandsSection";
import FloatingActions from "@/components/FloatingActions";
import ReviewsSection from "@/components/ReviewsSection";
import FaqSection from "@/components/FaqSection";
import OurServiss from "@/components/ourService";

// عدّل البيانات التجارية حسب واقع نشاطك
const BUSINESS_NAME = "Robonarim";
const CITY = "Bursa";
const PHONE = "+90-551-522-20-67";
const HOURS = "Mo-Sa 09:00-19:00";

// ✅ Metadata مخصّصة للهوم (OG/Twitter + canonical)
const VERCEL_URL = process.env.VERCEL_URL;
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : VERCEL_URL
  ? `https://${VERCEL_URL}`
  : "http://localhost:3000";
const OG_IMAGE = `${SITE_URL}/og.png`;

// ...
export const metadata: Metadata = {
  title: `${BUSINESS_NAME} — Robot Süpürge Onarım & Bakım | ${CITY}`,
  description:
    "Robot süpürge onarım, bakım ve yedek parça hizmetleri. Hızlı teşhis, orijinal parça ve şeffaf fiyatlar. Bursa içi aynı gün destek. Telefon: +90 551 522 20 67",
  alternates: { canonical: "/" },
  keywords: [
    "robot süpürge tamiri",
    "robot süpürge servisi",
    "robot süpürge sensör arızası",
    "robot süpürge yedek parça",
    "robot süpürge bakım",
    "robot süpürge batarya değişimi",
    "robot süpürge tamircisi",
    "robot süpürge motor arızası",
    "robot süpürge filtre değişimi",
    "robot süpürge arıza servisi",
    "robot süpürge tamir merkezi",
    "robot süpürge tamir fiyatları",
    "robot süpürge açılmıyor",
    "robot süpürge hata veriyor",
    "robot süpürge hata kodu",
    "robot süpürge batarya arızası",
    "robot süpürge fırça arızası",
    "robot süpürge şarj istasyonu tamiri",
    "robot süpürge adaptör tamiri",
    "robot süpürge anakart tamiri",
    "robot süpürge yazılım hatası",
    "robot süpürge Bursa tamir",
    "robot süpürge Nilüfer tamir",
    "robot süpürge Görükle tamir",
    "robot süpürge Yıldırım tamir",
    "robot süpürge FSM Bulvar tamir",
    "robot süpürge Mudanya tamir",
    "robot süpürge Osmangazi tamir",
    "robot süpürge ücretsiz kontrol",
    "robot süpürge garanti sonrası servis",
    "robot süpürge en iyi servis",
    "robot süpürge hızlı tamir",
    "robot süpürge profesyonel servis",
    "robot süpürge güvenilir tamir",
    "robot süpürge bakım fiyatı",
    "robot süpürge Bursa servis",
    "robot süpürge servisi Bursa",
    "robot süpürge yazılım güncelleme",
    "robot süpürge şarj olmuyor",
    "robot süpürge çalışmıyor",
    "robot süpürge tekerlek arızası",
    "robot süpürge onarım",
    "robot süpürge tamirci öneri",
    "robot süpürge orijinal parça",
    "robot süpürge bakım Bursa",
  ],
  openGraph: {
    type: "website",
    url: SITE_URL, // ← مطلق
    siteName: BUSINESS_NAME,
    title: `${BUSINESS_NAME} — Robot Süpürge Onarım & Bakım | ${CITY}`,
    description:
      "Robot süpürge onarım, bakım ve yedek parça hizmetleri. Bursa’da hızlı ve güvenilir servis.",
    locale: "tr_TR",
    images: [
      {
        url: OG_IMAGE,
        width: 1200,
        height: 630,
        alt: "Robonarim — Bursa robot süpürge servisi",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS_NAME} — Robot Süpürge Onarım & Bakım | ${CITY}`,
    description:
      "Robot süpürge onarım, bakım ve yedek parça hizmetleri. Bursa’da hızlı ve güvenilir servis.",
    images: [OG_IMAGE], // ← مطلق
  },
};

// (اختياري) إعادة توليد ثابتة يوميًا
export const revalidate = 86400;

export default function Index() {
  // ✅ LocalBusiness JSON-LD (Rich Results)
  const localBusinessLd = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: BUSINESS_NAME,
    url: SITE_URL,
    image: [`${SITE_URL}/logo2.png`],
    description:
      "Robot süpürge onarım ve bakım hizmetleri. Hızlı teşhis, orijinal parça, şeffaf fiyat +90 551 552 20 67.",
    telephone: PHONE,
    address: {
      "@type": "PostalAddress",
      addressLocality: CITY,
      addressCountry: "TR",
    },
    areaServed: CITY,
    openingHours: HOURS,
    sameAs: [
      "https://www.instagram.com/robonarim/?utm_source=ig_web_button_share_sheet",
      // أضف روابط السوشيال إن وُجدت
      // "https://maps.google.com/....",
      // "https://www.instagram.com/...."
    ],
  };

  // (اختياري) WebSite + SearchAction (يساعد جوجل على عرض فورم بحث للموقع)
  const webSiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: BUSINESS_NAME,
    url: SITE_URL,
    potentialAction: {
      "@type": "SearchAction",
      target: `${SITE_URL}/blog?query={search_term_string}`,
      "query-input": "required name=search_term_string",
    },
  };

  return (
    <div className="relative flex size-full min-h-screen flex-col bg-background font-work-sans overflow-x-hidden">
      <div className="layout-container flex h-full grow flex-col">
        <Header />
        <main className="px-4 sm:px-8 md:px-16 lg:px-24 xl:px-40 flex flex-1 justify-center py-2 sm:py-4 lg:py-5">
          <div className="layout-content-container flex flex-col max-w-[960px] flex-1 w-full">
            {/* JSON-LD (Rich Results) */}
            <script
              type="application/ld+json"
              suppressHydrationWarning
              dangerouslySetInnerHTML={{
                __html: JSON.stringify(localBusinessLd),
              }}
            />
            <script
              type="application/ld+json"
              suppressHydrationWarning
              dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteLd) }}
            />

            <HeroSection />
            <ServicesSection />
            <BrandsSection />
            <WhyChooseUsSection />
            <ReviewsSection />
            <OurServiss />
            {/* <ContactSection /> */}
            <FaqSection />
            <FloatingActions />
            {/* <ContactSection /> */}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
