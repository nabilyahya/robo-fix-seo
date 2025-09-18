// src/templates/teslimat.ts
export type TeslimatData = {
  receiptNo: string; // RN-YYYY-2xxxxx
  dateStr: string; // 2025-09-14 (أو TR locale)
  name: string;
  phone: string;
  address: string;
  deviceType: string; // Model
  issue: string; // Varsa Arıza Tanımı
  repairCost?: string;
  trackUrl: string; // Takip Linki
  passCode: string; // Takip Kodu
  companyName?: string;

  // أصول/شعار
  logoUrl?: string; // مثال: https://site.com/logo_square.jpg (من public)
  logoDataUrl?: string; // بديل Base64 إن رغبت
  assetsBaseUrl?: string; // لو استخدمت مسارات نسبية أخرى داخل القالب

  // حقول اختيارية إضافية إن وُجدت لاحقًا
  deviceSN?: string; // Seri No
  deviceAccessories?: string; // Teslim Alınan Aksesuarlar
};

export function buildTeslimatHTML(d: TeslimatData) {
  const company = d.companyName || "Robonarim";
  const baseTag = d.assetsBaseUrl ? `<base href="${d.assetsBaseUrl}/">` : "";

  const logoBlock = d.logoUrl
    ? `<img src="${d.logoUrl}" alt="Logo" />`
    : d.logoDataUrl
    ? `<img src="${d.logoDataUrl}" alt="Logo" />`
    : "";

  const accessories =
    d.deviceAccessories && d.deviceAccessories.trim() !== ""
      ? d.deviceAccessories
      : "—";
  const serial = d.deviceSN && d.deviceSN.trim() !== "" ? d.deviceSN : "—";

  return `<!doctype html>
<html lang="tr" dir="ltr">
<head>
  <meta charset="utf-8" />
  <title>Teslim Fişi ${d.receiptNo}</title>
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  ${baseTag}
  <style>
:root {
  --brand: #1e88e5;
  --brand-dark: #0f5ea8;
  --accent: #26c6da;
  --ink: #102a43;
  --muted: #5b7083;
  --paper: #ffffff;
  --line: #e6eef5;
  --ok: #2e7d32;
  --warn: #ef6c00;
  --danger: #c62828;
  --print-single-height: 280mm;
  --print-single-pad-v: 16mm;
  --print-single-pad-h: 14mm;
}

body {
  margin: 0;
  background:
    radial-gradient(1200px 600px at 85% -10%, rgba(38, 198, 218, 0.25), transparent 60%),
    radial-gradient(900px 500px at 10% 110%, rgba(30, 136, 229, 0.18), transparent 60%),
    linear-gradient(180deg, #f8fbff 0%, #f2f7fc 100%);
  color: var(--ink);
  font: 14px/1.6 "Segoe UI", system-ui, -apple-system, Arial, "Cairo", sans-serif;
  -webkit-print-color-adjust: exact;
  print-color-adjust: exact;
}

.page {
  box-sizing: border-box;
  width: 210mm;
  min-height: 297mm;
  margin: 16px auto;
  padding: 22mm 18mm;
  background: var(--paper);
  border-radius: 16px;
  box-shadow: 0 8px 28px rgba(16, 42, 67, 0.08);
  position: relative;
  overflow: hidden;
}

.header { display:flex; align-items:center; justify-content:space-between; gap:16px; margin-bottom:18px }
.brand { display:flex; align-items:center; gap:12px }
.brand img { width:54px; height:54px; border-radius:12px; box-shadow: 0 6px 14px rgba(30,136,229,.28); object-fit:cover }
.brand h1 { margin:0; font-size:20px; letter-spacing:.3px; color:var(--brand-dark) }
.brand small { display:block; color:var(--muted) }

.doc-meta { text-align:right; color:var(--muted); font-size:12px }
.chip { display:inline-block; padding:4px 10px; border-radius:999px; background:linear-gradient(135deg,#eef6ff,#e6f7fa); border:1px solid var(--line); color:var(--brand-dark); font-weight:600 }

.section { margin-top:16px }
.section h2 { margin:.3em 0 .6em; font-size:16px; color:var(--brand-dark) }

.grid { display:grid; gap:10px; grid-template-columns: repeat(12, 1fr) }
.card { background:#fff; border:1px solid var(--line); border-radius:14px; padding:14px 16px; break-inside: avoid }
.span-6 { grid-column: span 6 }
.span-4 { grid-column: span 4 }
.span-8 { grid-column: span 8 }
.span-12 { grid-column: span 12 }

.kv { display:grid; grid-template-columns:160px 1fr; gap:8px 14px }
.kv label { color:var(--muted) }
.kv .value { font-weight:600; word-break:break-word }

table { width:100%; border-collapse: collapse; font-size:13px }
thead th { background:linear-gradient(180deg,#f7fbff,#edf4fb); color:var(--brand-dark); text-align:left; padding:10px; border:1px solid var(--line) }
tbody td { padding:10px; border:1px solid var(--line) }
tfoot td { padding:10px; border:1px solid var(--line); font-weight:700 }

.totals { width:min(380px,100%); margin-left:auto }
.totals tr td:first-child { color:var(--muted); font-weight:500 }
.totals .grand { font-size:16px; color:var(--brand-dark) }

.align-right { text-align:right }
.muted { color:var(--muted) }
.list-muted { margin:0 0 0 18px; padding:0 18px; color:var(--muted) }

.signature { display:flex; justify-content:space-between; gap:16px; margin-top:18px }
.sig-box { flex:1; border:1px dashed var(--line); border-radius:12px; min-height:80px; padding:12px; color:var(--muted); display:flex; align-items:center; justify-content:center }

.watermark {
  position:absolute; inset:0; pointer-events:none; opacity:.05;
  background:url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="800" height="800" viewBox="0 0 800 800"><defs><linearGradient id="g" x1="0" x2="1" y1="0" y2="1"><stop stop-color="%231e88e5"/><stop offset="1" stop-color="%2326c6da"/></linearGradient></defs><g fill="url(%23g)" font-family="Arial, sans-serif" font-weight="700" font-size="72" opacity="0.25"><text x="50" y="200" transform="rotate(-30 50 200)">ROB O N A R I M</text><text x="0" y="600" transform="rotate(-30 0 600)">ROBONARIM</text></g></svg>') center/600px 600px no-repeat;
}

.notice { padding:10px 12px; border-radius:10px; background:linear-gradient(135deg,#fff,#f7fcff); border:1px solid var(--line); font-size:12px; color:var(--muted) }

/* Toolbar (غير مستخدمة هنا لكن تُترك للاتساق) */
.toolbar { position:sticky; top:0; inset-inline:0; display:flex; gap:8px; justify-content:center; padding:8px; background:rgba(248,251,255,0.65); backdrop-filter:saturate(140%) blur(8px); border-bottom:1px solid #e9f0f7; z-index:10 }
.btn { cursor:pointer; border:1px solid var(--line); background:#fff; padding:8px 12px; border-radius:10px; font-weight:600 }
.btn.primary { background:linear-gradient(135deg,var(--brand),var(--accent)); color:#fff; border:none }

/* طباعة */
@media print {
  @page { size: A4; margin: 0 }
  html, body { background:#fff; height:auto }
  .page { width:210mm; height:297mm; margin:0; box-shadow:none; border-radius:0; page-break-inside:avoid; break-inside:avoid-page }
  .page:not(:last-of-type){ page-break-after:always; break-after:page }
  /* Single-page helpers */
  body.print-single .page { display:none !important }
  body.print-receipt #receipt { display:block !important }
  body.print-single #receipt {
    height: var(--print-single-height) !important;
    padding: var(--print-single-pad-v) var(--print-single-pad-h) !important;
    overflow: visible !important;
    page-break-after: auto !important;
    break-after: auto !important;
  }
}
  </style>
</head>
<body class="print-receipt print-single">
  <section class="page" id="receipt">
    <div class="watermark"></div>

    <header class="header">
      <div class="brand">
        ${logoBlock}
        <div>
          <h1>${company}</h1>
          <small>Kesin Teşhis • Hızlı Onarım • Bursa içi Kurye</small>
        </div>
      </div>

      <div class="doc-meta">
        <div class="chip">Teslim Fişi</div>
        <div class="row">Sipariş No: <strong style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace">${
          d.receiptNo
        }</strong></div>
        <div class="row">Teslim Alma Tarihi: <strong>${d.dateStr}</strong></div>
        <div class="row" style="font-size:12px">Takip Linki: <span style="word-break:break-all; font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace">${
          d.trackUrl
        }</span></div>
        <div class="row" style="font-size:12px">Takip Kodu: <span style="font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', monospace">${
          d.passCode
        }</span></div>
      </div>
    </header>

    <div class="section grid">
      <div class="card span-6">
        <h2>Müşteri Bilgileri</h2>
        <div class="kv">
          <label>Ad Soyad</label>
          <div class="value">${d.name}</div>
          <label>Telefon</label>
          <div class="value">${d.phone}</div>
          <label>Adres</label>
          <div class="value">${d.address}</div>
        </div>
      </div>

      <div class="card span-6">
        <h2>Cihaz Bilgileri</h2>
        <div class="kv">
          <label>Model</label>
          <div class="value">${d.deviceType}</div>
          <label>Seri No</label>
          <div class="value">${serial}</div>
          <label>Teslim Alınan Aksesuarlar</label>
          <div class="value">${accessories}</div>
        </div>
      </div>

      <div class="card span-12">
        <h2>Varsa Arıza Tanımı</h2>
        <div class="notice">
          ${d.issue || "—"}
        </div>
      </div>
    </div>

    <div class="section grid">
      <div class="card span-8">
        <h2>Notlar ve Koşullar</h2>
        <ul class="list-muted">
          <li>Bu fiş yalnızca cihazın teslim alındığını belgelendirir. Nihai fiyat, teşhis sonrası ayrı bir dosya olarak gönderilir.</li>
          <li>Teslim anında görünmeyen gizli hasarlardan, teşhis öncesi sorumluluk kabul edilmez.</li>
        </ul>
      </div>
      <div class="card span-4">
        <h2>İmzalar</h2>
        <div class="signature">
          <div class="sig-box">Müşteri İmzası</div>
          <div class="sig-box">Görevli İmzası</div>
        </div>
      </div>
    </div>
  </section>
</body>
</html>`;
}
