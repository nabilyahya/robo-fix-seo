"use client";

import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useTransform,
} from "framer-motion";
import Image from "next/image";
import { useEffect } from "react";
import { reportAdsConversionThenNavigate } from "@/lib/ads";

export default function HeroSection() {
  // Mouse parallax for foreground group
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rotateX = useTransform(my, [-50, 50], [6, -6]);
  const rotateY = useTransform(mx, [-50, 50], [-6, 6]);
  const translateX = useTransform(mx, [-50, 50], [-8, 8]);
  const translateY = useTransform(my, [-50, 50], [-6, 6]);

  // Animated radial highlight following cursor
  const glowX = useTransform(mx, [-50, 50], ["20%", "80%"]);
  const glowY = useTransform(my, [-50, 50], ["30%", "70%"]);
  const glow = useMotionTemplate`radial-gradient(60% 60% at ${glowX} ${glowY}, rgba(255,255,255,0.10), transparent 60%)`;
  const GADS_PHONE =
    process.env.NEXT_PUBLIC_GADS_PHONE || "AW-17534185067/NLoeCOO285cbEOvc-ahB";
  useEffect(() => {
    // احترم تفضيل تقليل الحركة
    const prefersReduced =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (prefersReduced) return;

    const handle = (e: MouseEvent) => {
      const { innerWidth, innerHeight } = window;
      const x = (e.clientX / innerWidth) * 100 - 50; // -50 -> 50
      const y = (e.clientY / innerHeight) * 100 - 50;
      mx.set(x);
      my.set(y);
    };
    window.addEventListener("mousemove", handle);
    return () => window.removeEventListener("mousemove", handle);
  }, [mx, my]);

  return (
    <section
      className="@container relative"
      id="home"
      aria-labelledby="hero-title"
    >
      <div className="p-2 sm:p-4">
        <motion.div
          className="relative overflow-hidden rounded-2xl"
          initial={{ scale: 1, opacity: 0 }}
          animate={{ scale: 1.01, opacity: 1 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
        >
          {/* ✅ صورة الهيرو باستخدام next/image بدلاً من خلفية CSS */}
          <div className="absolute inset-0 -z-10">
            <Image
              src="/hero-bg.jpg" // أو استوردها: import hero from "@/public/hero-bg.jpg"
              alt="" // زخرفية فقط
              priority // مهم: يجعلها High Priority/LCP
              fill // تغطية الحاوية
              sizes="100vw" // هذه الصورة بعرض الشاشة
              className="object-cover object-center"
              placeholder="empty" // أو "blur" لو استوردتها ثابتًا
            />
          </div>

          {/* Ken Burns (اختياري، خفيف) */}
          <motion.div
            aria-hidden
            className="absolute inset-0 -z-10"
            initial={{ scale: 1.04 }}
            animate={{ scale: 1.08 }}
            transition={{
              duration: 18,
              ease: "easeInOut",
              repeat: Infinity,
              repeatType: "mirror",
            }}
          />

          {/* تظليل فوق الصورة */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/45 to-black/60" />

          {/* توهج يتبع المؤشر */}
          <motion.div
            aria-hidden
            className="absolute inset-0"
            style={{ backgroundImage: glow }}
          />

          {/* المحتوى */}
          <motion.div
            style={{ rotateX, rotateY }}
            className="relative z-10 flex min-h-[300px] sm:min-h-[420px] lg:min-h-[520px] items-center justify-center p-4 sm:p-8"
          >
            <motion.div
              style={{ x: translateX, y: translateY }}
              className="mx-auto flex max-w-5xl flex-col items-center text-center gap-4 sm:gap-6"
            >
              <motion.h1
                id="hero-title"
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="text-white text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1]"
              >
                Robot Süpürge Tamiri
              </motion.h1>

              <motion.p
                initial={{ y: 20, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.05, ease: "easeOut" }}
                className="text-white/90 font-bold text-sm sm:text-base lg:text-lg max-w-2xl"
              >
                Hızlı servis. Yüksek kalite. Uygun fiyat.
              </motion.p>

              <div className="relative">
                <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
                  {[
                    "Aynı Gün Servis",
                    "Orijinal Parça",
                    "Garantili İşçilik",
                  ].map((t, i) => (
                    <motion.span
                      key={t}
                      initial={{ y: 10, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{
                        duration: 0.5,
                        delay: 0.1 + i * 0.08,
                        ease: "easeOut",
                      }}
                      className="rounded-full bg-white/10 text-white/90 backdrop-blur px-3 py-1 text-xs sm:text-sm border border-white/15 shadow-sm"
                    >
                      {t}
                    </motion.span>
                  ))}
                </div>
              </div>

              <motion.div
                initial={{ scale: 0.98, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.25, ease: "easeOut" }}
                className="mt-2"
              >
                <Button
                  asChild
                  className="group relative h-11 sm:h-12 px-5 sm:px-7 font-bold text-base sm:text-lg rounded-xl shadow-lg shadow-black/25 hover:shadow-black/30"
                  aria-label="Robot süpürge tamiri için hemen arayın"
                >
                  <a
                    href="tel:+905515222067"
                    onClick={(e) => {
                      e.preventDefault();
                      reportAdsConversionThenNavigate(
                        GADS_PHONE,
                        "tel:+905515222067"
                      );
                    }}
                  >
                    <span
                      className="absolute -inset-px rounded-xl bg-white/10 opacity-0 group-hover:opacity-100 transition"
                      aria-hidden
                    />
                    <span className="relative z-10 inline-flex items-center gap-2">
                      <Phone className="h-5 w-5" aria-hidden />
                      <span className="truncate">+90 551 522 20 67</span>
                      <span className="hidden sm:inline-block text-white/80 font-semibold">
                        • Hemen Ara
                      </span>
                    </span>
                    <span
                      aria-hidden
                      className="pointer-events-none absolute -z-0 inset-0 rounded-xl"
                    >
                      <span className="absolute inset-0 -z-10 m-auto h-4 w-4 rounded-full animate-ping bg-white/40" />
                    </span>
                  </a>
                </Button>
              </motion.div>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.35 }}
                className="text-[11px] sm:text-xs text-white/70"
              >
                Bursa ve çevresi • 7/24 Destek • Ücretsiz ön kontrol
              </motion.p>
            </motion.div>
          </motion.div>

          {/* حواف ظل ناعمة */}
          <div className="pointer-events-none absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-black/50 via-transparent to-transparent" />
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        </motion.div>

        {/* Scroll cue */}
        <motion.div
          initial={{ y: 0 }}
          animate={{ y: [0, 6, 0] }}
          transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          className="mx-auto mt-4 flex items-center justify-center text-white/70"
          aria-hidden
        >
          <div className="h-9 w-5 rounded-full border border-white/30 flex items-start justify-center p-1">
            <div className="h-1.5 w-1.5 rounded-full bg-white/80" />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
