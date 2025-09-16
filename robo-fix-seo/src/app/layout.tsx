// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Suspense } from "react";
import Script from "next/script";
import { Geist, Geist_Mono } from "next/font/google";

import "./globals.css";

import Analytics from "./analytics";
import ConsentBanner from "@/components/ConsentBanner";
import { SITE_URL, GA4_ID, GADS_ID } from "@/lib/site";

// ========= Fonts (swap + no preload) =========
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
  preload: false,
});

// ========= Metadata =========
export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Robonarim",
    template: "%s | Robonarim",
  },
  description:
    "Robot süpürge onarım, bakım ve rehberler. Bursa ve çevresinde hızlı, şeffاف ve garantili servis.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    siteName: "Robonarim",
    locale: "tr_TR",
    url: "/",
    images: ["/og.png"],
  },
  twitter: {
    card: "summary_large_image",
    title: "Robonarim",
    description:
      "Robot süpürge onarım, bakım ve seçim rehberleri. Uzman ipuçlarıyla daha verimli temizlik.",
    images: ["/og.png"],
  },
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
  icons: {
    icon: [{ url: "/favicon.ico" }],
    apple: [{ url: "/apple-touch-icon.png" }],
    shortcut: [{ url: "/favicon-16x16.png" }],
  },
};

// ========= Viewport =========
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0b0b0b" },
  ],
  width: "device-width",
  initialScale: 1,
};

// ========= Root Layout =========
export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="tr" dir="ltr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-dvh bg-background text-foreground`}
      >
        {/* Google tag (gtag.js) — يعمل لـ GA4 و/أو Google Ads حسب المتوفر */}
        {(GA4_ID || GADS_ID) && (
          <>
            {/* حمّل المكتبة مرة واحدة فقط بأي معرّف متوفر */}
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

                // Consent Mode v2 — افتراضياً مرفوض حتى يوافق المستخدم
                gtag('consent', 'default', {
                  ad_storage: 'denied',
                  ad_user_data: 'denied',
                  ad_personalization: 'denied',
                  analytics_storage: 'denied'
                });

                gtag('js', new Date());

                // فعّل GA4 إن وُجد
                ${
                  GA4_ID
                    ? `gtag('config', '${GA4_ID}', {
                        anonymize_ip: true,
                        cookie_flags: 'SameSite=None;Secure',
                        send_page_view: false
                      });`
                    : ""
                }

                // فعّل Google Ads إن وُجد
                ${GADS_ID ? `gtag('config', '${GADS_ID}');` : ""}
              `}
            </Script>
          </>
        )}

        {/* تتبع تنقلات SPA (عند الموافقة) */}
        <Suspense fallback={null}>
          <Analytics />
        </Suspense>

        {/* بانر الموافقة على الخصوصية (يجب أن يستدعي gtag('consent','update', ...)) */}
        <Suspense fallback={null}>
          <ConsentBanner />
        </Suspense>

        {children}
      </body>
    </html>
  );
}
