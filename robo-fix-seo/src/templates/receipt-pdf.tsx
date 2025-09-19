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

/* ========= Local font helpers (robust) ========= */
// حلّ يولّد مسارًا مطلقًا لملف TTF موجود بجانب هذا الملف (يعمل على Vercel/Serverless)
function localFont(rel: string): string | null {
  try {
    return decodeURI(new URL(`./fonts/${rel}`, import.meta.url).pathname);
  } catch {
    return null;
  }
}

let __fontsRegistered = false;
let __selectedFamily = "Helvetica"; // fallback النهائي

function prefersArabic(texts: string[]) {
  const sample = (texts || []).filter(Boolean).join(" ");
  // نطاقات عربية أساسية
  return /[\u0600-\u06FF]/.test(sample);
}

function registerFontsOnce(wantArabic: boolean): { family: string } {
  if (__fontsRegistered) return { family: __selectedFamily };
  __fontsRegistered = true;

  // لو في نص عربي، نعطي الأولوية لـ Cairo
  const prioritizeCairo = wantArabic;

  // Inter candidates
  const interRegular =
    localFont("Inter-Regular.ttf") ||
    localFont("Inter_24pt-Regular.ttf") ||
    localFont("Inter_18pt-Regular.ttf");
  const interMedium =
    localFont("Inter-Medium.ttf") ||
    localFont("Inter_24pt-Medium.ttf") ||
    interRegular;
  const interSemi =
    localFont("Inter-SemiBold.ttf") ||
    localFont("Inter_24pt-SemiBold.ttf") ||
    interMedium;
  const interBold =
    localFont("Inter-Bold.ttf") ||
    localFont("Inter_24pt-Bold.ttf") ||
    interSemi;

  // Cairo candidates (Arabic shaping)
  const cairoRegular = localFont("Cairo-Regular.ttf");
  const cairoSemi = localFont("Cairo-SemiBold.ttf") || cairoRegular;
  const cairoBold = localFont("Cairo-Bold.ttf") || cairoSemi;

  if (prioritizeCairo && cairoRegular) {
    Font.register({
      family: "Cairo",
      fonts: [
        { src: cairoRegular, fontWeight: 400 },
        { src: cairoSemi!, fontWeight: 600 },
        { src: cairoBold!, fontWeight: 700 },
      ],
    });
    __selectedFamily = "Cairo";
    return { family: "Cairo" };
  }

  if (interRegular) {
    Font.register({
      family: "Inter",
      fonts: [
        { src: interRegular, fontWeight: 400 },
        { src: interMedium!, fontWeight: 500 },
        { src: interSemi!, fontWeight: 600 },
        { src: interBold!, fontWeight: 700 },
      ],
    });
    __selectedFamily = "Inter";
    return { family: "Inter" };
  }

  // لم نجد ملفات خطوط — نستخدم Helvetica المدمجة
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
      fontSize: 10, // مصغّر كما اتفقنا
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
                <Text style={styles.h1}>{company}</Text>
                <Text style={styles.smallMuted}>
                  Kesin Teşhis • Hızlı Onarım • Bursa içi Kurye
                </Text>
              </View>
            </View>
          </View>

          <View>
            <Text style={styles.chip}>Teslim Fişi</Text>
            <View style={styles.meta}>
              <Text>
                Sipariş No: <Text style={styles.metaStrong}>{d.receiptNo}</Text>
              </Text>
              <Text>
                Teslim Alma Tarihi:{" "}
                <Text style={styles.metaStrong}>{d.dateStr}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Two columns */}
        <View style={[styles.row, styles.gap16]}>
          <View style={styles.col}>
            <View style={styles.card}>
              <Text style={styles.h2}>Müşteri Bilgileri</Text>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Ad Soyad</Text>
                <Text style={styles.kvValue}>{d.name}</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Telefon</Text>
                <Text style={styles.kvValue}>{d.phone}</Text>
              </View>
              <View style={[styles.kvRow, styles.kvLast]}>
                <Text style={styles.kvLabel}>Adres</Text>
                <Text style={styles.kvValue}>{d.address}</Text>
              </View>
            </View>
          </View>

          <View style={styles.col}>
            <View style={styles.card}>
              <Text style={styles.h2}>Cihaz Bilgileri</Text>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Model</Text>
                <Text style={styles.kvValue}>{d.deviceType}</Text>
              </View>
              <View style={styles.kvRow}>
                <Text style={styles.kvLabel}>Seri No</Text>
                <Text style={styles.kvValue}>{serial}</Text>
              </View>
              <View style={[styles.kvRow, styles.kvLast]}>
                <Text style={styles.kvLabel}>Teslim Alınan Aksesuarlar</Text>
                <Text style={styles.kvValue}>{accessories}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Issue */}
        <View style={styles.section}>
          <View style={styles.card}>
            <Text style={styles.h2}>Varsa Arıza Tanımı</Text>
            <Text style={styles.notice}>{d.issue || "—"}</Text>
          </View>
        </View>

        {/* Notes + Signatures */}
        <View style={[styles.row, styles.gap16, styles.section]}>
          <View style={styles.col}>
            <View style={styles.card}>
              <Text style={styles.h2}>Notlar ve Koşullar</Text>
              <Text
                style={{ color: "#5b7083", fontSize: 9.5, marginBottom: 4 }}
              >
                • Bu fiş yalnızca cihazın teslim alındığını belgelendirir. Nihai
                fiyat, teşhis sonrası ayrı bir dosya olarak gönderilir.
              </Text>
              <Text style={{ color: "#5b7083", fontSize: 9.5 }}>
                • Teslim anında görünmeyen gizli hasarlardan، teşhis öncesi
                sorumluluk kabul edilmez.
              </Text>
            </View>
          </View>

          <View style={styles.col}>
            <View style={styles.card}>
              <Text style={styles.h2}>İmzalar</Text>
              <View style={styles.signatureRow}>
                <View style={styles.sigBox}>
                  <Text>Müşteri İmzası</Text>
                </View>
                <View style={styles.sigBox}>
                  <Text>Görevli İmzası</Text>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* Footer */}
        <Text style={styles.footer}>
          Bu belge otomatik oluşturuldu — PDF olarak paylaşılabilir. ©{" "}
          {new Date().getFullYear()} {company}
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
  // اختر العائلة حسب وجود نص عربي (Cairo) أو استخدم Inter
  const { family } = registerFontsOnce(
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
