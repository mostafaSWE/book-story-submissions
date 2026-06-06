import worldCountries from "world-countries";

const localeMap = {
  ar: "ar",
  en: "en",
  fr: "fr",
  es: "es",
  pt: "pt",
  de: "de",
  it: "it",
  ru: "ru",
  zh: "zh-CN",
  hi: "hi",
  ja: "ja"
};

export const countryCodes = worldCountries
  .map((country) => country.cca2)
  .filter((code) => /^[A-Z]{2}$/.test(code))
  .sort();

const countryCodeSet = new Set(countryCodes);

export function isValidCountryCode(code) {
  return countryCodeSet.has(String(code || "").toUpperCase());
}

export function flagForCountry(code) {
  const normalized = String(code || "").toUpperCase();
  if (!isValidCountryCode(normalized)) return "";

  return normalized
    .split("")
    .map((letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)))
    .join("");
}

export function countryNameForCode(code, language = "en") {
  const normalized = String(code || "").toUpperCase();
  if (!isValidCountryCode(normalized)) return "";

  const locale = localeMap[language] || language || "en";

  try {
    const displayNames = new Intl.DisplayNames([locale, "en"], { type: "region" });
    return displayNames.of(normalized) || normalized;
  } catch {
    const fallback = worldCountries.find((country) => country.cca2 === normalized);
    return fallback?.name?.common || normalized;
  }
}

export function getLocalizedCountries(language = "en") {
  return countryCodes
    .map((code) => ({
      code,
      name: countryNameForCode(code, language),
      flagCode: code.toLowerCase(),
      flag: flagForCountry(code)
    }))
    .sort((a, b) => a.name.localeCompare(b.name, localeMap[language] || language || "en"));
}
