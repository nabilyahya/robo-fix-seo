"use client";
import { motion, type Variants } from "framer-motion";

const BRANDS = [
  { name: "Roborock", file: "roborock.png" },
  { name: "Xiaomi", file: "xiaomi.svg" },
  { name: "Shark", file: "shark.png" },
  { name: "iRobot", file: "irobot.png" },

  { name: "Grundig", file: "grundig.png" },
  { name: "Dreame", file: "dreame.png" },
  { name: "Ecovacs", file: "ecovacs.png" },
  { name: "Eufy", file: "eufy.png" },

  { name: "Roidmi", file: "roidmi.jpg" },
  { name: "Dyson", file: "dyson.png" },
  { name: "Samsung", file: "samsung.avif" },
  { name: "Philips", file: "philips.png" },
];

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.06, delayChildren: 0.05 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12, scale: 0.98 },
  show: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] },
  },
};

const BrandsSection = () => {
  return (
    <section
      id="brands"
      className="py-8 sm:py-10 lg:py-14"
      aria-labelledby="brands-title"
    >
      <div className="px-4 max-w-[1100px] mx-auto">
        <header className="text-center max-w-2xl mx-auto">
          <h2
            id="brands-title"
            className="text-foreground text-2xl sm:text-3xl font-black tracking-[-0.02em]"
          >
            Tüm Markalara Servis
          </h2>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base">
            Robot süpürgelerde uzmanız — tüm marka ve modelleri onarıyoruz.
          </p>
        </header>

        <motion.ul
          className="mt-6 sm:mt-8 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4"
          variants={containerVariants}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.18 }}
          role="list"
          aria-label="Desteklenen robot süpürge markaları"
        >
          {BRANDS.map((b) => (
            <motion.li
              key={b.name}
              variants={itemVariants}
              role="listitem"
              className="group relative rounded-xl border border-border bg-card/60 p-4 sm:p-5 flex items-center justify-center shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5"
              title={b.name}
            >
              <div className="w-full h-10 sm:h-12 flex items-center justify-center">
                <img
                  src={`/brands/${b.file}`}
                  alt={`${b.name} logosu`}
                  loading="lazy"
                  className="
                    max-h-full max-w-[140px] object-contain
                    grayscale-0 opacity-100
                    sm:grayscale sm:opacity-90
                    sm:group-hover:grayscale-0 sm:group-hover:opacity-100
                    transition
                  "
                />
              </div>

              {/* subtle highlight on hover */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition bg-gradient-to-b from-white/5 via-transparent to-white/5"
              />
            </motion.li>
          ))}
        </motion.ul>

        <p className="mt-4 text-[11px] sm:text-xs text-muted-foreground text-center">
          * Logolar yalnızca tanımlama amacıyla gösterilmiştir. Tüm marka ve
          modeller için servis veriyoruz.
        </p>
      </div>
    </section>
  );
};

export default BrandsSection;
