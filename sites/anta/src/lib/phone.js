// Phone numbers → E.164, shared by the browser and the server (the server result is the one stored).
import { getCountries, getCountryCallingCode, parsePhoneNumberFromString } from "libphonenumber-js/min";

export const DEFAULT_REGION = "AE"; // D8 fallback: the publisher's country
export const GCC = ["AE", "SA", "KW", "QA", "BH", "OM"];
export const ARAB = ["EG", "JO", "LB", "IQ", "SY", "PS", "YE", "SD", "LY", "TN", "DZ", "MA", "MR", "SO", "DJ", "KM"];

const REGIONS = new Set(getCountries());
export function isRegion(code) {
  return REGIONS.has(String(code || "").toUpperCase());
}

// bidi marks/isolates pasted around numbers, NBSP, spaces and common separators
const INVISIBLE = /[\u200E\u200F\u202A-\u202E\u2066-\u2069\u00A0\s().\-\u2013\u2014/]/g;

/** Arabic-Indic (٠–٩) and Extended Arabic-Indic (۰–۹) digits → ASCII. */
export function toAsciiDigits(value) {
  return String(value ?? "").replace(/[\u0660-\u0669\u06F0-\u06F9]/g, (ch) => {
    const code = ch.charCodeAt(0);
    return String(code >= 0x06f0 ? code - 0x06f0 : code - 0x0660);
  });
}

export function cleanPhoneInput(raw) {
  let s = toAsciiDigits(raw).replace(INVISIBLE, "").replace(/^\uFF0B/, "+");
  if (s.startsWith("00")) s = `+${s.slice(2)}`;
  return s;
}

/**
 * @returns {{ok: true, e164: string, formatted: string, region: string} | {ok: false, reason: "empty"|"invalid", region: string}}
 */
export function parsePhone(raw, region) {
  const selected = isRegion(region) ? region.toUpperCase() : DEFAULT_REGION;
  const s = cleanPhoneInput(raw);
  if (!s) return { ok: false, reason: "empty", region: selected };
  if (!/^\+?\d+$/.test(s)) return { ok: false, reason: "invalid", region: selected };

  const tries = [parsePhoneNumberFromString(s, selected)];
  // People often type the country code without "+", e.g. 971501234567.
  if (!s.startsWith("+")) tries.push(parsePhoneNumberFromString(`+${s}`));
  const hit = tries.find((p) => p && p.isValid());
  if (!hit) return { ok: false, reason: "invalid", region: tries[0]?.country || selected };
  return { ok: true, e164: hit.number, formatted: hit.formatInternational(), region: hit.country || selected };
}

export function callingCode(region) {
  return isRegion(region) ? getCountryCallingCode(region) : getCountryCallingCode(DEFAULT_REGION);
}

/** Country list for the picker: Gulf states, then Arab states, then everyone else, names in the page language. */
export function countryGroups(lang) {
  let names;
  try {
    names = new Intl.DisplayNames([lang, "en"], { type: "region" });
  } catch {
    names = { of: (c) => c };
  }
  const entry = (code) => ({ code, dial: getCountryCallingCode(code), name: names.of(code) || code });
  const collator = new Intl.Collator(lang);
  const inGroups = new Set([...GCC, ...ARAB]);
  return [
    { key: "gcc", countries: GCC.map(entry) },
    { key: "arab", countries: ARAB.filter(isRegion).map(entry).sort((a, b) => collator.compare(a.name, b.name)) },
    { key: "world", countries: getCountries().filter((c) => !inGroups.has(c)).map(entry).sort((a, b) => collator.compare(a.name, b.name)) }
  ];
}
