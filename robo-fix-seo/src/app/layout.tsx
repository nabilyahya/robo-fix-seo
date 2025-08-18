// src/app/layout.tsx
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// عدّل الدومين النهائي من بيئة التشغيل
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

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
  metadataBase: new URL(siteUrl),

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
    images: ["/og.png"], // غيّرها إن وجدت صورة OG ثابتة
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
        {children}
      </body>
    </html>
  );
}
