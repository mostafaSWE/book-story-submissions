// Text helpers shared by the browser and the server.

/** User-perceived characters: a letter with its harakat is one, 🌙 or ✍🏽 is one. */
export function graphemeCount(value, locale = "ar") {
  const text = String(value ?? "");
  if (typeof Intl !== "undefined" && Intl.Segmenter) {
    let count = 0;
    for (const _ of new Intl.Segmenter(locale, { granularity: "grapheme" }).segment(text)) count++; // eslint-disable-line no-unused-vars
    return count;
  }
  return Array.from(text).length;
}

/**
 * Keeps the text as typed. Only: CRLF/CR → LF (browsers send textarea breaks as CRLF),
 * remove NUL and other C0 control characters Postgres/CSV can't carry (tab and newline stay),
 * and trim outer whitespace.
 */
export function cleanLongText(value) {
  return String(value ?? "")
    .replace(/\r\n?/g, "\n")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "")
    .trim();
}

/** Single-line fields: same, plus collapse runs of whitespace. */
export function cleanLine(value, maxCodePoints = 500) {
  return Array.from(cleanLongText(value).replace(/\s+/g, " ")).slice(0, maxCodePoints).join("");
}

/** Normal form used only for duplicate detection (never stored). */
export function duplicateKey(value) {
  return cleanLongText(value).normalize("NFC").replace(/\s+/g, " ").trim();
}
