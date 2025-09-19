// src/templates/receipt-pdf.tsx
import React from "react";
import {
  pdf as createPdf,
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";

/* ========= Types ========= */
export type TeslimatPdfData = {
  receiptNo: string; // RN-YYYY-2xxxxx
  dateStr: string; // TR date string
  name: string;
  phone: string;
  address: string;
  deviceType: string; // Model
  issue: string;
  companyName?: string;

  // اختياري
  logoUrl?: string; // absolute URL (public/logo_square.jpg)
  deviceSN?: string; // Seri No (optional)
  deviceAccessories?: string; // Teslim Alınan Aksesuarlar (optional)
};

/* ========= Helpers ========= */
function siteBaseUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "http://localhost:3000")
  );
}

function prefersArabic(texts: string[]) {
  const sample = (texts || []).filter(Boolean).join(" ");
  return /[\u0600-\u06FF]/.test(sample);
}

/** التركي → ASCII في حال Helvetica */
function trToAscii(input?: string) {
  if (!input) return "";
  const map: Record<string, string> = {
    ç: "c",
    Ç: "C",
    ğ: "g",
    Ğ: "G",
    ı: "i",
    İ: "I",
    İ: "I", // حالات النقطة
    ö: "o",
    Ö: "O",
    ş: "s",
    Ş: "S",
    ü: "u",
    Ü: "U",
  };
  return input.replace(/ç|Ç|ğ|Ğ|ı|İ|İ|ö|Ö|ş|Ş|ü|Ü/g, (m) => map[m] || m);
}

/** إن كنا على Helvetica حوّل التركي إلى ASCII، وإلا اترك النص */
function safeText(txt: string, family: string) {
  if (family === "Helvetica") {
    return trToAscii(txt);
  }
  return txt;
}

let __fontsRegistered = false;
let __selectedFamily = "Helvetica"; // fallback النهائي

function registerWebFontsOnce(wantArabic: boolean): { family: string } {
  if (__fontsRegistered) return { family: __selectedFamily };
  __fontsRegistered = true;

  const base = siteBaseUrl(); // مثال: https://yourdomain.com
  const urls = {
    inter: {
      regular: `${base}/fonts/static/Inter_24pt-Regular.ttf`,
      medium: `${base}/fonts/static/Inter_24pt-Medium.ttf`,
      semibold: `${base}/fonts/static/Inter_24pt-SemiBold.ttf`,
      bold: `${base}/fonts/static/Inter_24pt-Bold.ttf`,
    },
    cairo: {
      regular: `${base}/fonts/static/Cairo-Regular.ttf`,
      semibold: `${base}/fonts/static/Cairo-SemiBold.ttf`,
      bold: `${base}/fonts/static/Cairo-Bold.ttf`,
    },
  };

  if (wantArabic) {
    try {
      Font.register({
        family: "Cairo",
        fonts: [
          { src: urls.cairo.regular, fontWeight: 400 },
          { src: urls.cairo.semibold, fontWeight: 600 },
          { src: urls.cairo.bold, fontWeight: 700 },
        ],
      });
      __selectedFamily = "Cairo";
      return { family: "Cairo" };
    } catch {
      // نكمل لمحاولة Inter أو Helvetica
    }
  }

  try {
    Font.register({
      family: "Inter",
      fonts: [
        { src: urls.inter.regular, fontWeight: 400 },
        { src: urls.inter.medium, fontWeight: 500 },
        { src: urls.inter.semibold, fontWeight: 600 },
        { src: urls.inter.bold, fontWeight: 700 },
      ],
    });
    __selectedFamily = "Inter";
    return { family: "Inter" };
  } catch {
    // نعود لـ Helvetica
  }

  __selectedFamily = "Helvetica";
  return { family: "Helvetica" };
}

