// src/app/blog/[slug]/page.tsx
import Link from "next/link";
import Image from "next/image";
import ReactMarkdown from "react-markdown";
import type { Components as MDComponents } from "react-markdown";
import remarkGfm from "remark-gfm";
import remarkBreaks from "remark-breaks";
import { Clock, ArrowLeft, Check } from "lucide-react";
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

// ====== إبراز الكلمات المفتاحية داخل Markdown ======
function escapeRegExp(str: string) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
function buildKeywordRegex(kw: string) {
  return new RegExp(
    `(^|[^\\wçğıİöşüÇĞİÖŞÜ])(${escapeRegExp(kw)})(?=$|[^\\wçğıİöşüÇĞİÖŞÜ])`,
    "giu"
  );
}
function boldKeywordsInMarkdown(md: string, kws?: string[]) {
  if (!kws || !kws.length) return md;
  let out = md;
  for (const kw of kws) {
    const rx = buildKeywordRegex(kw);
    out = out.replace(rx, (_m, p1, p2) => `${p1}**${p2}**`);
  }
  return out;
}

// ====== مكوّنات Markdown (Typed) مع تحسينات للديسكتوب ======
const mdComponents: MDComponents = {
  p: ({ children }) => (
    <p className="leading-7 [&:not(:first-child)]:mt-4">{children}</p>
  ),

  // قائمة نقطية (فراغات أهدأ على الديسكتوب)
  ul: ({ children, ...props }) => (
    <ul
      {...props}
      className="my-4 ms-5 list-disc space-y-1.5 md:space-y-2 marker:text-primary/90"
    >
      {children}
    </ul>
  ),

  // قائمة مرقّمة
  ol: ({ children, ...props }) => (
    <ol
      {...props}
      className="my-4 ms-5 list-decimal space-y-1.5 md:space-y-2 marker:text-primary/90"
    >
      {children}
    </ol>
  ),

  // عنصر قائمة (مع دعم task list من GFM)
  li: ({ children, ...props }: any) => {
    const first = Array.isArray(children) ? children[0] : children;
    const isTask =
      first?.props?.node?.children?.[0]?.type === "element" &&
      first?.props?.node?.children?.[0]?.tagName === "input" &&
      first?.props?.node?.children?.[0]?.properties?.type === "checkbox";

    if (isTask) {
      const checked = first.props.node.children[0].properties?.checked ?? false;
      return (
        <li {...props} className="ps-1">
          <span className="inline-flex items-start gap-2">
            <span
              aria-hidden
              className={`mt-1 inline-flex h-4 w-4 items-center justify-center rounded border ${
                checked
                  ? "bg-primary/10 border-primary/60"
                  : "bg-transparent border-muted-foreground/30"
              }`}
            >
              {checked ? <Check className="h-3 w-3" /> : null}
            </span>
            <span className="[&_input]:hidden">{children}</span>
          </span>
        </li>
      );
    }

    return (
      <li {...props} className="ps-1">
        {children}
      </li>
    );
  },

  blockquote: ({ children }) => (
    <blockquote className="my-6 border-s-4 border-primary/40 ps-4 italic text-muted-foreground">
      {children}
    </blockquote>
  ),
  hr: () => <hr className="my-8 border-t border-border/70" />,

  // إصلاح Typing لـ <pre> عبر cast محلي
  pre: ((props) => {
    const { className, children, ...rest } =
      props as React.HTMLAttributes<HTMLPreElement> & {
        children?: React.ReactNode;
      };
    return (
      <pre
        {...rest}
        className={`my-6 overflow-x-auto rounded-lg border bg-muted/40 p-4 text-sm ${
          className ?? ""
        }`}
      >
        {children}
      </pre>
    );
  }) as MDComponents["pre"],

  // إصلاح Typing لـ <code> + دعم inline
  code: ((props) => {
    const { className, children, ...rest } = props as {
      inline?: boolean;
      className?: string;
      children?: React.ReactNode;
    } & React.HTMLAttributes<HTMLElement>;

    // @ts-expect-error — inline يُحقن وقت التشغيل من react-markdown
    const inline: boolean | undefined = (props as any).inline;

    if (inline) {
      return (
        <code
          {...rest}
          className={`rounded bg-muted/40 px-1.5 py-0.5 text-[0.9em] ${
            className ?? ""
          }`}
        >
          {children}
        </code>
      );
    }
    return (
      <code {...rest} className={className}>
        {children}
      </code>
    );
  }) as MDComponents["code"],

  // عناوين مرنة عبر clamp لنتائج أنعم على الديسكتوب
  h2: ({ children }) => (
    <h2 className="mt-8 mb-3 scroll-m-20 font-extrabold tracking-tight text-[clamp(22px,2.6vw,34px)]">
      {children}
    </h2>
  ),
  h3: ({ children }) => (
    <h3 className="mt-6 mb-2 scroll-m-20 font-extrabold tracking-tight text-[clamp(18px,2.1vw,28px)]">
      {children}
    </h3>
  ),
};

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

  // إبراز الكلمات المفتاحية تلقائيًا
  const contentWithBold = boldKeywordsInMarkdown(post.content, post.keywords);

  return (
    <article className="py-8 sm:py-12 lg:py-16">
      {/* قياس السطر: 68ch لقراءة ممتازة على الديسكتوب */}
      <div className="px-4 md:px-6 mx-auto max-w-[68ch]">
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
          {/* عنوان أساسي مرن بالمقاس */}
          <h1 className="text-foreground font-black tracking-[-0.02em] leading-tight text-[clamp(28px,3.5vw,44px)]">
            {post.title}
          </h1>
          <div className="mt-3 flex items-center gap-2 text-[12px] text-muted-foreground">
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
              // تحديد الارتفاع على الشاشات الكبيرة
              className="w-full h-auto object-cover max-h-[42vh] md:max-h-[440px]"
              priority
            />
          </AnimatedCover>
        )}

        {/* تنسيق ذكي + تحجيم نص عام أفضل للديسكتوب */}
        <div
          className="
            prose prose-invert max-w-none
            prose-headings:font-extrabold
            prose-a:text-primary hover:prose-a:underline
            prose-p:leading-relaxed
            text-[15.5px] md:text-[16px] lg:text-[17px]

            /* مسافات العناوين */
            prose-h2:mt-8 prose-h2:mb-3
            prose-h3:mt-6 prose-h3:mb-2

            /* ضبط القوائم */
            prose-ul:my-4 prose-ol:my-4
          "
        >
          <ReactMarkdown
            remarkPlugins={[remarkGfm, remarkBreaks]}
            components={mdComponents}
          >
            {contentWithBold}
          </ReactMarkdown>
        </div>
      </div>
    </article>
  );
}
