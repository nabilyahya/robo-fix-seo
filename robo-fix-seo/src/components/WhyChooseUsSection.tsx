import { Clock, DollarSign, Users, Shield } from "lucide-react";

const WhyChooseUsSection = () => {
  const features = [
    {
      icon: <Clock className="h-6 w-6" />,
      title: "Hızlı Teslim",
      description: "Kısa süreli onarım. Rutininiz aksamaz.",
    },
    {
      icon: <DollarSign className="h-6 w-6" />,
      title: "Uygun Fiyat",
      description: "Şeffaf teklif. Gizli ücret yok.",
    },
    {
      icon: <Users className="h-6 w-6" />,
      title: "Uzman Ekip",
      description: "Deneyimli teknisyenler. Doğru çözüm.",
    },
    {
      icon: <Shield className="h-6 w-6" />,
      title: "Garantili Onarım",
      description: "İşçilik ve parçada güvence.",
    },
  ];

  return (
    <section
      id="about"
      className="py-6 sm:py-8 lg:py-12"
      aria-labelledby="why-choose-title"
    >
      <div className="px-4">
        <h2
          id="why-choose-title"
          className="text-foreground text-xl sm:text-2xl lg:text-[26px] font-extrabold tracking-[-0.02em]"
        >
          Neden Bizi Seçmelisiniz?
        </h2>

        <div className="mt-3 sm:mt-4 max-w-[760px]">
          <h3 className="text-foreground text-lg sm:text-2xl md:text-3xl font-black leading-tight">
            Kalite Taahhüdümüz
          </h3>
          <p className="mt-2 text-muted-foreground text-sm sm:text-base">
            Müşteri memnuniyetine odaklı, birinci sınıf servis. En yeni ekipman
            ve yöntemlerle robot süpürgeniz ilk günkü performansına döner.
          </p>
        </div>

        <div className="mt-6 sm:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {features.map((f, i) => (
            <article
              key={i}
              className="group relative rounded-xl border bg-card p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
              style={{
                borderImage:
                  "linear-gradient(180deg, rgba(255,255,255,0.15), rgba(255,255,255,0.05)) 1",
              }}
            >
              {/* accent glow */}
              <span
                aria-hidden
                className="pointer-events-none absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                style={{
                  boxShadow:
                    "0 0 0 1px rgba(255,255,255,0.06), 0 10px 30px rgba(0,0,0,0.25)",
                }}
              />

              {/* icon badge */}
              <div className="mb-3 inline-flex items-center justify-center rounded-full border border-white/15 bg-white/5 p-2 text-foreground backdrop-blur">
                {f.icon}
              </div>

              <h4 className="text-card-foreground text-base font-bold leading-tight">
                {f.title}
              </h4>
              <p className="mt-1 text-muted-foreground text-sm">
                {f.description}
              </p>

              {/* bottom microcopy */}
              <div className="mt-3 pt-3 border-t border-white/10 text-[11px] text-primary/80 font-semibold">
                Hızlı • Kaliteli • Uygun Fiyat
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseUsSection;