/* ========= Styles (built per selected family) ========= */
function buildStyles(fontFamily: string) {
  return StyleSheet.create({
    page: {
      paddingTop: 34,
      paddingBottom: 34,
      paddingHorizontal: 24,
      fontSize: 10,
      color: "#102a43",
      fontFamily,
    },
    row: { flexDirection: "row" },
    spaceBetween: { justifyContent: "space-between" },
    header: { marginBottom: 14 },
    brandWrap: { flexDirection: "row", alignItems: "center", gap: 8 },

    // شعار + glow ناعم
    logoWrap: {
      width: 44,
      height: 44,
      borderRadius: 10,
      position: "relative",
    },
    logoGlow: {
      position: "absolute",
      left: -4,
      top: -4,
      right: -4,
      bottom: -4,
      borderRadius: 12,
      backgroundColor: "#26c6da",
      opacity: 0.18,
    },
    logo: { width: 44, height: 44, borderRadius: 10 },

    h1: { fontSize: 15, fontWeight: 700, color: "#0f5ea8" },
    smallMuted: { color: "#5b7083", fontSize: 8.5, marginTop: 2 },

    chip: {
      alignSelf: "flex-end",
      fontSize: 8.5,
      paddingHorizontal: 8,
      paddingVertical: 3,
      backgroundColor: "#eef6ff",
      color: "#0f5ea8",
      borderRadius: 999,
      marginBottom: 6,
      fontWeight: 600,
    },
    meta: { textAlign: "right", color: "#5b7083", fontSize: 9 },
    metaStrong: { color: "#0f5ea8", fontWeight: 700 },

    section: { marginTop: 9 },
    h2: { fontSize: 11, fontWeight: 700, color: "#0f5ea8", marginBottom: 6 },

    card: {
      borderWidth: 1,
      borderColor: "#e6eef5",
      borderRadius: 8,
      padding: 10,
      marginBottom: 8,
    },

    // key-value rows
    kvRow: {
      flexDirection: "row",
      borderBottomWidth: 1,
      borderBottomColor: "#e6eef5",
      paddingVertical: 5,
    },
    kvLast: { borderBottomWidth: 0 },
    kvLabel: { width: 132, color: "#5b7083", fontSize: 9 },
    kvValue: { flex: 1, fontWeight: 600, fontSize: 10 },

    col: { flex: 1 },
    gap16: { gap: 14 },

    notice: {
      borderWidth: 1,
      borderColor: "#e6eef5",
      borderRadius: 8,
      padding: 10,
      color: "#5b7083",
      fontSize: 9.5,
    },

    signatureRow: { flexDirection: "row", gap: 10, marginTop: 9 },
    sigBox: {
      flex: 1,
      borderWidth: 1,
      borderStyle: "dashed",
      borderColor: "#e6eef5",
      borderRadius: 8,
      minHeight: 52,
      alignItems: "center",
      justifyContent: "center",
      color: "#5b7083",
      fontSize: 9.5,
    },

    footer: {
      marginTop: 8,
      color: "#5b7083",
      fontSize: 8.5,
      textAlign: "left",
    },
  });
}

