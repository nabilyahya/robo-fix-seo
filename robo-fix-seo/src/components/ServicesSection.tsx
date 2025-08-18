"use client";
import { useEffect, useState } from "react";
import { Wrench, Settings, Battery, Smartphone } from "lucide-react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

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

function useMounted() {
  const [m, setM] = useState(false);
  useEffect(() => setM(true), []);
  return m;
}

const ServicesSection = () => {
  const reduce = useReducedMotion();
  const mounted = useMounted();
  const canAnimate = mounted && !reduce; // فعّل الأنيميشن فقط بعد mount وعلى الأجهزة بدون "تقليل الحركة"

  const services = [
    {
      icon: <Wrench className="h-6 w-6" />,
      title: "Teşhis ve Onarım",
      description: "Hızlı, doğru teşhis. Etkili onarım.",
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: "Bakım ve Ayar",
      description: "Düzenli bakım. En iyi performans.",
    },
    {
      icon: <Battery className="h-6 w-6" />,
      title: "Batarya Değişimi",
      description: "Orijinal batarya. Daha uzun ömür.",
    },
    {
      icon: <Smartphone className="h-6 w-6" />,
      title: "Yazılım Güncellemeleri",
      description: "Güncel özellikler. Daha yüksek verim.",
    },
  ];

  return (
    <section
      id="services"
      className="py-4 sm:py-6 lg:py-8"
      aria-labelledby="services-title"
    >
      <h2
        id="services-title"
        className="text-foreground text-lg sm:text-xl lg:text-[22px] font-bold leading-tight tracking-[-0.015em] px-4 pb-3 pt-3 sm:pt-5"
      >
        Hizmetlerimiz
      </h2>

      <motion.div
        className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4"
        variants={canAnimate ? containerVariants : undefined}
        initial={canAnimate ? "hidden" : false} // على السيرفر: false => بدون opacity:0
        whileInView={canAnimate ? "show" : undefined}
        viewport={canAnimate ? { once: true, amount: 0.18 } : undefined}
      >
        {services.map((service) => (
          <motion.article
            key={service.title}
            variants={canAnimate ? cardVariants : undefined}
            className="group flex flex-1 gap-3 rounded-lg border border-border bg-card p-4 flex-col shadow-card hover:shadow-lg transition-all duration-300 min-h-[140px] sm:min-h-[160px] will-change-transform"
            whileHover={canAnimate ? { y: -2 } : undefined}
          >
            <div className="text-foreground flex-shrink-0" aria-hidden="true">
              {service.icon}
            </div>

            <div className="flex flex-col gap-1 flex-grow">
              <h3 className="text-card-foreground text-sm sm:text-base font-bold leading-tight">
                {service.title}
              </h3>
              <p className="text-muted-foreground text-xs sm:text-sm font-normal leading-normal">
                {service.description}
              </p>
            </div>

            <span className="mt-2 text-[11px] text-primary/80 font-semibold">
              Hızlı • Kaliteli • Uygun Fiyat
            </span>
          </motion.article>
        ))}
      </motion.div>
    </section>
  );
};

export default ServicesSection;
