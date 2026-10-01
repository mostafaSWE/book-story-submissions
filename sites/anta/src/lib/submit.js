// Server-side submission logic, independent of Next.js so it can be tested with fake dependencies.
import { duplicateKey } from "./text.js";
import { normalizeInput, validate } from "./validation.js";

export const CONSENT_VERSION = "2026-10-01"; // the consent wording approved in Phase 1 (D4)
export const PER_EMAIL_PER_DAY = 5; // D7
export const MIN_FILL_MS = 2500; // faster than any human can fill the form

const encoder = new TextEncoder();
const hex = (buf) => Array.from(new Uint8Array(buf), (b) => b.toString(16).padStart(2, "0")).join("");

export async function sha256Hex(text) {
  return hex(await crypto.subtle.digest("SHA-256", encoder.encode(text)));
}

export async function hmacHex(secret, text) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, encoder.encode(text)));
}

/**
 * @param {object} raw  form fields: lang, title, body, name, email, phone, region, consent, website, startedAt
 * @param {object} deps { store, limitIp(key)→Promise<bool>, ip, country, userAgent, ipSecret, now() }
 * @returns {Promise<{status: "ok"|"invalid"|"duplicate"|"rate_limited"|"error", ref?: string, fieldErrors?: object, submitted?: object}>}
 */
export async function handleSubmission(raw, deps) {
  const lang = /^[a-z]{2}$/.test(raw.lang || "") ? raw.lang : "ar";
  const values = normalizeInput(raw);
  const fieldErrors = validate(values, lang);
  if (Object.keys(fieldErrors).length) return { status: "invalid", fieldErrors };

  const submitted = { title: values.title, body: values.body, name: values.name };
  const now = deps.now ? deps.now() : Date.now();

  // Bots: behave exactly like success, store nothing (same honeypot field name as the original site).
  const startedAt = Number(raw.startedAt);
  if (String(raw.website || "").trim() || (Number.isFinite(startedAt) && startedAt > 0 && now - startedAt < MIN_FILL_MS)) {
    return { status: "ok", ref: null, submitted };
  }

  if (deps.limitIp && !(await deps.limitIp(`ip:${deps.ip || "unknown"}`))) return { status: "rate_limited" };

  try {
    const since = new Date(now - 24 * 60 * 60 * 1000).toISOString();
    if ((await deps.store.countRecentByEmail(values.email, since)) >= PER_EMAIL_PER_DAY) return { status: "rate_limited" };

    const country = String(deps.country || "").toUpperCase();
    const row = {
      ui_language: lang,
      full_name: values.name,
      email: values.email,
      phone_e164: values.phone.e164,
      phone_region: values.phone.region,
      title: values.title || null,
      body: values.body,
      body_sha256: await sha256Hex(duplicateKey(values.body)),
      consent_publish: true,
      consent_version: CONSENT_VERSION,
      ip_hash: deps.ip && deps.ipSecret ? (await hmacHex(deps.ipSecret, deps.ip)).slice(0, 32) : null,
      request_country: /^[A-Z]{2}$/.test(country) && country !== "XX" ? country : null,
      user_agent: deps.userAgent ? Array.from(String(deps.userAgent)).slice(0, 400).join("") : null
    };
    const result = await deps.store.insert(row);
    if (result.duplicate) return { status: "duplicate" };
    return { status: "ok", ref: result.ref, submitted };
  } catch (error) {
    console.error("anta submission failed", error?.code || "", error?.message || error);
    return { status: "error" };
  }
}
