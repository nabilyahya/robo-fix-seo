// src/templates/teslimat-pdf.tsx
import path from "node:path";
import fs from "node:fs";
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
  Svg,
  Defs,
  RadialGradient,
  Stop,
  Rect,
} from "@react-pdf/renderer";

/* ========= Fonts: load TTF from public/fonts/static ========= */
const fontRoot = path.join(process.cwd(), "public", "fonts", "static");
function pickFontFile(base: string) {
  const candidates = [
    `Inter_24pt-${base}.ttf`,
    `Inter_18pt-${base}.ttf`,
    `Inter_28pt-${base}.ttf`,
    `Inter-${base}.ttf`,
  ].map((f) => path.join(fontRoot, f));
  return candidates.find((p) => fs.existsSync(p));
}
const REGULAR = pickFontFile("Regular");
const SEMIBOLD = pickFontFile("SemiBold") || pickFontFile("Medium") || REGULAR;
const BOLD = pickFontFile("Bold") || SEMIBOLD;
if (!REGULAR) {
  throw new Error(
    "Inter TTF not found. Place TTF files under public/fonts/static (e.g., Inter_24pt-Regular.ttf)"
  );
}
Font.register({
  family: "Inter24",
  fonts: [
    { src: REGULAR!, fontWeight: 400 },
    { src: SEMIBOLD!, fontWeight: 600 },
    { src: BOLD!, fontWeight: 700 },
  ],
});
Font.registerHyphenationCallback((word) => [word]);

/* ========= Design Tokens ========= */
const TOKENS = {
  brand: "#1e88e5",
  brandDark: "#0f5ea8",
  accent: "#26c6da",
  ink: "#102a43",
  muted: "#5b7083",
  paper: "#ffffff",
  line: "#e6eef5",
};
const PX = (n: number) => n;

/* ========= Types ========= */
export type TeslimatPdfData = {
  receiptNo: string;
  dateStr: string;
  name: string;
  phone: string;
  address: string;
  deviceType: string;
  issue: string;
  companyName?: string;
  logoUrl?: string;
  deviceSN?: string;
  deviceAccessories?: string;
};

/* ===== Brand logo with visible radial glow ===== */
function BrandLogo({ src }: { src?: string }) {
  return (
    <View style={styles.logoWrap}>
      {/* glow fills the wrapper so it won't be clipped */}
      <Svg style={styles.logoGlowSvg}>
        <Defs>
          <RadialGradient id="roboglow" cx="50%" cy="50%" r="95%">
            <Stop offset="0%" stopColor="#1e88e5" stopOpacity={0.36} />
            <Stop offset="55%" stopColor="#1e88e5" stopOpacity={0.18} />
            <Stop offset="100%" stopColor="#1e88e5" stopOpacity={0} />
          </RadialGradient>
        </Defs>
        <Rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          rx={16}
          fill="url(#roboglow)"
        />
      </Svg>

      {/* white plate inside the glow */}
      <View style={styles.logoPlate} />

      {/* actual logo */}
      {src ? <Image src={src} style={styles.logoImg} /> : null}
    </View>
  );
}

