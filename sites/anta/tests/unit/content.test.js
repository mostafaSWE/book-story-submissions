import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, expect, it } from "vitest";
import QUOTES from "@content/quotes.json";
import ar from "@messages/ar.json";
import en from "@messages/en.json";
import { FEATURED, ROWS } from "@/lib/marquee-rows.js";
import { RULES } from "@/lib/validation.js";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const keys = (obj, prefix = "") =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" && !Array.isArray(v) ? keys(v, `${prefix}${k}.`) : [`${prefix}${k}`]
  );

describe("translations", () => {
  const files = fs.readdirSync(path.join(root, "messages")).filter((f) => f.endsWith(".json"));
  const all = Object.fromEntries(files.map((f) => [f.slice(0, 2), JSON.parse(fs.readFileSync(path.join(root, "messages", f), "utf8"))]));

  it("every language has exactly the same keys (a new language = one complete file)", () => {
    const reference = keys(ar).sort();
    for (const [code, m] of Object.entries(all)) expect(keys(m).sort(), code).toEqual(reference);
  });
  it("every validation code has a message in every language", () => {
    const codes = ["bodyRequired", "bodyTooShort", "bodyTooLong", "titleTooLong", "nameRequired", "nameInvalid", "emailRequired", "emailInvalid", "emailArabic", "phoneRequired", "phoneInvalid", "consentRequired", "generic", "rateLimited", "duplicate", "summary"];
    expect(Object.keys(RULES).sort()).toEqual(["body", "consent", "email", "name", "phone", "title"]);
    for (const m of Object.values(all)) for (const c of codes) expect(m.errors[c], c).toBeTruthy();
  });
  it("privacy sections line up between languages and keep the {contact} slot", () => {
    expect(en.privacyPage.sections.length).toBe(ar.privacyPage.sections.length);
    expect(ar.privacyPage.sections.filter((s) => s.p.includes("{contact}")).length).toBe(1);
    expect(en.privacyPage.sections.filter((s) => s.p.includes("{contact}")).length).toBe(1);
  });
  it("approved book lines are verbatim", () => {
    expect(ar.formTitle).toBe("مساحةُ إبداعك");
    expect(ar.nameLabel).toBe("كُتِب بواسطة");
    expect(ar.thanksTitle).toBe("إلى لقاءٍ في محرابِ القلم");
    expect(ar.consent).toBe("أوافق على نشر ما كتبتُه باسمي في الجزء الثاني من «أنت الكاتب» إن وقع عليه الاختيار.");
    expect(en.consent).toBe("I agree that, if chosen, my words may be published under my name in the second volume of “You Are the Writer”.");
  });
});

describe("quotes", () => {
  it("has the 40 approved quotes, each in Arabic and English with a page number", () => {
    expect(QUOTES).toHaveLength(40);
    expect(new Set(QUOTES.map((q) => q.id)).size).toBe(40);
    for (const q of QUOTES) {
      expect(q.ar.text && q.ar.by && q.en.text && q.en.by, `#${q.id}`).toBeTruthy();
      expect(q.page).toBeGreaterThan(9);
    }
  });
  it("marquee rows use every quote exactly once; featured ones exist", () => {
    const used = ROWS.flatMap((r) => r.ids).sort((a, b) => a - b);
    expect(used).toEqual(QUOTES.map((q) => q.id).sort((a, b) => a - b));
    for (const id of FEATURED) expect(QUOTES.some((q) => q.id === id)).toBe(true);
  });
});

describe("source hygiene", () => {
  it("no invisible bidi/control characters hidden in source files", () => {
    const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => (d.isDirectory() ? walk(path.join(dir, d.name)) : [path.join(dir, d.name)]));
    const files = [...walk(path.join(root, "src")), ...walk(path.join(root, "messages"))].filter((f) => /\.(js|jsx|mjs|css|json)$/.test(f));
    const bad = [];
    for (const f of files) {
      const text = fs.readFileSync(f, "utf8");
      for (const c of text) {
        const cp = c.codePointAt(0);
        const control = cp < 32 && ![9, 10, 13].includes(cp);
        const bidi = (cp >= 0x200b && cp <= 0x200f) || (cp >= 0x202a && cp <= 0x202e) || (cp >= 0x2066 && cp <= 0x2069) || cp === 0x0600 || cp === 0xfeff;
        if (control || bidi) bad.push(`${path.relative(root, f)} U+${cp.toString(16)}`);
      }
    }
    expect(bad).toEqual([]);
  });
});
