export type Post = {
  slug: string;
  title: string;
  excerpt: string;
  image: string;
  date: string; // ISO
  read: string; // "4 dk" مثلاً
  tag: string; // التصنيف
  content: string; // Markdown مسموح
};

export const POSTS: Post[] = [
  {
    slug: "roborock-bakim-rehberi",
    title: "Roborock Bakım Rehberi: Performansı Nasıl Artırırsınız?",
    excerpt:
      "Fırçaların, filtrelerin ve sensörlerin periyodik temizliğiyle ömrü uzatın.",
    image:
      "https://www.techreviewer.de/wp-content/uploads/2023/06/roborock-s7-max-ultra-header.jpg.webp",
    date: "2025-08-14",
    read: "4 dk",
    tag: "Bakım",
    content: `
### Neden Düzenli Bakım?
Roborock cihazlarında **fırça**, **filtre** ve **sensör** temizliği performansı doğrudan etkiler.

#### Hızlı İpuçları
- Ana fırçayı haftada 1 kontrol edin.
- HEPA filtreyi 2–4 haftada hafifçe temizleyin, 3–6 ayda değiştirin.
- Sensör yüzeylerini mikrofiber bezle silin.

> Not: Aşınmış parçaları **orijinal** muadilleriyle değiştirin.
`,
  },
  {
    slug: "irobot-hata-kodlari",
    title: "iRobot Roomba Hata Kodları: Hızlı Çözümler",
    excerpt: "En sık uyarılar ve evde deneyebileceğiniz pratik çözümler.",
    image:
      "https://i.pinimg.com/originals/4d/b7/dc/4db7dc428e22346fb3bf66e3c1e88f9b.jpg",
    date: "2025-08-10",
    read: "5 dk",
    tag: "Sorun Giderme",
    content: `
### Yaygın Hata Kodları
- **Hata 1:** Tekerlek sıkışmış olabilir. Yabancı cisimleri çıkarın.
- **Hata 2:** Ana fırça kilitlenmiş. Fırçayı söküp saç-kıl temizliği yapın.

Düzelmezse **servise başvurun**; motor veya sensör bakımı gerekebilir.
`,
  },
  {
    slug: "ecovacs-yer-haritasi",
    title: "Ecovacs’ta Harita Yönetimi: Çok Katlı Evlerde İpuçları",
    excerpt: "Haritaları kaydetme, düzenleme ve odalara göre planlama.",
    image:
      "https://www.connect.de/bilder/118686052/landscapex1200-c2/deebot-x8-hot-water-mop-washing.jpg",
    date: "2025-08-05",
    read: "3 dk",
    tag: "Temizlik",
    content: `
Çok katlı yapılarda **ayrı haritalar** kaydedin ve mop alanlarını doğru işaretleyin.
`,
  },
  {
    slug: "roborok-s6-robot-vs-dreame",
    title: "Roborock S6 vs. Dreame L10 Pro: Hangisi Daha Mantıklı?",
    excerpt: "Emiş gücü, batarya ve akıllı özellikler karşılaştırması.",
    image:
      "https://ohmymi.com.my/wp-content/uploads/2021/09/Roborock-S6-MaxV-vs-Dreame-L10-Pro-1024x512.png",
    date: "2025-07-30",
    read: "6 dk",
    tag: "Karşılaştırma",
    content: `
**Xiaomi** genelde fiyat/performans, **Dreame** ise yeni nesil mop ve sensörlerde öne çıkar.
`,
  },
];

export const getPostBySlug = (slug: string) =>
  POSTS.find((p) => p.slug === slug);
export const getAllPostSlugs = () => POSTS.map((p) => p.slug);
export const getAllPosts = () => POSTS;
