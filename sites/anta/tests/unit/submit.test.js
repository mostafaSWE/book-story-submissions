// Integration tests for the submission handler with an in-memory store and limiter.
import { describe, expect, it, vi } from "vitest";
import { CONSENT_VERSION, MIN_FILL_MS, PER_EMAIL_PER_DAY, handleSubmission, sha256Hex } from "@/lib/submit.js";
import { duplicateKey } from "@/lib/text.js";

function memoryStore(now = () => NOW) {
  const rows = [];
  return {
    rows,
    async countRecentByEmail(email, since) {
      return rows.filter((r) => r.email.toLowerCase() === email.toLowerCase() && r.created_at >= since).length;
    },
    async insert(row) {
      if (rows.some((r) => r.email.toLowerCase() === row.email.toLowerCase() && r.body_sha256 === row.body_sha256)) return { duplicate: true };
      rows.push({ ...row, created_at: new Date(now()).toISOString() });
      return { ref: `ref-${rows.length}` };
    }
  };
}

const NOW = 1_800_000_000_000;
const good = {
  lang: "ar", title: "حكمة القلم", body: "الكلمةُ الصادقةُ لا تشيخ\r\nسطرٌ ثانٍ 🌙", name: "TEST عبد الرحمن",
  email: "test+unit@Example.com", phone: "٠٥٠١٢٣٤٥٦٧", region: "AE", consent: "on", website: "", startedAt: String(NOW - 60_000)
};
const deps = (over = {}) => ({ store: memoryStore(), ip: "203.0.113.7", country: "AE", userAgent: "UA", ipSecret: "s3cret", now: () => NOW, limitIp: async () => true, ...over });

describe("handleSubmission", () => {
  it("stores a valid contribution exactly as typed, with E.164 phone and consent version", async () => {
    const d = deps();
    const res = await handleSubmission(good, d);
    expect(res).toMatchObject({ status: "ok", ref: "ref-1" });
    const row = d.store.rows[0];
    expect(row).toMatchObject({
      ui_language: "ar", full_name: "TEST عبد الرحمن", email: "test+unit@example.com", phone_e164: "+971501234567",
      phone_region: "AE", title: "حكمة القلم", body: "الكلمةُ الصادقةُ لا تشيخ\nسطرٌ ثانٍ 🌙",
      consent_publish: true, consent_version: CONSENT_VERSION, request_country: "AE", user_agent: "UA"
    });
    expect(row.body_sha256).toBe(await sha256Hex(duplicateKey(row.body)));
    expect(row.ip_hash).toMatch(/^[0-9a-f]{32}$/);
    expect(JSON.stringify(row)).not.toContain("203.0.113.7"); // never the raw IP
  });
  it("returns field codes for invalid input and stores nothing", async () => {
    const d = deps();
    const res = await handleSubmission({ ...good, body: "  ", consent: "" }, d);
    expect(res.status).toBe("invalid");
    expect(Object.keys(res.fieldErrors).sort()).toEqual(["body", "consent"]);
    expect(d.store.rows).toHaveLength(0);
  });
  it("blocks an exact duplicate (same email, same text)", async () => {
    const d = deps();
    await handleSubmission(good, d);
    expect((await handleSubmission({ ...good, email: "TEST+UNIT@example.com", body: "الكلمةُ  الصادقةُ لا تشيخ سطرٌ ثانٍ 🌙" }, d)).status).toBe("duplicate");
  });
  it(`limits one email to ${PER_EMAIL_PER_DAY} contributions per 24 h`, async () => {
    const d = deps();
    for (let i = 0; i < PER_EMAIL_PER_DAY; i++) expect((await handleSubmission({ ...good, body: `نص رقم ${i} للتجربة` }, d)).status).toBe("ok");
    expect((await handleSubmission({ ...good, body: "نص سادس للتجربة" }, d)).status).toBe("rate_limited");
  });
  it("rate-limits by IP before touching the database", async () => {
    const store = memoryStore();
    const spy = vi.spyOn(store, "countRecentByEmail");
    expect((await handleSubmission(good, deps({ store, limitIp: async () => false }))).status).toBe("rate_limited");
    expect(spy).not.toHaveBeenCalled();
  });
  it("honeypot and too-fast submissions look successful but store nothing", async () => {
    const d = deps();
    expect(await handleSubmission({ ...good, website: "http://spam" }, d)).toMatchObject({ status: "ok", ref: null });
    expect(await handleSubmission({ ...good, startedAt: String(NOW - MIN_FILL_MS + 100) }, d)).toMatchObject({ status: "ok", ref: null });
    expect(d.store.rows).toHaveLength(0);
  });
  it("drops Cloudflare's non-country codes (Tor 'T1', unknown 'XX')", async () => {
    for (const country of ["T1", "XX", "", "uae"]) {
      const d = deps({ country });
      await handleSubmission(good, d);
      expect(d.store.rows[0].request_country).toBeNull();
    }
  });
  it("stores null title when none given, truncates very long user agents", async () => {
    const d = deps({ userAgent: "x".repeat(1000) });
    await handleSubmission({ ...good, title: "   " }, d);
    expect(d.store.rows[0].title).toBeNull();
    expect(d.store.rows[0].user_agent).toHaveLength(400);
  });
  it("database failure → generic error, no crash", async () => {
    const store = memoryStore();
    store.insert = async () => { throw Object.assign(new Error("boom"), { code: "XX000" }); };
    vi.spyOn(console, "error").mockImplementation(() => {});
    expect((await handleSubmission(good, deps({ store }))).status).toBe("error");
  });
});
