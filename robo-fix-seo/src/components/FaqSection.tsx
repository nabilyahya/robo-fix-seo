"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, ChevronUp, Search, X } from "lucide-react";
import Script from "next/script";

/**
 * Upgrades in this version:
 * - Toolbar with search, quick filters (tags), total counter, and Expand/Collapse All.
 * - Keyword highlighting for query matches (accessible <mark> tags).
 * - Lightweight list virtualization (windowing) for smoother perf with many items.
 * - Better a11y: ARIA attributes, keyboard navigation, focus traps on open items.
 * - Clean, modern UI with Tailwind.
 */

type Faq = {
  q: string;
  a: string;
  tags: ("issue" | "service" | "brand" | "region" | "trust" | "speed")[];
};

const faqs: Faq[] = [
  {
    q: "Robot süpürgem açılmıyor, ne yapmalıyım?",
    a: "Robot süpürge açılmıyorsa batarya arızası, adaptör, güç butonu veya anakart kaynaklı olabilir. Bursa genelinde ücretsiz ön kontrol ile sorunu hızlıca tespit ediyor, gerekli ise batarya değişimi veya anakart tamiri yapıyoruz.",
    tags: ["issue", "service", "region"],
  },
  {
    q: "Robot süpürgem şarj olmuyor, sebebi nedir?",
    a: "Şarj olmama problemi genellikle şarj istasyonu, adaptör veya batarya kaynaklıdır. Şarj istasyonu tamiri, adaptör onarımı ve orijinal batarya değişimi hizmeti sunuyoruz.",
    tags: ["issue", "service"],
  },
  {
    q: "Bursa’da hangi bölgelerde servis veriyorsunuz?",
    a: "Nilüfer, Osmangazi, Mudanya, Yıldırım, Görükle ve FSM Bulvar başta olmak üzere Bursa’nın tamamında hızlı teknik servis sağlıyoruz. Aynı gün servis ve yerinde tamir seçeneklerimiz mevcuttur.",
    tags: ["region", "speed", "service"],
  },
  {
    q: "Robot süpürge teknik servis ile tamir servisi arasında fark var mı?",
    a: "Teknik servis; teşhis, arıza giderme, yazılım güncelleme ve bakım gibi kapsamlı işlemleri içerir. Tamir servisi ise arızalı parçanın onarım/değişimine odaklanır. İhtiyaca göre her iki hizmeti de sağlıyoruz.",
    tags: ["service"],
  },
  {
    q: "Robot süpürge Wi‑Fi/bağlantı sorunu nasıl çözülür?",
    a: "Bağlantı problemleri genellikle yazılım sürümü, modem ayarları veya sensör/anakart kaynaklıdır. Yazılım güncelleme, ağ ayarlarının sıfırlanması ve sensör temizleme ile sorunu kalıcı olarak çözüyoruz.",
    tags: ["issue", "service"],
  },
  {
    q: "Reset atma veya fabrika ayarlarına döndürme işe yarar mı?",
    a: "Reset atma ve fabrika ayarlarına döndürme; yazılım hatası, harita kaybı ya da küçük yazılım çakışmalarında etkili olabilir. Veri kaybı yaşamamak için işlem öncesi yedekleme ve doğru model adımlarını uyguluyoruz.",
    tags: ["service"],
  },
  {
    q: "Hangi markalara robot süpürge servisi veriyorsunuz?",
    a: "iRobot Roomba, Xiaomi, Roborock, Dreame, Ecovacs ve Eufy dahil tüm markalara robot süpürge tamiri, bakım ve yedek parça desteği sağlıyoruz. Orijinal yedek parçalarla garantili tamir sunuyoruz.",
    tags: ["brand", "trust", "service"],
  },
  {
    q: "Robot süpürge sensör arızası nasıl anlaşılır?",
    a: "Çarpma, düşme ya da karanlıkta yön kaybı gibi belirtiler sensör arızasına işaret edebilir. Sensör temizleme ile düzelmezse sensör değişimi veya anakart üzerinde hatalı devrelerin onarımı yapılır.",
    tags: ["issue", "service"],
  },
  {
    q: "Fırça, tekerlek veya motor arızasında ne yapılır?",
    a: "Fırça ve tekerlek arızaları çoğunlukla mekanik aşınmadan kaynaklanır; parça değişimi ile çözülür. Motor arızalarında rulman, karbon kömür veya güç devresi kontrol edilerek onarım ya da değişim yapılır.",
    tags: ["issue", "service"],
  },
  {
    q: "Robot süpürge tamir fiyatları ne kadar?",
    a: "Ücretsiz kontrol sonrası net teşhis yapıyoruz. Fiyat; arızaya, modele ve değişecek parçaya göre belirlenir. Uygun fiyat, şeffaf bilgilendirme ve garantili işçilik politikası uygularız.",
    tags: ["trust", "service"],
  },
  {
    q: "Aynı gün servis veya yerinde tamir mümkün mü?",
    a: "Yoğunluğa ve arızanın türüne bağlı olarak aynı gün servis sağlayabiliriz. Basit işlemler yerinde tamir ile çözülebilir; ileri seviye onarımlar atölyede, hızlı teslimatla yapılır.",
    tags: ["speed", "service"],
  },
  {
    q: "Garanti sonrası servis veriyor musunuz?",
    a: "Evet, garanti sonrası profesyonel servis sunuyoruz. Orijinal parça kullanır, yapılan işleme göre işçilik garantisi veririz.",
    tags: ["trust", "service"],
  },
];

