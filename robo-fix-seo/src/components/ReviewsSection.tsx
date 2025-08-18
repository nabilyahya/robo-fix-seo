"use client";
// src/components/ReviewsSection.tsx
import { motion, useReducedMotion, type Variants } from "framer-motion";
import { Star, Quote, ExternalLink } from "lucide-react";

type Review = {
  name: string;
  gender: "male" | "female";
  avatar?: string; // مثال: "/src/assets/avatars/male-1.jpg"
  rating: 1 | 2 | 3 | 4 | 5;
  comment: string;
  date: string; // ISO أو نص
  link?: string; // رابط التقييم على Google Maps (اختياري)
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const cardVariants: Variants = {
  hidden: { opacity: 0, y: 20, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

const REVIEWS: Review[] = [
  {
    name: "Ayşe K.",
    gender: "female",
    avatar: "/src/assets/avatars/female-1.jpg",
    rating: 5,
    comment:
      "Hızlı geri dönüş ve temiz işçilik. Robot süpürgem ilk günkü gibi oldu!",
    date: "2025-07-18",
    link: "https://maps.google.com/?q=robofix+reviews", // عدّل الرابط
  },
  {
    name: "Mehmet A.",
    gender: "male",
    avatar: "/src/assets/avatars/male-1.jpg",
    rating: 5,
    comment:
      "Şeffaf fiyat, orijinal parça. Aynı gün teslim ettiler, teşekkürler.",
    date: "2025-08-02",
    link: "https://maps.google.com/?q=robofix+reviews",
  },
  {
    name: "Elif T.",
    gender: "female",
    avatar: "/src/assets/avatars/female-2.jpg",
    rating: 4,
    comment: "Profesyonel yaklaşım. Harita sorununu hızlıca çözdüler.",
    date: "2025-08-09",
    link: "https://maps.google.com/?q=robofix+reviews",
  },
];

function Stars({ value }: { value: Review["rating"] }) {
  return (
    <div
      className="inline-flex items-center gap-0.5"
      aria-label={`${value} yıldız`}
    >
      {[1, 2, 3, 4, 5].map((i) => {
        const filled = i <= value;
        return (
          <Star
            key={i}
            className={`h-4 w-4 ${
              filled ? "text-yellow-400" : "text-muted-foreground/40"
            }`}
            aria-hidden="true"
            // يجعل نجمة lucide ملوّنة (ممتلئة) عند التفعيل:
            {...(filled ? { fill: "currentColor" } : {})}
          />
        );
      })}
    </div>
  );
}

function Avatar({
  avatar,
  gender,
  name,
}: {
  avatar?: string;
  gender: Review["gender"];
  name: string;
}) {
  const fallback =
    gender === "female" ? "/avatars/female.png" : "/avatars/male.png";
  return (
    <div className="relative h-10 w-10 sm:h-12 sm:w-12 overflow-hidden rounded-full border border-white/10 bg-white/5">
      <img
        src={avatar || fallback}
        onError={(e) => {
          (e.currentTarget as HTMLImageElement).src = fallback;
        }}
        alt={`${name} avatarı`}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
}

export default function ReviewsSection() {
  const reduce = useReducedMotion();

  return (
    <section
      id="reviews"
      className="py-8 sm:py-10 lg:py-14"
      aria-labelledby="reviews-title"
    >
      <div className="px-4 max-w-5xl mx-auto">
        <header className="text-center max-w-2xl mx-auto mb-4 sm:mb-6">
          <h2
            id="reviews-title"
            className="text-foreground text-2xl sm:text-3xl font-black tracking-[-0.02em]"
          >
            Müşteri değerlendirmeleri
          </h2>
          <p className="mt-1 text-muted-foreground text-sm sm:text-base">
            Deneyimler
          </p>
        </header>

        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 p-0"
          variants={reduce ? undefined : containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
        >
          {REVIEWS.map((r, idx) => (
            <motion.article
              key={idx}
              variants={reduce ? undefined : cardVariants}
              className="group flex flex-col rounded-lg border border-border bg-card p-4 shadow-card transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
            >
              {/* header */}
              <div className="flex items-center gap-3">
                <Avatar avatar={r.avatar} gender={r.gender} name={r.name} />
                <div className="flex flex-col">
                  <span className="text-card-foreground text-sm sm:text-base font-bold leading-tight">
                    {r.name}
                  </span>
                  <span className="text-[11px] text-muted-foreground">
                    Google Maps
                  </span>
                </div>
                <div className="ml-auto text-[11px] text-muted-foreground">
                  <time dateTime={r.date}>
                    {new Date(r.date).toLocaleDateString("tr-TR", {
                      year: "numeric",
                      month: "short",
                      day: "2-digit",
                    })}
                  </time>
                </div>
              </div>

              {/* rating */}
              <div className="mt-3">
                <Stars value={r.rating} />
              </div>

              {/* comment */}
              <p className="mt-2 text-muted-foreground text-sm leading-relaxed">
                <Quote
                  className="mr-1 inline h-4 w-4 opacity-60"
                  aria-hidden="true"
                />
                {r.comment}
              </p>

              {/* footer */}
              {r.link && (
                <div className="mt-3 pt-3 border-t border-white/10">
                  <a
                    href={r.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-primary hover:underline"
                    aria-label="Google Maps yorumunu aç"
                  >
                    Yorumu Gör
                    <ExternalLink className="h-3.5 w-3.5" />
                  </a>
                </div>
              )}
            </motion.article>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
