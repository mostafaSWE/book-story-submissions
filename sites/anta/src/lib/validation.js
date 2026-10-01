// One set of rules for the form (instant feedback) and the server (the authority).
// Errors are codes; each language file has the words for every code under "errors".
import { cleanLine, cleanLongText, graphemeCount } from "./text.js";
import { parsePhone } from "./phone.js";

export const LIMITS = { bodyMin: 3, bodyMax: 1000, titleMax: 120, nameMin: 2, nameMax: 80, emailMax: 254 };
export const FIELD_ORDER = ["title", "body", "name", "email", "phone", "consent"];

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s.'’\-ـ]*$/u;
const EMAIL_RE = /^[^\s@]+@[^\s@.]+(\.[^\s@.]+)*\.[^\s@.]{2,}$/;
const ARABIC_RE = /[\u0600-\u06FF]/;

/** Normalizes raw input (strings from a form) into the values that get validated and stored. */
export function normalizeInput(raw) {
  const email = cleanLine(raw.email, 320);
  const at = email.lastIndexOf("@");
  return {
    title: cleanLine(raw.title, 600),
    body: cleanLongText(raw.body),
    name: cleanLine(raw.name, 200),
    email: at > 0 ? email.slice(0, at) + email.slice(at).toLowerCase() : email, // lowercase the domain only
    phone: parsePhone(raw.phone, raw.region),
    consent: raw.consent === true || raw.consent === "on" || raw.consent === "true" || raw.consent === "1"
  };
}

export const RULES = {
  title: (v, lang) => (v.title && graphemeCount(v.title, lang) > LIMITS.titleMax ? { code: "titleTooLong", vars: { max: LIMITS.titleMax } } : null),
  body: (v, lang) => {
    if (!v.body) return { code: "bodyRequired" };
    if (graphemeCount(v.body.replace(/\s+/g, ""), lang) < LIMITS.bodyMin) return { code: "bodyTooShort", vars: { min: LIMITS.bodyMin } };
    if (graphemeCount(v.body, lang) > LIMITS.bodyMax) return { code: "bodyTooLong", vars: { max: LIMITS.bodyMax } };
    return null;
  },
  name: (v, lang) => {
    if (!v.name) return { code: "nameRequired" };
    const n = graphemeCount(v.name, lang);
    if (n < LIMITS.nameMin || n > LIMITS.nameMax || !NAME_RE.test(v.name)) return { code: "nameInvalid" };
    return null;
  },
  email: (v) => {
    if (!v.email) return { code: "emailRequired" };
    if (ARABIC_RE.test(v.email)) return { code: "emailArabic" };
    if (v.email.length > LIMITS.emailMax || !EMAIL_RE.test(v.email)) return { code: "emailInvalid" };
    return null;
  },
  phone: (v) => {
    if (v.phone.reason === "empty") return { code: "phoneRequired" };
    if (!v.phone.ok) return { code: "phoneInvalid", vars: { region: v.phone.region } };
    return null;
  },
  consent: (v) => (v.consent ? null : { code: "consentRequired" })
};

/** @returns {Record<string, {code: string, vars?: object}>} empty when valid */
export function validate(values, lang = "ar", fields = FIELD_ORDER) {
  const errors = {};
  for (const field of fields) {
    const error = RULES[field](values, lang);
    if (error) errors[field] = error;
  }
  return errors;
}