/* ========= Styles (narrow margins + smaller type + refined glow) ========= */
const styles = StyleSheet.create({
  page: {
    fontFamily: "Inter24",
    lineHeight: 1.36,
    paddingTop: PX(38),
    paddingBottom: PX(40),
    paddingHorizontal: PX(28),
    fontSize: PX(10.2),
    color: TOKENS.ink,
    backgroundColor: TOKENS.paper,
  },

  row: { flexDirection: "row" },
  spaceBetween: { justifyContent: "space-between", alignItems: "center" },

  header: { marginBottom: PX(14) },

  brandWrap: { flexDirection: "row", alignItems: "center", gap: PX(10) },

  // Logo block
  logoWrap: { width: 54, height: 54, position: "relative" },
  logoGlowSvg: { position: "absolute", left: 0, top: 0, width: 54, height: 54 },
  logoPlate: {
    position: "absolute",
    left: 2,
    top: 2,
    width: 50,
    height: 50,
    borderRadius: 12,
    backgroundColor: "#ffffff",
    borderWidth: 1,
    borderColor: "#e9f1fb",
  },
  logoImg: {
    position: "absolute",
    left: 8,
    top: 8,
    width: 38,
    height: 38,
    borderRadius: 9,
  },

  h1: {
    fontFamily: "Inter24",
    fontSize: PX(16.2),
    fontWeight: 700,
    color: TOKENS.brandDark,
    letterSpacing: 0.15,
  },
  smallMuted: { color: TOKENS.muted, fontSize: PX(9.4), marginTop: PX(1) },

  docMeta: { textAlign: "right", color: TOKENS.muted, fontSize: PX(9.8) },
  chip: {
    alignSelf: "flex-end",
    fontSize: PX(9.4),
    paddingHorizontal: PX(8),
    paddingVertical: PX(3),
    borderRadius: PX(999),
    backgroundColor: "#eef6ff",
    borderWidth: 1,
    borderColor: TOKENS.line,
    color: TOKENS.brandDark,
    fontWeight: 700,
    marginBottom: PX(4),
  },
  metaLine: { marginTop: PX(1.5) },
  metaStrong: { color: TOKENS.brandDark, fontWeight: 700 },

  section: { marginTop: PX(12) },
  h2: {
    fontFamily: "Inter24",
    marginTop: PX(1),
    marginBottom: PX(6),
    fontSize: PX(13.2),
    color: TOKENS.brandDark,
    fontWeight: 700,
  },

  card: {
    borderWidth: 1,
    borderColor: TOKENS.line,
    borderRadius: PX(10),
    paddingVertical: PX(10),
    paddingHorizontal: PX(12),
    marginBottom: PX(8),
    backgroundColor: TOKENS.paper,
  },

  col: { flex: 1 },
  gapRow: { flexDirection: "row", gap: PX(12) },

  kvRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: PX(4.5),
    borderBottomWidth: 1,
    borderBottomColor: TOKENS.line,
  },
  kvLast: { borderBottomWidth: 0 },
  kvLabel: { width: PX(132), color: TOKENS.muted, fontSize: PX(10.2) },
  kvValue: { flex: 1, fontSize: PX(10.2), fontWeight: 700 },

  notice: {
    paddingVertical: PX(8),
    paddingHorizontal: PX(10),
    borderRadius: PX(8),
    borderWidth: 1,
    borderColor: TOKENS.line,
    backgroundColor: "#f7fcff",
    color: TOKENS.muted,
    fontSize: PX(10),
  },

  signatureRow: { flexDirection: "row", gap: PX(12), marginTop: PX(8) },
  sigBox: {
    flex: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: TOKENS.line,
    borderRadius: PX(8),
    minHeight: PX(58),
    padding: PX(8),
    color: TOKENS.muted,
    fontSize: PX(10),
    alignItems: "center",
    justifyContent: "center",
  },

  footer: {
    marginTop: PX(10),
    color: TOKENS.muted,
    fontSize: PX(8.8),
    textAlign: "left",
  },
});

/* ========= PDF Document ========= */
function ReceiptDoc(d: TeslimatPdfData) {
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
              <BrandLogo src={d.logoUrl} />
              <View>
                <Text style={styles.h1}>{company}</Text>
                <Text style={styles.smallMuted}>
                  Kesin Teşhis • Hızlı Onarım • Bursa içi Kurye
                </Text>
              </View>
            </View>
          </View>

          <View style={styles.docMeta}>
            <Text style={styles.chip}>Teslim Fişi</Text>
            <View>
              <Text style={styles.metaLine}>
                Sipariş No: <Text style={styles.metaStrong}>{d.receiptNo}</Text>
              </Text>
              <Text style={styles.metaLine}>
                Teslim Alma Tarihi:{" "}
                <Text style={styles.metaStrong}>{d.dateStr}</Text>
              </Text>
            </View>
          </View>
        </View>

        {/* Two columns */}
        <View style={styles.gapRow}>
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
        <View style={[styles.gapRow, styles.section]}>
          <View style={styles.col}>
            <View style={styles.card}>
              <Text style={styles.h2}>Notlar ve Koşullar</Text>
              <Text
                style={{
                  color: TOKENS.muted,
                  fontSize: PX(10),
                  marginBottom: PX(5),
                }}
              >
                • Bu fiş yalnızca cihazın teslim alındığını belgelendirir. Nihai
                fiyat, teşhis sonrası ayrı bir dosya olarak gönderilir.
              </Text>
              <Text style={{ color: TOKENS.muted, fontSize: PX(10) }}>
                • Teslim anında görünmeyen gizli hasarlardan, teşhis öncesi
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

export async function renderReceiptPdfBuffer(
  data: TeslimatPdfData
): Promise<Buffer> {
  const instance = createPdf(<ReceiptDoc {...data} />);
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
