import { NextRequest, NextResponse } from "next/server";
import nodemailer from "nodemailer";

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();

    // Honeypot – bot yakalama
    if ((form.get("_company") as string)?.length) {
      return NextResponse.redirect(new URL("/iletisim?ok=1", req.url));
    }

    const name = String(form.get("name") || "");
    const phone = String(form.get("phone") || "");
    const email = String(form.get("email") || "-");
    const model = String(form.get("model") || "");
    const message = String(form.get("message") || "");
    const pref = String(form.get("pref") || "");
    const source = String(form.get("source") || "web");

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: Number(process.env.SMTP_PORT || 587),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const html = `
        <h2>Yeni Servis Talebi</h2>
        <p><b>Ad Soyad:</b> ${name}</p>
        <p><b>Telefon:</b> ${phone}</p>
        <p><b>E‑posta:</b> ${email}</p>
        <p><b>Marka/Model:</b> ${model}</p>
        <p><b>Tercih edilen iletişim:</b> ${pref}</p>
        <p><b>Mesaj:</b><br/>${message.replace(/\n/g, "<br/>")}</p>
        <hr/>
        <p><i>Kaynak:</i> ${source}</p>
      `;

    await transporter.sendMail({
      from: `Robonarim Site <robonarim@gmail.com>`,
      to: process.env.CONTACT_TO || "robonarim@gmail.com",
      subject: `Yeni İletişim Talebi — ${name} (${phone})`,
      text: `Ad: ${name}\nTelefon: ${phone}\nE‑posta: ${email}\nModel: ${model}\nTercih: ${pref}\n\nMesaj:\n${message}\n\nKaynak: ${source}`,
      html,
    });

    return NextResponse.redirect(new URL("/iletisim?ok=1#form", req.url));
  } catch (e: any) {
    return NextResponse.redirect(
      new URL(
        `/iletisim?err=${encodeURIComponent(
          e?.message || "Bir hata oluştu"
        )}#form`,
        req.url
      )
    );
  }
}
