// app/blog/page.tsx
import type { Metadata } from "next";
import BlogPageClient from "./BlobPageClient";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Robot süpürge bakım, onarım ve seçim rehberleri. Uzman ipuçlarıyla daha verimli temizlik.",
  alternates: { canonical: "/blog" },
  openGraph: {
    type: "website",
    title: "Blog",
    description: "Robot süpürge bakım, onarım ve seçim rehberleri.",
    url: "/blog",
    images: [
      {
        url: `${siteUrl}/blog-og.png`,
        width: 1200,
        height: 630,
      },
    ],
  },
  twitter: { card: "summary_large_image" },
};

// (اختياري) حدّث الصفحة كل 5 دقائق إذا تغيّر المحتوى
export const revalidate = 300;

export default function BlogPage() {
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Ana Sayfa",
        item: `${siteUrl}/`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Blog",
        item: `${siteUrl}/blog`,
      },
    ],
  };

  const blogLd = {
    "@context": "https://schema.org",
    "@type": "Blog",
    name: "Robonarim Blog",
    url: `${siteUrl}/blog`,
    inLanguage: "tr-TR",
    description:
      "Robot süpürge bakım, onarım ve seçim rehberleri. Uzman ipuçlarıyla daha verimli temizlik.",
  };

  return (
    <>
      {/* JSON-LD (مهم للـRich Results) */}
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <script
        type="application/ld+json"
        suppressHydrationWarning
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogLd) }}
      />
      <BlogPageClient />
    </>
  );
}
