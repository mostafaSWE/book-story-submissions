import { describe, expect, it } from "vitest";
import { cleanLine, cleanLongText, duplicateKey, graphemeCount } from "@/lib/text.js";
import { LIMITS, normalizeInput, validate } from "@/lib/validation.js";

const ch = (...codes) => String.fromCodePoint(...codes);
const FAMILY = ch(0x1f468, 0x200d, 0x1f469, 0x200d, 0x1f467); // 👨‍👩‍👧 (ZWJ sequence)
const FLAG_AE = ch(0x1f1e6, 0x1f1ea); // 🇦🇪
const MOON = ch(0x1f319);
const VOCALIZED = "الحكمةُ"; // final letter carries a damma

const base = { title: "", body: "الحكمةُ ضالّةُ المؤمن", name: "عبدُالله بن سالم", email: "A@Example.COM", phone: "0501234567", region: "AE", consent: "on" };

describe("graphemes", () => {
  it("counts a letter with its harakat once, and an emoji sequence once", () => {
    expect(graphemeCount(VOCALIZED)).toBe(6);
    expect(graphemeCount(FAMILY)).toBe(1);
    expect(graphemeCount(FLAG_AE)).toBe(1);
    expect(graphemeCount(`${MOON}✍️`)).toBe(2);
  });
});

describe("cleaning keeps text as typed", () => {
  it("normalizes CRLF, drops NUL/control chars, keeps tabs, newlines, emoji, tashkeel", () => {
    const raw = `  سطرٌ أول\r\nسطر ثانٍ${ch(0)}\tمع ${MOON}  `;
    expect(cleanLongText(raw)).toBe(`سطرٌ أول\nسطر ثانٍ\tمع ${MOON}`);
  });
  it("single-line fields collapse whitespace", () => {
    expect(cleanLine("  عبد   الله \n السالم ")).toBe("عبد الله السالم");
  });
  it("duplicate key ignores spacing differences only", () => {
    expect(duplicateKey("الحكمة  ضالة\n\nالمؤمن")).toBe(duplicateKey("الحكمة ضالة المؤمن"));
    expect(duplicateKey("الحكمةُ")).not.toBe(duplicateKey("الحكمة"));
  });
});

describe("validation rules", () => {
  const errs = (patch) => validate(normalizeInput({ ...base, ...patch }), "ar");
  it("accepts an Arabic name with tashkeel and an Arabic-Indic phone", () => {
    expect(errs({ phone: String.fromCharCode(0x0660, 0x0665, 0x0660, 0x0661, 0x0662, 0x0663, 0x0664, 0x0665, 0x0666, 0x0667) })).toEqual({});
  });
  it("lowercases only the email domain", () => {
    expect(normalizeInput(base).email).toBe("A@example.com");
  });
  it.each([
    ["body", { body: "   \n\t " }, "bodyRequired"],
    ["body", { body: "اب" }, "bodyTooShort"],
    ["body", { body: "ا".repeat(LIMITS.bodyMax + 1) }, "bodyTooLong"],
    ["title", { title: "ع".repeat(LIMITS.titleMax + 1) }, "titleTooLong"],
    ["name", { name: "" }, "nameRequired"],
    ["name", { name: "Ali123" }, "nameInvalid"],
    ["name", { name: "http://spam" }, "nameInvalid"],
    ["email", { email: "" }, "emailRequired"],
    ["email", { email: "بريد@مثال.كوم" }, "emailArabic"],
    ["email", { email: "no-at-sign.com" }, "emailInvalid"],
    ["phone", { phone: "" }, "phoneRequired"],
    ["phone", { phone: "12" }, "phoneInvalid"],
    ["consent", { consent: "" }, "consentRequired"]
  ])("%s: %j → %s", (field, patch, code) => {
    expect(errs(patch)[field]?.code).toBe(code);
  });
  it("accepts exactly 1,000 characters including emoji", () => {
    expect(errs({ body: `${MOON}${FAMILY} ` + "ب".repeat(997) })).toEqual({});
  });
  it("phone error carries the region so the message can name the country", () => {
    expect(errs({ phone: "12" }).phone.vars.region).toBe("AE");
  });
});
