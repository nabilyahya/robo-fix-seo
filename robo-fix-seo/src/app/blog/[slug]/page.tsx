import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import { Clock, ArrowLeft } from "lucide-react";
import { notFound } from "next/navigation";
import type { Metadata } from "next";

import { getPostBySlug, getAllPostSlugs } from "@/lib/posts";
import AnimatedCover from "@/components/Blog/AnimatedCover";

type PageProps = { params: { slug: string } };

export function generateStaticParams() {
  return getAllPostSlugs().map((slug) => ({ slug }));
}

export function generateMetadata({ params }: PageProps): Metadata {
  const post = getPostBySlug(params.slug);
  if (!post) return { title: "Yazı bulunamadı" };

  return {
    title: post.title,
    description: post.excerpt, // شلنا post.description لأنه مش بالـtype
    alternates: { canonical: `/blog/${params.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
      images: post.image ? [post.image] : [],
      url: `/blog/${params.slug}`,
    },
  };
}

export default function BlogPostPage({ params }: PageProps) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const date = new Date(post.date);

  return (
    <article className="py-8 sm:py-12 lg:py-16">
      <div className="px-4 max-w-3xl mx-auto">
        {/* Back */}
        <div className="mb-4">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary"
          >
            <ArrowLeft className="h-4 w-4" />
            Geri
          </Link>
        </div>

        {/* Header */}
        <header className="mb-4 sm:mb-6">
          <h1 className="text-foreground text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.02em]">
            {post.title}
          </h1>
          <div className="mt-2 flex items-center gap-2 text-[12px] text-muted-foreground">
            <time dateTime={post.date}>
              {date.toLocaleDateString("tr-TR", {
                year: "numeric",
                month: "long",
                day: "2-digit",
              })}
            </time>
            <span>•</span>
            <span className="inline-flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.read}
            </span>
          </div>
        </header>

        {/* Cover Image */}
        {post.image && (
          <AnimatedCover className="mb-6 overflow-hidden rounded-xl border bg-card">
            <Image
              src={post.image} // صور خارجية؟ لازم إعداد next.config.ts
              alt={post.title}
              width={1200}
              height={630}
              className="w-full h-auto object-cover"
              priority
            />
          </AnimatedCover>
        )}

        {/* Content */}
        <div className="prose prose-invert max-w-none prose-headings:font-extrabold prose-p:leading-relaxed prose-a:text-primary hover:prose-a:underline">
          <ReactMarkdown>{post.content}</ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
