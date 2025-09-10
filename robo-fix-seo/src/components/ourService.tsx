const OurServiss = () => {
  return (
    <section className="px-6 py-12 bg-gray-50 rounded-2xl shadow-md max-w-5xl mx-auto my-12">
      <h2 className="text-2xl font-bold mb-4 text-center">
        Bursa’nın Güvenilir Robot Süpürge Servisi
      </h2>
      <p className="text-gray-700 leading-relaxed text-center mb-6">
        Robonarim, robot süpürge tamiri, bakımı, yazılım güncellemesi ve yedek
        parça değişiminde profesyonel çözümler sunar.{" "}
        <strong>Bursa, Nilüfer, Osmangazi, Mudanya, Yıldırım ve Görükle</strong>{" "}
        bölgelerinde hızlı, şeffaf ve garantili servis hizmeti sağlıyoruz.
      </p>
      <ul className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm text-gray-600">
        <li>✓ Robot süpürge batarya değişimi</li>
        <li>✓ Sensör temizleme & arıza onarımı</li>
        <li>✓ Yazılım güncelleme & hata kodu çözümü</li>
        <li>✓ Fırça, tekerlek ve motor tamiri</li>
        <li>✓ Orijinal yedek parça değişimi</li>
        <li>✓ Ücretsiz kontrol & fiyatlandırma</li>
      </ul>
    </section>
  );
};
export default OurServiss;
