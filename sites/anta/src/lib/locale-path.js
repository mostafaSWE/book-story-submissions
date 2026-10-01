// Tiny, dependency-free helpers safe to ship to the browser.
export const LANG_COOKIE = "anta_lang";

/** Same path in another language: /ar/write → /en/write. */
export function pathInLocale(pathname, lang, locales) {
  const parts = (pathname || "/").split("/");
  if (locales.includes(parts[1])) parts[1] = lang;
  else parts.splice(1, 0, lang);
  return parts.join("/").replace(/\/$/, "") || `/${lang}`;
}

export function rememberLanguage(lang) {
  const secure = typeof location !== "undefined" && location.protocol === "https:" ? "; secure" : "";
  document.cookie = `${LANG_COOKIE}=${lang}; path=/; max-age=31536000; samesite=lax${secure}`;
}
