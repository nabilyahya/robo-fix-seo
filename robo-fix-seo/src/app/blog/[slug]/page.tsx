// src/app/blog/[slug]/page.tsx
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { Clock, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getPostBySlug, getAllPostSlugs } from "@/lib/posts";
import AnimatedCover from "@/components/Blog/AnimatedCover";

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

// لو بدك SSG: خليه sync عادي
export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

// ⚠️ مع Next 15/React 19: params هي Promise
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) return { title: "Yazı bulunamadı", robots: { index: false } };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      images: post.image ? [post.image] : [],
      url: `/blog/${slug}`,
    },
    twitter: { card: "summary_large_image" },
  };
}

// (اختياري) زمن إعادة التحقق
export const revalidate = 3600;

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = getPostBySlug(slug);
  if (!post) notFound();

  const dtf = new Intl.DateTimeFormat("tr-TR", {
    year: "numeric",
    month: "long",
    day: "2-digit",
    timeZone: "UTC",
  });

  // JSON-LD (Article + Breadcrumb)
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    dateModified: post.date,
    image: post.image ? [post.image] : [],
    author: { "@type": "Organization", name: "Robonarim" },
    publisher: { "@type": "Organization", name: "Robonarim" },
    mainEntityOfPage: `${siteUrl}/blog/${slug}`,
  };

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Blog",
        item: `${siteUrl}/blog`,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: post.title,
        item: `${siteUrl}/blog/${slug}`,
      },
    ],
  };

  return (
    <article className="py-8 sm:py-12 lg:py-16">
      <div className="px-4 max-w-3xl mx-auto">
        <div className="mb-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Link>
        </div>

        <header className="mb-4 sm:mb-6">
          <h1 className="text-foreground text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.02em]">
            {post.title}
          </h1>
          <div className="mt-2 flex items-center gap-2 text-[12px] text-muted-foreground">
            <time dateTime={post.date}>{dtf.format(new Date(post.date))}</time>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.read}
            </span>
          </div>
        </header>

        {/* JSON-LD */}
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleLd) }}
        />
        <script
          type="application/ld+json"
          suppressHydrationWarning
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />

        {post.image && (
          <AnimatedCover className="mb-6 overflow-hidden rounded-xl border bg-card">
            <Image
              src={post.image}
              alt={post.title}
              width={1200}
              height={630}
              className="w-full h-auto object-cover"
              priority
            />
          </AnimatedCover>
        )}

        <div className="prose prose-invert max-w-none prose-headings:font-extrabold prose-p:leading-relaxed prose-a:text-primary hover:prose-a:underline">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
