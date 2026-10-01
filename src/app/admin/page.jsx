import { redirect } from "next/navigation";
import { Download, List } from "lucide-react";
import { AdminTopbar, BookMark } from "@/admin/AdminChrome";
import { getBooksCopy } from "@/admin/copy";
import { BOOKS } from "@/books/registry";
import { requireAdmin } from "@/lib/auth";
import { getAdminCopy, getLanguage } from "@/lib/i18n";

export const dynamic = "force-dynamic";

const LEGACY_FILTERS = ["q", "country", "language", "dateFrom", "dateTo"];

function formatDate(date, locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function excerpt(text) {
  const t = String(text || "").replace(/\s+/g, " ").trim();
  return t.length > 110 ? `${t.slice(0, 110)}…` : t;
}

/** Overview: one clearly separated section per book. Each section is that book's own summary. */
export default async function AdminOverview({ searchParams }) {
  await requireAdmin();
  const params = (await searchParams) || {};

  // Bookmarks of the old single-book dashboard with filters → that book's list, filters kept.
  if (LEGACY_FILTERS.some((k) => params[k])) {
    const query = new URLSearchParams(Object.entries(params).filter(([, v]) => typeof v === "string")).toString();
    redirect(`/admin/reader-to-writer?${query}`);
  }

  const adminCode = params.adminLang === "ar" ? "ar" : "en";
  const lang = getLanguage(adminCode);
  const admin = getAdminCopy(adminCode);
  const c = getBooksCopy(adminCode);

  const sections = await Promise.all(
    BOOKS.map(async (module) => {
      try {
        return { module, data: await module.summary({ latest: 5 }) };
      } catch (error) {
        console.error(`admin overview: ${module.book.slug} summary failed`, error?.code || "", error?.message || error);
        return { module, data: null };
      }
    })
  );

  return (
    <main className="admin-shell" dir={lang.dir}>
      <AdminTopbar admin={admin} adminCode={adminCode} heading={c.books} />
      <div className="ab-wrap">
        <div className="ab-heading">
          <h1>{c.books}</h1>
          <p>{c.booksIntro}</p>
        </div>
        <div className="ab-books">
          {sections.map(({ module: { book }, data }) => (
            <section key={book.slug} className="ab-card ab-book" data-accent={book.accent} data-book={book.slug} aria-labelledby={`book-${book.slug}`}>
              <div className="ab-book-head">
                <BookMark accent={book.accent} />
                <div>
                  <p className="ab-book-label">{c.bookLabel}</p>
                  <h2 className="ab-book-title" id={`book-${book.slug}`} lang="ar">{book.title}</h2>
                  <p className="ab-book-meta">
                    {c.site}: <bdi>{book.domain}</bdi> · {c.table}: <bdi>{book.table}</bdi>
                  </p>
                </div>
              </div>

              {data ? (
                <>
                  <dl className="ab-stats">
                    <div className="is-primary"><dt>{c.total}</dt><dd data-stat="total">{data.total}</dd></div>
                    <div><dt>{c.lastWeek}</dt><dd data-stat="lastWeek">{data.lastWeek}</dd></div>
                  </dl>
                  {data.byStatus && (
                    <dl className="ab-stats ab-stats-status" aria-label={c.status}>
                      {Object.entries(data.byStatus).map(([status, n]) => (
                        <div key={status}><dt><span className="ab-status" data-status={status}>{c.statusNames[status]}</span></dt><dd data-stat={status}>{n}</dd></div>
                      ))}
                    </dl>
                  )}

                  <div>
                    <h3 className="ab-section-title">{c.latest}</h3>
                    {data.latest.length ? (
                      <ol className="ab-latest">
                        {data.latest.map((e) => (
                          <li key={e.id}>
                            <a href={`${e.href}?adminLang=${adminCode}`}>
                              <span className="ab-name"><bdi>{e.name}</bdi>{e.status ? <> <span className="ab-status" data-status={e.status}>{c.statusNames[e.status]}</span></> : null}</span>
                              <span className="ab-when">{formatDate(e.createdAt, lang.code)}</span>
                              <span className="ab-excerpt" dir="auto">{excerpt(e.excerpt)}</span>
                            </a>
                          </li>
                        ))}
                      </ol>
                    ) : (
                      <p className="ab-empty">{c.noEntries}</p>
                    )}
                  </div>
                </>
              ) : (
                <p className="ab-error" role="alert">{c.unavailable}</p>
              )}

              <div className="ab-actions">
                <a className="primary-button compact-button" href={`${book.listPath}?adminLang=${adminCode}`}><List size={16} />{c.allEntries}</a>
                <a className="secondary-button compact-button" href={book.exportPath}><Download size={16} />{c.exportCsv}</a>
                {book.statuses && (
                  <a className="secondary-button compact-button" href={`${book.exportPath}?status=selected`}><Download size={16} />{c.exportSelected}</a>
                )}
              </div>
            </section>
          ))}
        </div>
      </div>
    </main>
  );
}
