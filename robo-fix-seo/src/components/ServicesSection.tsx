"use client";
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

const ServicesSection = () => {
  const reduce = useReducedMotion();

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
        variants={reduce ? undefined : containerVariants}
        initial={reduce ? undefined : "hidden"}
        whileInView={reduce ? undefined : "show"}
        viewport={{ once: true, amount: 0.18 }}
      >
        {services.map((service) => (
          <motion.article
            key={service.title}
            variants={reduce ? undefined : cardVariants}
            className="group flex flex-1 gap-3 rounded-lg border border-border bg-card p-4 flex-col shadow-card hover:shadow-lg transition-all duration-300 min-h-[140px] sm:min-h-[160px] will-change-transform"
            whileHover={reduce ? undefined : { y: -2 }}
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
