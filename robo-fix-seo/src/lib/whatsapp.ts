// src/lib/whatsapp.ts
const API_VER = "v21.0";

function must(name: string, v?: string) {
  if (!v) throw new Error(`Missing env: ${name}`);
  return v;
}

/** إرسال رسالة نصية عبر واتساب لرقم معيّن */
export async function sendWhatsAppText(toPhone: string, body: string) {
  const token = must("WHATSAPP_TOKEN", process.env.WHATSAPP_TOKEN);
  const phoneId = must(
    "WHATSAPP_PHONE_NUMBER_ID",
    process.env.WHATSAPP_PHONE_NUMBER_ID
  );

  const url = `https://graph.facebook.com/${API_VER}/${phoneId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to: toPhone,
      type: "text",
      text: { body },
    }),
  });

  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      `WhatsApp send error: ${res.status} ${res.statusText} - ${JSON.stringify(
        json
      )}`
    );
  }
  return json;
}

/** يبني رابط التتبّع بناءً على NEXT_PUBLIC_SITE_URL أو VERCEL_URL */
export function buildTrackUrl(publicId: string) {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000");
  return `${base}/track/${publicId}`;
}
