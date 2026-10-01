import { Colophon, SiteHeader } from "@/components/SiteChrome";
import { preloadFonts } from "@/lib/fonts";
import { getMessages } from "@/lib/i18n";

// Rendered per request so the contact address can be set in the Worker's settings without a rebuild.
export const dynamic = "force-dynamic";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const m = getMessages(lang);
  return { title: m.privacyPage.docTitle, alternates: { canonical: `/${lang}/privacy` } };
}

export default async function Privacy({ params }) {
  const { lang } = await params;
  preloadFonts(lang, "privacy");
  const m = getMessages(lang);
  const p = m.privacyPage;
  const email = (process.env.PRIVACY_CONTACT_EMAIL || "").trim();
  const hasEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const contact = hasEmail
    ? (() => {
        const [a, b] = p.contactWithEmail.split("{email}");
        return <>{a}<a href={`mailto:${email}`} dir="ltr">{email}</a>{b}</>;
      })()
    : p.contactWithout;

  return (
    <>
      <SiteHeader lang={lang} view="privacy" />
      <main id="main" tabIndex={-1}>
        <article className="privacy-page">
          <h1 className="privacy-title">{p.title}</h1>
          <p className="privacy-lead">{p.lead}</p>
          <dl className="privacy-list">
            {p.sections.map((s) => {
              const [before, after] = s.p.split("{contact}");
              return (
                <div key={s.h}>
                  <dt>{s.h}</dt>
                  <dd>
                    {after === undefined ? s.p : <>{before}{contact}{after}</>}
                  </dd>
                </div>
              );
            })}
          </dl>
          <p className="privacy-updated">{p.updated}</p>
        </article>
      </main>
      <Colophon lang={lang} />
    </>
  );
}