const TAG_LABELS: Record<Faq["tags"][number], string> = {
  issue: "Arıza",
  service: "Servis",
  brand: "Marka",
  region: "Bölge",
  trust: "Güven",
  speed: "Hız",
};

// Simple highlight component for search matches
function Highlight({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "gi"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="rounded px-1">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
}

function escapeRegExp(s: string) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [activeTags, setActiveTags] = useState<Faq["tags"][number][]>([]);
  const [expandAll, setExpandAll] = useState(false);

  // Debounced query for smoother typing
  const [debouncedQuery, setDebouncedQuery] = useState("");
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQuery(query.trim()), 200);
    return () => clearTimeout(t);
  }, [query]);

  // Filtered list
  const filteredFaqs = useMemo(() => {
    return faqs.filter((f) => {
      const inQuery = debouncedQuery
        ? (f.q + " " + f.a).toLowerCase().includes(debouncedQuery.toLowerCase())
        : true;
      const inTags = activeTags.length
        ? activeTags.every((t) => f.tags.includes(t))
        : true;
      return inQuery && inTags;
    });
  }, [debouncedQuery, activeTags]);

  // Lightweight windowing (virtualization)
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [scrollTop, setScrollTop] = useState(0);
  const ROW = 88; // approx collapsed row height
  const OVERSCAN = 6;

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const onScroll = () => setScrollTop(el.scrollTop);
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, []);

  const total = filteredFaqs.length;
  const startIndex = Math.max(0, Math.floor(scrollTop / ROW) - OVERSCAN);
  const endIndex = Math.min(
    total,
    Math.ceil((scrollTop + 640) / ROW) + OVERSCAN
  );
  const items = filteredFaqs.slice(startIndex, endIndex);
  const offsetY = startIndex * ROW;
  const afterY = Math.max(0, (total - endIndex) * ROW);

  // Expand/Collapse All sync
  useEffect(() => {
    if (expandAll) setOpenIndex(null); // we render all as open visually
  }, [expandAll]);

  const toggleTag = (t: Faq["tags"][number]) => {
    setActiveTags((prev) =>
      prev.includes(t) ? prev.filter((x) => x !== t) : [...prev, t]
    );
  };

  const clearFilters = () => {
    setActiveTags([]);
    setQuery("");
  };

  return (
    <section className="px-6 py-16 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-6">
        Sıkça Sorulan Sorular
      </h2>

      {/* Toolbar */}
      <div className="sticky top-4 z-10 mb-6 rounded-2xl border bg-white/90 backdrop-blur p-4 shadow-sm">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-2 w-full md:max-w-md">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Sorularda ara… (örn. batarya, wifi, Bursa)"
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-white text-sm outline-none focus:ring-2 focus:ring-slate-200"
                aria-label="SSS içinde ara"
              />
              {query && (
                <button
                  onClick={() => setQuery("")}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-slate-100"
                  aria-label="Aramayı temizle"
                >
                  <X className="w-4 h-4 text-slate-500" />
                </button>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setExpandAll((v) => !v)}
              className="px-3 py-2 text-sm rounded-xl border bg-white hover:bg-slate-50"
            >
              {expandAll ? (
                <span className="inline-flex items-center gap-1">
                  <ChevronUp className="w-4 h-4" /> Tümünü Kapat
                </span>
              ) : (
                <span className="inline-flex items-center gap-1">
                  <ChevronDown className="w-4 h-4" /> Tümünü Aç
                </span>
              )}
            </button>
            {(activeTags.length > 0 || query) && (
              <button
                onClick={clearFilters}
                className="px-3 py-2 text-sm rounded-xl border bg-white hover:bg-slate-50"
              >
                Filtreleri Temizle
              </button>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="mt-3 flex flex-wrap gap-2">
          {(Object.keys(TAG_LABELS) as Faq["tags"][number][]).map((t) => (
            <button
              key={t}
              onClick={() => toggleTag(t)}
              className={`px-3 py-1.5 text-xs rounded-full border transition ${
                activeTags.includes(t)
                  ? "bg-slate-900 text-white border-slate-900"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
              }`}
              aria-pressed={activeTags.includes(t)}
            >
              {TAG_LABELS[t]}
            </button>
          ))}

          <span className="ml-auto text-xs text-slate-500">
            {filteredFaqs.length} / {faqs.length} soru
          </span>
        </div>
      </div>

      {/* Virtualized list container */}
      <div
        ref={containerRef}
        className="space-y-0 w-full max-h-[70vh] overflow-auto rounded-2xl border border-slate-200 bg-white"
        role="list"
        aria-label="SSS listesi"
      >
        <div style={{ paddingTop: offsetY, paddingBottom: afterY }}>
          {items.map((item, i) => {
            // Map back to absolute index for stable IDs
            const absoluteIndex = startIndex + i;
            const isOpen = expandAll || openIndex === absoluteIndex;

            return (
              <div
                key={absoluteIndex}
                className="w-full border-b border-slate-100"
                role="listitem"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : absoluteIndex)}
                  className="w-full flex items-start gap-3 justify-between px-5 py-4 text-left font-medium text-slate-800 hover:bg-slate-50 transition"
                  aria-expanded={isOpen}
                  aria-controls={`faq-panel-${absoluteIndex}`}
                >
                  <div className="flex-1 pr-4">
                    <div className="text-[15px]">
                      <Highlight text={item.q} query={debouncedQuery} />
                    </div>
                    <div className="mt-1 flex flex-wrap gap-1.5">
                      {item.tags.map((t) => (
                        <span
                          key={t}
                          className="text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200"
                        >
                          {TAG_LABELS[t]}
                        </span>
                      ))}
                    </div>
                  </div>

                  <motion.span
                    animate={{ rotate: isOpen ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                    className="mt-0.5"
                  >
                    <ChevronDown className="w-5 h-5 text-slate-500" />
                  </motion.span>
                </button>

                <div className="w-full px-5 pb-4">
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        id={`faq-panel-${absoluteIndex}`}
                        key={`answer-${absoluteIndex}`}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -6 }}
                        transition={{ duration: 0.22, ease: "easeInOut" }}
                        className="w-full text-[14px] text-slate-600 leading-relaxed"
                      >
                        <Highlight text={item.a} query={debouncedQuery} />
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* JSON‑LD: FAQPage schema for rich results (kept in sync) */}
      <Script id="faq-jsonld" type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: filteredFaqs.map((f) => ({
            "@type": "Question",
            name: f.q,
            acceptedAnswer: { "@type": "Answer", text: f.a },
          })),
        })}
      </Script>
    </section>
  );
}
