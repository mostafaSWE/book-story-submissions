"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import { pathInLocale, rememberLanguage } from "@/lib/locale-path";

/** Language picker. The language lives in the URL (/ar, /en) and is remembered in a cookie. */
export default function LanguageNav({ lang, label, languages }) {
  const pathname = usePathname();
  const codes = languages.map((l) => l.code);

  useEffect(() => {
    rememberLanguage(lang);
  }, [lang]);

  return (
    <nav className="lang" aria-label={label}>
      {languages.map((l) => (
        <a
          key={l.code}
          href={pathInLocale(pathname, l.code, codes)}
          lang={l.code}
          hrefLang={l.code}
          aria-current={l.code === lang ? "true" : undefined}
          onClick={() => rememberLanguage(l.code)}
        >
          {l.name}
        </a>
      ))}
    </nav>
  );
}
