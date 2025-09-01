// app/blog/BlogPageClient.tsx
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Clock, Tag, ArrowRight } from "lucide-react";
import { POSTS } from "@/lib/posts";
import Header from "@/components/Header";

const TAGS = ["Tümü", ...Array.from(new Set(POSTS.map((p) => p.tag)))];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 16, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);
  return mounted;
}

export default function BlogPageClient() {
  const [activeTag, setActiveTag] = useState<string>("Tümü");
  const [query, setQuery] = useState<string>("");

  const reduce = useReducedMotion();
  const mounted = useMounted();
  const canAnimate = mounted && !reduce;

  // تنسيق تاريخ ثابت (UTC) لتجنّب اختلاف SSR/Client
  const dtf =
    typeof Intl !== "undefined"
      ? new Intl.DateTimeFormat("tr-TR", {
          year: "numeric",
          month: "short",
          day: "2-digit",
          timeZone: "UTC",
        })
      : null;

  const filtered = useMemo(() => {
    return POSTS.filter((p) => {
      const byTag = activeTag === "Tümü" || p.tag === activeTag;
      const q = query.trim().toLowerCase();
      const byQuery =
        !q ||
        p.title.toLowerCase().includes(q) ||
        p.excerpt.toLowerCase().includes(q) ||
        p.tag.toLowerCase().includes(q);
      return byTag && byQuery;
    });
  }, [activeTag, query]);

  return (
    <div>
      <Header />

      <section className="py-8 sm:py-12 lg:py-16">
        <div className="px-4 max-w-6xl mx-auto">
          <div className="flex flex-col gap-3 sm:gap-4 mb-4 sm:mb-6">
            <h1 className="text-foreground text-2xl sm:text-3xl md:text-4xl font-black tracking-[-0.02em]">
              Blog
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base max-w-2xl">
              Robot süpürge bakım, onarım ve seçim rehberleri. Uzman ipuçlarıyla
              daha verimli temizlik.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mb-6 sm:mb-8">
            <div className="flex flex-wrap gap-2">
              {TAGS.map((t) => (
                <button
                  key={t}
                  onClick={() => setActiveTag(t)}
                  className="rounded-full border px-3 py-1.5 text-xs sm:text-sm transition data-[active=true]:bg-primary data-[active=true]:text-primary-foreground hover:border-primary"
                  data-active={activeTag === t}
                  aria-pressed={activeTag === t}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="flex-1" />

            <div className="relative max-w-xs">
              <input
                type="search"
                placeholder="Ara..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/40"
                aria-label="Blog içinde ara"
              />
            </div>
          </div>

          <motion.div
            variants={canAnimate ? containerVariants : undefined}
            initial={canAnimate ? "hidden" : false}
            whileInView={canAnimate ? "show" : undefined}
            viewport={canAnimate ? { once: true, amount: 0.15 } : undefined}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6"
          >
            {filtered.map((post) => (
              <motion.article
                key={post.slug}
                variants={canAnimate ? cardVariants : undefined}
                className="group overflow-hidden rounded-2xl border bg-card shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-lg"
              >
                <Link
                  href={`/blog/${post.slug}`}
                  aria-label={`${post.title} yazısını aç`}
                >
                  <div className="relative aspect-[16/10] overflow-hidden">
                    {/* استخدم sizes لتحسين الأداء على مختلف الشاشات */}
                    <img
                      src={post.image}
                      alt={post.title}
                      loading="lazy"
                      sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
                      className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.05]"
                    />
                    <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/40 via-black/10 to-transparent opacity-70 group-hover:opacity-80 transition" />
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-white/90 px-2 py-1 text-[11px] font-semibold text-foreground">
                      <Tag className="h-3.5 w-3.5" />
                      {post.tag}
                    </span>
                  </div>
                </Link>

                <div className="p-4 sm:p-5">
                  <div className="flex items-center gap-2 text-[12px] text-muted-foreground mb-2">
                    <time dateTime={post.date}>
                      {dtf ? dtf.format(new Date(post.date)) : post.date}
                    </time>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" />
                      {post.read}
                    </span>
                  </div>

                  <h2 className="text-card-foreground text-base sm:text-lg font-bold leading-tight line-clamp-2">
                    {post.title}
                  </h2>
                  <p className="mt-2 text-muted-foreground text-sm line-clamp-3">
                    {post.excerpt}
                  </p>

                  <div className="mt-3">
                    <Link
                      href={`/blog/${post.slug}`}
                      className="inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
                    >
                      Devamını Oku
                      <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
                    </Link>
                  </div>
                </div>
              </motion.article>
            ))}
          </motion.div>

          {filtered.length === 0 && (
            <div className="mt-10 text-center text-muted-foreground">
              Aramanızla eşleşen sonuç bulunamadı.
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
