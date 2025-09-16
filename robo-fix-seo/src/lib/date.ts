// يحوّل قيم Google Sheets إلى تاريخ صالح للعرض
export function formatSheetDate(input: any, locale = "tr-TR"): string {
  if (input == null || input === "") return "—";

  // 1) رقم تسلسلي من Google Sheets/Excel
  if (typeof input === "number" || /^\d+(\.\d+)?$/.test(String(input))) {
    const serial = Number(input);
    const ms = (serial - 25569) * 86400 * 1000; // 25569 = 1970-01-01
    const d = new Date(ms);
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString(locale);
  }

  const s = String(input).trim();

  // 2) ISO أو صيغ مدعومة من Date()
  const iso = new Date(s);
  if (!isNaN(iso.getTime())) return iso.toLocaleDateString(locale);

  // 3) صيغ شائعة: dd/mm/yyyy , dd.mm.yyyy , yyyy/mm/dd
  // dd/mm/yyyy
  let m = s.match(/^(\d{1,2})[\/\.](\d{1,2})[\/\.](\d{4})$/);
  if (m) {
    const [_, dd, mm, yyyy] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString(locale);
  }

  // yyyy/mm/dd
  m = s.match(/^(\d{4})[\/\-\.](\d{1,2})[\/\-\.](\d{1,2})$/);
  if (m) {
    const [_, yyyy, mm, dd] = m;
    const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
    return isNaN(d.getTime()) ? "—" : d.toLocaleDateString(locale);
  }

  return "—";
}
