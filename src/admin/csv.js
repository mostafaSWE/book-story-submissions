// CSV for the admin exports of every book: opens correctly in Excel and LibreOffice.
// - UTF-8 byte-order mark, so Arabic isn't garbled in Excel on Windows
// - every cell quoted; line breaks inside a cell are kept
// - formula-injection guard: cells starting with = + - @ (or tab/CR) get a leading apostrophe
// - phone numbers are written as ="+971501234567" so Excel shows them as text, "+" included,
//   instead of a number or a formula (only for values made of digits, spaces and + ( ) . -)
const BOM = String.fromCharCode(0xfeff);
const DANGEROUS = /^[=+\-@\t\r]/;
const PHONE_LIKE = /^\+?[\d][\d\s().-]*$/;

export function csvCell(value, kind) {
  let text = value == null ? "" : String(value);
  text = text.replace(/\r\n?/g, "\n");
  if (kind === "phone" && PHONE_LIKE.test(text.trim())) {
    text = `="${text.trim()}"`;
  } else if (DANGEROUS.test(text)) {
    text = `'${text}`;
  }
  return `"${text.replace(/"/g, '""')}"`;
}

/**
 * @param {{key: string, label: string, kind?: "phone"}[]} columns
 * @param {object[]} rows  plain objects keyed by column.key
 */
export function toCsv(columns, rows) {
  const lines = [columns.map((c) => csvCell(c.label)).join(",")];
  for (const row of rows) lines.push(columns.map((c) => csvCell(row[c.key], c.kind)).join(","));
  return BOM + lines.join("\r\n") + "\r\n";
}

export function csvResponse(csv, filename) {
  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Cache-Control": "private, no-store"
    }
  });
}
