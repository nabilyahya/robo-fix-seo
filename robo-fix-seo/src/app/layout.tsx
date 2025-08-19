// src/app/layout.tsx
import Analytics from "./analytics";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";
// env.ts (اختياري تحطه بملف منفصل) أو أعلى layout/page/robots
const ENV = process.env.VERCEL_ENV ?? process.env.NODE_ENV; // 'production' | 'preview' | 'development'
const VERCEL_URL = process.env.VERCEL_URL; // ex: myapp.vercel.app

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (VERCEL_URL ? `https://${VERCEL_URL}` : "http://localhost:3000");

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || ""; // مثال: G-XXXXXXX
export const GADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || ""; // مثال: AW-XXXXXXXXX

export const IS_PROD = ENV === "production";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  // مهم لتحويل الروابط/الصور في الميتاداتا إلى مطلقة تلقائياً
  metadataBase: new URL(SITE_URL),

  // قالب العناوين
  title: {
    default: "RoboFix",
    template: "%s | RoboFix",
  },

  // وصف عام للموقع
  description:
    "Robot süpürge onarım, bakım ve rehberler. Bursa ve çevresinde hızlı, şeffaf ve garantili servis.",

  // روابط بديلة (canonical للصفحة الرئيسية)
  alternates: {
    canonical: "/",
  },

  // Open Graph الافتراضي (يتجاوز في الصفحات الديناميكية عبر generateMetadata)
  openGraph: {
    type: "website",
    siteName: "RoboFix",
    locale: "tr_TR",
    url: "/",
    images: ["/og.png"],
  },

  // بطاقة تويتر الافتراضية
  twitter: {
    card: "summary_large_image",
    title: "RoboFix",
    description:
      "Robot süpürge onarım, bakım ve seçim rehberleri. Uzman ipuçlarıyla daha verimli temizlik.",
    images: ["/og.png"],
  },

  // إعدادات Robots افتراضية
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  // أيقونات (عدّل حسب ملفاتك في /public)
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png" }],
    shortcut: [{ url: "/favicon-16x16.png" }],
  },
};

// اختيارية لكن مفيدة للـPWA/الألوان
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
  ],
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" dir="ltr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh bg-background text-foreground`}
      >
        {/* Google tag (gtag.js) — يعمل لِـ GA4 و/أو Google Ads حسب الـIDs المتوفرة */}
        {(GA4_ID || GADS_ID) && (
          <>
            <Script
              src={`https://www.googletagmanager.com/gtag/js?id=${
                GA4_ID || GADS_ID
              }`}
              strategy="afterInteractive"
            />
            <Script id="gtag-init" strategy="afterInteractive">
              {`
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}

                // Consent Mode v2 — افتراضياً مرفوض حتى يوافق المستخدم (تقدر تحدّثه لاحقاً)
                gtag('consent', 'default', {
                  ad_storage: 'denied',
                  ad_user_data: 'denied',
                  ad_personalization: 'denied',
                  analytics_storage: 'denied'
                });

                gtag('js', new Date());

                ${
                  GA4_ID
                    ? `gtag('config', '${GA4_ID}', {
                  anonymize_ip: true,
                  cookie_flags: 'SameSite=None;Secure',
                   send_page_view: false
                });`
                    : ""
                }

                ${GADS_ID ? `gtag('config', '${GADS_ID}');` : ""}
              `}
            </Script>
          </>
        )}

        {/* ✅ تتبّع صفحات الـSPA (اختياري): 
            أنشئ الملف src/app/analytics.tsx ثم فعِّل السطرين التاليين */}

        {/* import Analytics from "./analytics";  ← ضِف هذا الاستيراد أعلى الملف عند التفعيل */}
        {/* <Analytics /> */}
        <Analytics />
        {children}
      </body>
    </html>
  );
}
