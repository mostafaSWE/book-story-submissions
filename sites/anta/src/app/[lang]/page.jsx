import Marquee from "@/components/Marquee";
import { ForwardIcon, Ornament } from "@/components/Icons";
import { Colophon, SiteHeader } from "@/components/SiteChrome";
import { preloadFonts } from "@/lib/fonts";
import { getMessages, localizedQuotes, quoteMarks } from "@/lib/i18n";

export const dynamic = "force-static";

// First visit: the quote rows keep their space but stay invisible until their typeface has loaded, so the
// quotes never reflow on screen when it arrives. No JavaScript → never hidden; gives up after 3 s.
const QUOTE_FONT = { ar: '400 1em "Amiri"', en: '400 1em "Newsreader"' };
function quoteFontGate(lang) {
  const font = JSON.stringify(QUOTE_FONT[lang] || QUOTE_FONT.en);
  return `(function(){var f=document.fonts,d=document.documentElement;if(!f||!f.load)return;d.classList.add("q-wait");var done=function(){d.classList.remove("q-wait")};f.load(${font}).then(done,done);setTimeout(done,3000)})();`;
}

export default async function Landing({ params }) {
  const { lang } = await params;
  preloadFonts(lang, "home");
  const m = getMessages(lang);
  const quotes = localizedQuotes(lang).map((q) => ({
    id: q.id,
    display: quoteMarks(q.text, q.lang),
    by: q.by,
    lang: q.lang,
    dir: getMessages(q.lang).meta.dir
  }));

  return (
    <>
      <SiteHeader lang={lang} view="home" />
      <main id="main" tabIndex={-1}>
        <div className="view view-home">
          <section className="hero">
            <p className="eyebrow">{m.series}</p>
            <h1 className="display">{m.title}</h1>
            <p className="tagline">{m.tagline}</p>
          </section>

          <script dangerouslySetInnerHTML={{ __html: quoteFontGate(lang) }} />
          <Marquee quotes={quotes} labels={{ heading: m.quotesHeading, pause: m.motionPause, play: m.motionPlay }} />

          <section className="invite">
            <Ornament />
            <p className="invite-text">{m.invite}</p>
            <a className="button button-primary cta" href={`/${lang}/write`}>
              <span>{m.cta}</span>
              <ForwardIcon />
            </a>
            <p className="cta-note">{m.ctaNote}</p>
          </section>
        </div>
      </main>
      <Colophon lang={lang} />
    </>
  );
}
