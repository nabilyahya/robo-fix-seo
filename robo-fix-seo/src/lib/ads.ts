// src/lib/ads.ts
export function reportAdsConversion(
  sendTo: string,
  extra?: Record<string, any>
) {
  if (typeof window === "undefined" || !(window as any).gtag) return;

  const payload: Record<string, any> = {
    send_to: sendTo,
    // قيَمي اختيارية (عدّلها إن أردت قياس قيمة اتصال مثلاً)
    // value: 1.0,
    // currency: "TRY",
    ...extra,
  };

  (window as any).gtag("event", "conversion", payload);
}

/**
 * إذا أردت ضمان تنفيذ الحدث قبل الانتقال لرابط خارجي (مثل واتساب)،
 * استخدم event_callback ثم نفّذ التوجيه بعده.
 */
export function reportAdsConversionThenNavigate(sendTo: string, url: string) {
  if (typeof window === "undefined" || !(window as any).gtag) {
    window.location.href = url;
    return;
  }

  (window as any).gtag("event", "conversion", {
    send_to: sendTo,
    event_callback: () => {
      window.location.href = url;
    },
  });

  // احتياط في حال لم يُستدعَ الـ callback
  setTimeout(() => {
    try {
      window.location.href = url;
    } catch {}
  }, 700);
}
