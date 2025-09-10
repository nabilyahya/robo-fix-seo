"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    q: "Robot süpürgem açılmıyor, ne yapmalıyım?",
    a: "Eğer robot süpürge açılmıyor veya çalışmıyor ise batarya arızası, adaptör veya anakart sorunları olabilir. Bursa’da ücretsiz kontrol ile sorunu hızlıca tespit ediyoruz.",
  },
  {
    q: "Robot süpürgem şarj olmuyor, sebebi nedir?",
    a: "Şarj olmama problemleri genellikle şarj istasyonu, adaptör veya batarya kaynaklıdır. Robot süpürge şarj istasyonu tamiri ve batarya değişimi hizmetimiz mevcuttur.",
  },
  {
    q: "Bursa’da hangi bölgelerde servis veriyorsunuz?",
    a: "Bursa genelinde servisimiz mevcuttur. Özellikle Nilüfer, Osmangazi, Mudanya, Yıldırım, Görükle ve FSM Bulvar bölgelerinde hızlı teknik servis sağlıyoruz.",
  },
  {
    q: "Robot süpürge anakart veya yazılım hatası nasıl çözülür?",
    a: "Anakart tamiri ve yazılım hatası giderme uzman teknisyenlerimiz tarafından yapılmaktadır. Ayrıca robot süpürge yazılım güncelleme hizmeti de sunuyoruz.",
  },
  {
    q: "Robot süpürge tamir fiyatları ne kadar?",
    a: "Tamir fiyatları arızaya ve değişecek parçaya göre farklılık gösterir. Orijinal yedek parçalar kullanıyoruz ve şeffaf fiyatlandırma ile müşterilerimizi bilgilendiriyoruz.",
  },
];

export default function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="px-6 py-16 max-w-5xl mx-auto">
      <h2 className="text-3xl font-bold text-center mb-10">
        Sıkça Sorulan Sorular
      </h2>

      <div className="space-y-4 w-full">
        {faqs.map((item, i) => {
          const isOpen = openIndex === i;

          return (
            <div
              key={i}
              className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm"
            >
              <button
                onClick={() => setOpenIndex(isOpen ? null : i)}
                className="w-full flex items-center justify-between px-5 py-4 text-left font-medium text-slate-800 hover:bg-slate-50 transition"
              >
                {item.q}
                <motion.span
                  animate={{ rotate: isOpen ? 180 : 0 }}
                  transition={{ duration: 0.25 }}
                >
                  <ChevronDown className="w-5 h-5 text-slate-500" />
                </motion.span>
              </button>

              {/* المحتوى داخل الكارد، العرض ثابت منذ البداية */}
              <div className="w-full px-5 pb-5">
                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      key="answer"
                      initial={{ opacity: 0, y: -6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -6 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="w-full text-sm text-slate-600 leading-relaxed"
                    >
                      {item.a}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
