import Marquee from "@/components/Marquee";
import { ForwardIcon, Ornament } from "@/components/Icons";
import { Colophon, SiteHeader } from "@/components/SiteChrome";
import { getMessages, localizedQuotes, quoteMarks } from "@/lib/i18n";

export const dynamic = "force-static";

export default async function Landing({ params }) {
  const { lang } = await params;
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
