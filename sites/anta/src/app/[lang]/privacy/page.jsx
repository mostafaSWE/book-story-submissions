import { Colophon, SiteHeader } from "@/components/SiteChrome";
import { preloadFonts } from "@/lib/fonts";
import { getMessages } from "@/lib/i18n";

export const dynamic = "force-static";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const m = getMessages(lang);
  return { title: m.privacyPage.docTitle, alternates: { canonical: `/${lang}/privacy` } };
}

export default async function Privacy({ params }) {
  const { lang } = await params;
  preloadFonts(lang, "privacy");
  const p = getMessages(lang).privacyPage;

  return (
    <>
      <SiteHeader lang={lang} view="privacy" />
      <main id="main" tabIndex={-1}>
        <article className="privacy-page">
          <h1 className="privacy-title">{p.title}</h1>
          <p className="privacy-lead">{p.lead}</p>
          <dl className="privacy-list">
            {p.sections.map((s) => (
              <div key={s.h}>
                <dt>{s.h}</dt>
                <dd>{s.p}</dd>
              </div>
            ))}
          </dl>
          <p className="privacy-updated">{p.updated}</p>
        </article>
      </main>
      <Colophon lang={lang} />
    </>
  );
}
