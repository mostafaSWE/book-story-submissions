import { DEFAULT_LOCALE, LOCALES, MESSAGES } from "@/generated/locales";
import QUOTES from "@content/quotes.json";

export { DEFAULT_LOCALE, LOCALES };
export { LANG_COOKIE } from "./locale-path.js";

/** Canonical public address (used for canonical/OG URLs even while served from workers.dev). */
export const SITE_URL = "https://anta.readertowriter.net";

export function isLocale(value) {
  return LOCALES.includes(value);
}

export function getMessages(lang) {
  return MESSAGES[lang] || MESSAGES[DEFAULT_LOCALE];
}

/** Looks up "a.b.c" in a messages object and fills {placeholders}. */
export function translate(messages, key, vars) {
  const value = key.split(".").reduce((node, part) => (node == null ? node : node[part]), messages);
  const text = value == null ? key : String(value);
  return text.replace(/\{(\w+)\}/g, (_, name) => (vars && vars[name] != null ? String(vars[name]) : ""));
}

export function numberFormatter(lang) {
  return new Intl.NumberFormat(getMessages(lang).meta.locale);
}

/** Quotes in the page language; a language without its own wording falls back to English. */
export function localizedQuotes(lang) {
  return QUOTES.map((q) => {
    const v = q[lang] || q.en;
    return { id: q.id, text: v.text, by: v.by, lang: q[lang] ? lang : "en" };
  });
}

export function quoteMarks(text, lang) {
  return lang === "ar" ? `«${text}»` : `“${text.replace(/[.]$/, "")}”`;
}
