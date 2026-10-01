import { LOCALES, getMessages } from "@/lib/i18n";
import BackLink from "./BackLink";
import { Nib } from "./Icons";
import LanguageNav from "./LanguageNav";

export function SiteHeader({ lang, view }) {
  const m = getMessages(lang);
  const languages = LOCALES.map((code) => ({ code, name: getMessages(code).meta.name }));
  return (
    <header className="topbar">
      <div className="topbar-start">
        {view === "home" ? (
          <a className="mark" href={`/${lang}`} aria-label={m.homeLabel}>
            <Nib />
          </a>
        ) : (
          <BackLink href={`/${lang}`} label={m.back} />
        )}
      </div>
      {view !== "home" && (
        <p className="wordmark" aria-hidden="true">
          {m.title}
        </p>
      )}
      <LanguageNav lang={lang} label={m.langLabel} languages={languages} />
    </header>
  );
}

export function Colophon({ lang }) {
  const m = getMessages(lang);
  return (
    <footer className="colophon">
      <p>{m.colophon}</p>
      <p className="colophon-links">
        <a href={`/${lang}/privacy`}>{m.privacyLink}</a>
      </p>
    </footer>
  );
}
