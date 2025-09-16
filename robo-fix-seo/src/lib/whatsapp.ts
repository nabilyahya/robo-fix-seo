const BASE_URL = (phoneId: string) =>
  `https://graph.facebook.com/v21.0/${phoneId}/messages`;

function assertEnv() {
  if (!process.env.WHATSAPP_TOKEN) {
    throw new Error("Missing WHATSAPP_TOKEN env");
  }
  if (!process.env.WHATSAPP_PHONE_NUMBER_ID) {
    throw new Error("Missing WHATSAPP_PHONE_NUMBER_ID env");
  }
}

async function post(payload: any) {
  assertEnv();
  const url = BASE_URL(process.env.WHATSAPP_PHONE_NUMBER_ID!);
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.WHATSAPP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!res.ok) {
    throw new Error(
      `WhatsApp API error: ${res.status} ${res.statusText} :: ${JSON.stringify(
        json
      )}`
    );
  }
  return json;
}

/** Send a template message (business-initiated outside 24h window) */
export async function sendTemplate(
  toPhone: string,
  template: string,
  lang = "ar",
  components?: any[]
) {
  return post({
    messaging_product: "whatsapp",
    to: toPhone,
    type: "template",
    template: { name: template, language: { code: lang }, components },
  });
}

/** Send a document by public URL */
export async function sendDocument(
  toPhone: string,
  link: string,
  filename = "Robonarim-Teslim.pdf",
  caption?: string
) {
  return post({
    messaging_product: "whatsapp",
    to: toPhone,
    type: "document",
    document: { link, filename, caption },
  });
}
