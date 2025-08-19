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

// عدّل البيانات التجارية حسب واقع نشاطك
const BUSINESS_NAME = "RoboFix";
const CITY = "Bursa";
const PHONE = "+90-551-166-38-24";
const HOURS = "Mo-Sa 09:00-19:00";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// ✅ Metadata مخصّصة للهوم (OG/Twitter + canonical)
export const metadata: Metadata = {
  title: `${BUSINESS_NAME} — Robot Süpürge Onarım & Bakım | ${CITY}`,
  description:
    "Robot süpürge onarım, bakım ve yedek parça hizmetleri. Hızlı teşhis, orijinal parça ve şeffaf fiyatlar. Bursa içi aynı gün destek.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    url: "/",
    siteName: BUSINESS_NAME,
    title: `${BUSINESS_NAME} — Robot Süpürge Onarım & Bakım | ${CITY}`,
    description:
      "Robot süpürge onarım, bakım ve yedek parça hizmetleri. Bursa’da hızlı ve güvenilir servis.",
    locale: "tr_TR",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: `${BUSINESS_NAME} — Robot Süpürge Onarım & Bakım | ${CITY}`,
    description:
      "Robot süpürge onarım, bakım ve yedek parça hizmetleri. Bursa’da hızlı ve güvenilir servis.",
    images: ["/og.png"],
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
    url: siteUrl,
    image: [`${siteUrl}/og.png`],
    description:
      "Robot süpürge onarım ve bakım hizmetleri. Hızlı teşhis, orijinal parça, şeffaf fiyat.",
    telephone: PHONE,
    address: {
      "@type": "PostalAddress",
      addressLocality: CITY,
      addressCountry: "TR",
    },
    areaServed: CITY,
    openingHours: HOURS,
    sameAs: [
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
    url: siteUrl,
    potentialAction: {
      "@type": "SearchAction",
      target: `${siteUrl}/blog?query={search_term_string}`,
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
            {/* <ContactSection /> */}
            <FloatingActions />
            {/* <ContactSection /> */}
          </div>
        </main>
        <Footer />
      </div>
    </div>
  );
}
