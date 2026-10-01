import { describe, expect, it } from "vitest";
import { cleanPhoneInput, countryGroups, parsePhone, toAsciiDigits } from "@/lib/phone.js";

const AR_INDIC = String.fromCharCode(0x0660, 0x0665, 0x0660, 0x0661, 0x0662, 0x0663, 0x0664, 0x0665, 0x0666, 0x0667); // ٠٥٠١٢٣٤٥٦٧
const PERSIAN = String.fromCharCode(0x06f0, 0x06f5, 0x06f0, 0x06f1, 0x06f2, 0x06f3, 0x06f4, 0x06f5, 0x06f6, 0x06f7); // ۰۵۰۱۲۳۴۵۶۷
const LRM = String.fromCharCode(0x200e);
const RLM = String.fromCharCode(0x200f);
const NBSP = String.fromCharCode(0x00a0);

describe("digits", () => {
  it("converts Arabic-Indic and Persian digits to ASCII", () => {
    expect(toAsciiDigits(AR_INDIC)).toBe("0501234567");
    expect(toAsciiDigits(PERSIAN)).toBe("0501234567");
  });
  it("strips bidi marks, NBSP, spaces, dashes, brackets; 00 → +", () => {
    expect(cleanPhoneInput(`${LRM}+971 50-123${NBSP}4567${RLM}`)).toBe("+971501234567");
    expect(cleanPhoneInput("(050) 123 4567")).toBe("0501234567");
    expect(cleanPhoneInput("00974 3312 3456")).toBe("+97433123456");
  });
});

describe("parsePhone → E.164", () => {
  const cases = [
    [AR_INDIC, "AE", "+971501234567", "AE"],
    [PERSIAN, "AE", "+971501234567", "AE"],
    ["0501234567", "AE", "+971501234567", "AE"],
    ["971501234567", "AE", "+971501234567", "AE"], // country code typed without +
    ["+966 50 123 4567", "AE", "+966501234567", "SA"], // + wins over the selected country
    ["0501234567", "SA", "+966501234567", "SA"],
    ["00974 3312 3456", "AE", "+97433123456", "QA"],
    ["5000 0000", "KW", "+96550000000", "KW"],
    ["3600 1234", "BH", "+97336001234", "BH"],
    ["9212 3456", "OM", "+96892123456", "OM"],
    ["07400 123456", "GB", "+447400123456", "GB"],
    ["07911 123456", "GB", "+447911123456", "GG"] // shares +44; region reported precisely
  ];
  it.each(cases)("%s with %s → %s", (raw, region, e164, detected) => {
    const r = parsePhone(raw, region);
    expect(r.ok).toBe(true);
    expect(r.e164).toBe(e164);
    expect(r.region).toBe(detected);
    expect(r.formatted.startsWith("+")).toBe(true);
  });
  it("rejects too-short, letters and empty", () => {
    expect(parsePhone("12", "AE")).toMatchObject({ ok: false, reason: "invalid" });
    expect(parsePhone("05O1234567", "AE")).toMatchObject({ ok: false, reason: "invalid" });
    expect(parsePhone("   ", "AE")).toMatchObject({ ok: false, reason: "empty" });
  });
  it("falls back to UAE for an unknown region code", () => {
    expect(parsePhone("0501234567", "ZZ").e164).toBe("+971501234567");
  });
});

describe("country picker", () => {
  it("lists the Gulf first, then Arab states, then the world, with no duplicates", () => {
    const groups = countryGroups("ar");
    expect(groups.map((g) => g.key)).toEqual(["gcc", "arab", "world"]);
    expect(groups[0].countries.map((c) => c.code)).toEqual(["AE", "SA", "KW", "QA", "BH", "OM"]);
    const all = groups.flatMap((g) => g.countries.map((c) => c.code));
    expect(new Set(all).size).toBe(all.length);
    expect(all.length).toBeGreaterThan(200);
    expect(groups[0].countries[0].name).not.toBe("AE"); // localized name
  });
});
