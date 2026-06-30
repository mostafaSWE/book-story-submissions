"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, ScrollText } from "lucide-react";
import BrandMark from "@/components/BrandMark";
import LanguageSelect from "@/components/LanguageSelect";
import { getLanguage, languages, translations } from "@/lib/i18n";
import { getTermsContent } from "@/lib/terms";

function isSupported(code) {
  return Boolean(code) && languages.some((language) => language.code === code);
}

function detectBrowserLanguage() {
  if (typeof navigator === "undefined") return "en";
  const browserLanguage = navigator.language?.slice(0, 2).toLowerCase();
  return isSupported(browserLanguage) ? browserLanguage : "en";
}

function TermsView() {
  const params = useSearchParams();
  const paramLanguage = params.get("lang");
  const [language, setLanguage] = useState(isSupported(paramLanguage) ? paramLanguage : "en");

  useEffect(() => {
    if (!isSupported(paramLanguage)) {
      setLanguage(detectBrowserLanguage());
    }
  }, [paramLanguage]);

  const languageConfig = getLanguage(language);
  const dir = languageConfig.dir;
  const copy = translations[languageConfig.code] || translations.en;
  const terms = getTermsContent(languageConfig.code);

  useEffect(() => {
    document.documentElement.lang = languageConfig.code;
    document.documentElement.dir = dir;
  }, [dir, languageConfig.code]);

  return (
    <section className="journey terms-journey" dir={dir}>
      <div className="hero-bg" aria-hidden="true" />
      <div className="golden-vignette" aria-hidden="true" />

      <div className="journey-shell terms-shell">
        <header className="brand-strip">
          <div className="brand-lockup">
            <BrandMark />
            <span>
              <small>{copy.projectLabel}</small>
              <strong>{copy.bookTitle}</strong>
            </span>
          </div>

          <div className="language-switch">
            <span>{copy.changeLanguage}</span>
            <LanguageSelect
              value={language}
              onChange={setLanguage}
              dir={dir}
              compact
              searchable={false}
              labels={{
                placeholder: copy.languageSelectPlaceholder,
                searchPlaceholder: copy.languageSearchPlaceholder,
                noResults: copy.languageNoResults
              }}
            />
          </div>
        </header>

        <article className="terms-doc">
          <span className="screen-kicker">
            <ScrollText size={18} />
            {copy.bookTitle}
          </span>
          <h1>{terms.title}</h1>
          <ol className="terms-list">
            {terms.clauses.map((clause, index) => (
              <li key={index}>{clause}</li>
            ))}
          </ol>
        </article>

        <div className="terms-foot">
          <a className="secondary-button" href="/">
            {dir === "rtl" ? <ArrowRight size={18} /> : <ArrowLeft size={18} />}
            {copy.back}
          </a>
        </div>
      </div>
    </section>
  );
}

export default function TermsPage() {
  return (
    <main className="site-shell">
      <Suspense fallback={null}>
        <TermsView />
      </Suspense>
    </main>
  );
}
