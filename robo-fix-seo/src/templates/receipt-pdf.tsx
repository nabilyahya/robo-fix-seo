// src/templates/teslimat-pdf.tsx
import React from "react";
import {
  pdf as createPdf,
  Document,
  Page,
  Text,
  View,
  Image,
  StyleSheet,
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

/* ========= Styles ========= */
const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    paddingBottom: 36,
    paddingHorizontal: 28,
    fontSize: 11,
    color: "#102a43",
  },
  row: { flexDirection: "row" },
  spaceBetween: { justifyContent: "space-between" },
  header: { marginBottom: 16 },
  brandWrap: { flexDirection: "row", alignItems: "center", gap: 10 },
  logo: { width: 40, height: 40, borderRadius: 8 },
  h1: { fontSize: 16, fontWeight: 700 },
  smallMuted: { color: "#5b7083", fontSize: 9, marginTop: 2 },

  chip: {
    alignSelf: "flex-end",
    fontSize: 9,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: "#eef6ff",
    color: "#0f5ea8",
    borderRadius: 999,
    marginBottom: 6,
  },
  meta: { textAlign: "right", color: "#5b7083", fontSize: 10 },
  metaStrong: { color: "#0f5ea8", fontWeight: 700 },

  section: { marginTop: 10 },
  h2: { fontSize: 12, fontWeight: 700, color: "#0f5ea8", marginBottom: 6 },

  card: {
    borderWidth: 1,
    borderColor: "#e6eef5",
    borderRadius: 8,
    padding: 10,
    marginBottom: 8,
  },

  // key-value grid (label - value)
  kvRow: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#e6eef5",
    paddingVertical: 6,
  },
  kvLast: { borderBottomWidth: 0 },
  kvLabel: { width: 140, color: "#5b7083" },
  kvValue: { flex: 1, fontWeight: 700 },

  // two-column grid
  col: { flex: 1 },
  gap16: { gap: 16 },

  notice: {
    borderWidth: 1,
    borderColor: "#e6eef5",
    borderRadius: 8,
    padding: 10,
    color: "#5b7083",
    fontSize: 10,
  },

  signatureRow: { flexDirection: "row", gap: 10, marginTop: 10 },
  sigBox: {
    flex: 1,
    borderWidth: 1,
    borderStyle: "dashed",
    borderColor: "#e6eef5",
    borderRadius: 8,
    minHeight: 56,
    alignItems: "center",
    justifyContent: "center",
    color: "#5b7083",
    fontSize: 10,
  },

  footer: { marginTop: 10, color: "#5b7083", fontSize: 9, textAlign: "left" },
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
              {d.logoUrl ? <Image src={d.logoUrl} style={styles.logo} /> : null}
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
              <Text style={{ color: "#5b7083", fontSize: 10, marginBottom: 4 }}>
                • Bu fiş yalnızca cihazın teslim alındığını belgelendirir. Nihai
                fiyat, teşhis sonrası ayrı bir dosya olarak gönderilir.
              </Text>
              <Text style={{ color: "#5b7083", fontSize: 10 }}>
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

/* ========= Helpers: إلى Buffer مضمون ========= */
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

/** Render React-PDF to Buffer (يتعامل مع كل الأشكال: Buffer/Uint8Array/Stream/Blob) */
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
