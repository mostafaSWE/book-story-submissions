import ContributionForm from "@/components/ContributionForm";
import { Colophon, SiteHeader } from "@/components/SiteChrome";
import { getMessages } from "@/lib/i18n";
import { countryGroups } from "@/lib/phone";

export const dynamic = "force-static";

export async function generateMetadata({ params }) {
  const { lang } = await params;
  const m = getMessages(lang);
  return { title: `${m.formTitle} — ${m.title}`, alternates: { canonical: `/${lang}/write` } };
}

export default async function Write({ params }) {
  const { lang } = await params;
  const m = getMessages(lang);

  const aside = (
    <aside className="write-aside">
      <figure className="aside-cover">
        <img src="/img/cover.jpg" width={643} height={908} loading="lazy" decoding="async" alt={m.coverAlt} />
      </figure>
      <blockquote className="aside-promise">
        <p>{m.asidePromise}</p>
        <footer>{m.asideSource}</footer>
      </blockquote>
    </aside>
  );

  return (
    <>
      <SiteHeader lang={lang} view="write" />
      <main id="main" tabIndex={-1}>
        <ContributionForm lang={lang} m={m} groups={countryGroups(lang)} aside={aside} />
      </main>
      <Colophon lang={lang} />
    </>
  );
}