/* ========= PDF Document ========= */
function ReceiptDoc(d: TeslimatPdfData & { family: string }) {
  const styles = buildStyles(d.family);

  const company = d.companyName || "Robonarim";
  const serial = d.deviceSN && d.deviceSN.trim() ? d.deviceSN : "—";
  const accessories =
    d.deviceAccessories && d.deviceAccessories.trim()
      ? d.deviceAccessories
      : "—";

  // نصوص تركية ثابتة — نحولها لـ ASCII فقط إذا Helvetica
  const phrase_subtitle = safeText(
    "Kesin Teşhis • Hızlı Onarım • Bursa içi Kurye",
    d.family
  );
  const label_customerInfo = safeText("Müşteri Bilgileri", d.family);
  const label_fullname = safeText("Ad Soyad", d.family);
  const label_phone = safeText("Telefon", d.family);
  const label_address = safeText("Adres", d.family);
  const label_deviceInfo = safeText("Cihaz Bilgileri", d.family);
  const label_model = safeText("Model", d.family);
  const label_sn = safeText("Seri No", d.family);
  const label_accessories = safeText("Teslim Alınan Aksesuarlar", d.family);
  const label_issue = safeText("Varsa Arıza Tanımı", d.family);
  const label_notes = safeText("Notlar ve Koşullar", d.family);
  const label_note1 = safeText(
    "• Bu fiş yalnızca cihazın teslim alındığını belgelendirir. Nihai fiyat, teşhis sonrası ayrı bir dosya olarak gönderilir.",
    d.family
  );
  const label_note2 = safeText(
    "• Teslim anında görünmeyen gizli hasarlardan, teşhis öncesi sorumluluk kabul edilmez.",
    d.family
  );
  const label_sign = safeText("İmzalar", d.family);
  const label_custSign = safeText("Müşteri İmzası", d.family);
  const label_staffSign = safeText("Görevli İmzası", d.family);
  const label_chip = safeText("Teslim Fişi", d.family);
  const label_orderNo = safeText("Sipariş No:", d.family);
  const label_date = safeText("Teslim Alma Tarihi:", d.family);

  // قيَم ديناميكية — حوّلها لو Helvetica
  const dyn_name = safeText(d.name, d.family);
  const dyn_phone = safeText(d.phone, d.family);
  const dyn_address = safeText(d.address, d.family);
  const dyn_deviceType = safeText(d.deviceType, d.family);
  const dyn_issue = safeText(d.issue || "—", d.family);
  const dyn_company = safeText(company, d.family);
  const dyn_receipt = safeText(d.receiptNo, d.family);
  const dyn_date = safeText(d.dateStr, d.family);
  const dyn_serial = safeText(serial, d.family);
  const dyn_accessories = safeText(accessories, d.family);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={[styles.row, styles.spaceBetween, styles.header]}>
          <View>
            <View style={styles.brandWrap}>
              {d.logoUrl ? (
                <View style={styles.logoWrap}>
                  <View style={styles.logoGlow} />
                  <Image src={d.logoUrl} style={styles.logo} />
                </View>
              ) : null}
              <View>
                <Text style={styles.h1}>{dyn_company}</Text>
                <Text style={styles.smallMuted}>{phrase_subtitle}</Text>
              </View>
            </View>
          </View>

          <View>
            <Text style={styles.chip}>{label_chip}</Text>
            <View style={styles.meta}>
              <Text>
                {label_orderNo}{" "}
                <Text style={styles.metaStrong}>{dyn_receipt}</Text>
              </Text>
              <Text>
                {label_date} <Text style={styles.metaStrong}>{dyn_date}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Two columns */}
        <View style={[styles.row, styles.gap16]}>
          <View style={styles.col}>
            <View style={styles.card}>
              <Text style={styles.h2}>{label_customerInfo}</Text>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>{label_fullname}</Text>
                <Text style={styles.kvValue}>{dyn_name}</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>{label_phone}</Text>
                <Text style={styles.kvValue}>{dyn_phone}</Text>
              </View>
              <View style={[styles.kvRow, styles.kvLast]}>
                <Text style={styles.kvLabel}>{label_address}</Text>
                <Text style={styles.kvValue}>{dyn_address}</Text>
              </View>
            </View>
          </View>

          <View style={styles.col}>
            <View style={styles.card}>
              <Text style={styles.h2}>{label_deviceInfo}</Text>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>{label_model}</Text>
                <Text style={styles.kvValue}>{dyn_deviceType}</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>{label_sn}</Text>
                <Text style={styles.kvValue}>{dyn_serial}</Text>
              </View>
              <View style={[styles.kvRow, styles.kvLast]}>
                <Text style={styles.kvLabel}>{label_accessories}</Text>
                <Text style={styles.kvValue}>{dyn_accessories}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Issue */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.h2}>{label_issue}</Text>
            <Text style={styles.notice}>{dyn_issue}</Text>
          </View>
        </View>

        {/* Notes + Signatures */}
        <View style={[styles.row, styles.gap16, styles.section]}>
          <View style={styles.col}>
            <View style={styles.card}>
              <Text style={styles.h2}>{label_notes}</Text>
              <Text
                style={{ color: "#5b7083", fontSize: 9.5, marginBottom: 4 }}
              >
                {label_note1}
              </Text>
              <Text style={{ color: "#5b7083", fontSize: 9.5 }}>
                {label_note2}
              </Text>
            </View>
          </View>

          <View style={styles.col}>
            <View style={styles.card}>
              <Text style={styles.h2}>{label_sign}</Text>
              <View style={styles.signatureRow}>
                <View style={styles.sigBox}>
                  <Text>{label_custSign}</Text>
                </View>
                <View style={styles.sigBox}>
                  <Text>{label_staffSign}</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          {safeText(
            "Bu belge otomatik oluşturuldu — PDF olarak paylaşılabilir.",
            d.family
          )}{" "}
          © {new Date().getFullYear()} {dyn_company}
        </Text>
      </Page>
    </Document>
  );
}

/* ========= Helpers ========= */
function streamToBuffer(stream: NodeJS.ReadableStream): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    stream.on("data", (c) =>
      chunks.push(Buffer.isBuffer(c) ? c : Buffer.from(c))
    );
    stream.on("end", () => resolve(Buffer.concat(chunks)));
    stream.on("error", reject);
  });
}

/** Render React-PDF to Buffer */
export async function renderReceiptPdfBuffer(
  data: TeslimatPdfData
): Promise<Buffer> {
  // اختر العائلة: Cairo إذا في عربي، وإلا Inter. وإن فشل التحميل → Helvetica.
  const { family } = registerWebFontsOnce(
    prefersArabic([data.name, data.address, data.issue, data.companyName || ""])
  );

  const instance = createPdf(<ReceiptDoc {...data} family={family} />);

  if (typeof (instance as any).toBuffer === "function") {
    const out = await (instance as any).toBuffer();
    if (Buffer.isBuffer(out)) return out;
    if (out instanceof Uint8Array) return Buffer.from(out);
    if (ArrayBuffer.isView(out))
      return Buffer.from((out as unknown as ArrayBufferView).buffer);
  }

  if (typeof (instance as any).toStream === "function") {
    const s = (await (instance as any).toStream()) as NodeJS.ReadableStream;
    return streamToBuffer(s);
  }

  if (typeof (instance as any).toBlob === "function") {
    const blob: Blob = await (instance as any).toBlob();
    const arr = await blob.arrayBuffer();
    return Buffer.from(new Uint8Array(arr));
  }

  if (typeof (instance as any).toString === "function") {
    const str: string = await (instance as any).toString();
    return Buffer.from(str);
  }

  throw new Error("Could not render PDF buffer from @react-pdf/renderer");
}
