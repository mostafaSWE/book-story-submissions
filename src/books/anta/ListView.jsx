// «أنت الكاتب» — entries list (filters: search, status, language, dates).
import Link from "next/link";
import { Download, Eye, Search, ShieldCheck } from "lucide-react";
import { AdminTopbar, BookBar } from "@/admin/AdminChrome";
import { getBooksCopy } from "@/admin/copy";
import { getAdminCopy, getLanguage } from "@/lib/i18n";
import { STATUSES, book, count, list, normalizeFilters } from "./index";

const UI_LANGUAGES = ["ar", "en"];

function formatDate(date, locale) {
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function languageName(code, locale) {
  try { return new Intl.DisplayNames([locale], { type: "language" }).of(code) || code; } catch { return code; }
}

function excerpt(e) {
  const text = (e.title ? `${e.title} — ${e.body}` : e.body).replace(/\s+/g, " ").trim();
  return text.length > 90 ? `${text.slice(0, 90)}…` : text;
}

export default async function AntaList({ searchParams }) {
  const adminCode = searchParams?.adminLang === "ar" ? "ar" : "en";
  const lang = getLanguage(adminCode);
  const admin = getAdminCopy(adminCode);
  const c = getBooksCopy(adminCode);
  const filters = normalizeFilters(searchParams);
  const query = new URLSearchParams(Object.entries({ ...filters, adminLang: adminCode }).filter(([, v]) => v)).toString();
  const exportQuery = new URLSearchParams(Object.entries(filters).filter(([, v]) => v)).toString();

  const [entries, total, filtered, ...perStatus] = await Promise.all([
    list(filters, 200),
    count(),
    count(filters),
    ...STATUSES.map((s) => count({ status: s }))
  ]);

  return (
    <main className="admin-shell ab-book" dir={lang.dir} data-accent={book.accent} data-book={book.slug}>
      <AdminTopbar admin={admin} adminCode={adminCode} heading={c.entries} />
      <BookBar book={book} adminCode={adminCode} />

      <section className="admin-metrics" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))" }}>
        <div><span>{c.total}</span><strong>{total}</strong></div>
        <div><span>{admin.filteredResults}</span><strong>{filtered}</strong></div>
        {STATUSES.map((s, i) => (
          <div key={s}><span>{c.statusNames[s]}</span><strong>{perStatus[i]}</strong></div>
        ))}
        <div><span>{admin.security}</span><strong><ShieldCheck size={20} />{admin.protected}</strong></div>
      </section>

      <section className="admin-panel">
        <form className="admin-filters ab-filters" method="get">
          <label className="admin-filter-search">
            <span>{admin.search}</span>
            <div className="admin-input-icon">
              <Search size={16} />
              <input name="q" defaultValue={filters.q} placeholder={c.searchPlaceholder} />
            </div>
          </label>
          <label>
            <span>{c.status}</span>
            <select name="status" defaultValue={filters.status}>
              <option value="">{c.allStatuses}</option>
              {STATUSES.map((s) => <option key={s} value={s}>{c.statusNames[s]}</option>)}
            </select>
          </label>
          <label>
            <span>{admin.language}</span>
            <select name="language" defaultValue={filters.language}>
              <option value="">{admin.allLanguages}</option>
              {UI_LANGUAGES.map((l) => <option key={l} value={l}>{languageName(l, adminCode)}</option>)}
            </select>
          </label>
          <input type="hidden" name="adminLang" value={adminCode} />
          <label><span>{admin.from}</span><input name="dateFrom" type="date" defaultValue={filters.dateFrom} /></label>
          <label><span>{admin.to}</span><input name="dateTo" type="date" defaultValue={filters.dateTo} /></label>
          <div className="filter-actions">
            <button className="primary-button compact-button" type="submit"><Search size={16} />{admin.filter}</button>
            <Link className="secondary-button compact-button" href={`${book.listPath}?adminLang=${adminCode}`}>{admin.clear}</Link>
            <a className="secondary-button compact-button" href={`${book.exportPath}${exportQuery ? `?${exportQuery}` : ""}`}>
              <Download size={16} />{c.exportCsv}
            </a>
            <a className="secondary-button compact-button" href={`${book.exportPath}?status=selected`}>
              <Download size={16} />{c.exportSelected}
            </a>
          </div>
        </form>
      </section>

      <section className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{admin.date}</th>
              <th>{admin.name}</th>
              <th>{admin.email}</th>
              <th>{admin.phone}</th>
              <th>{admin.language}</th>
              <th>{c.status}</th>
              <th>{c.text}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {entries.map((e) => (
              <tr key={e.id}>
                <td data-label={admin.date}>{formatDate(e.createdAt, lang.code)}</td>
                <td data-label={admin.name}><bdi>{e.name}</bdi></td>
                <td data-label={admin.email} dir="ltr">{e.email}</td>
                <td data-label={admin.phone} dir="ltr">{e.phone}</td>
                <td data-label={admin.language}>{languageName(e.language, adminCode)}</td>
                <td data-label={c.status}><span className="ab-status" data-status={e.status}>{c.statusNames[e.status] || e.status}</span></td>
                <td data-label={c.text}><span className="story-excerpt" dir="auto">{excerpt(e)}</span></td>
                <td>
                  <Link className="table-action" href={`${book.detailPath(e.id)}?${query}`} aria-label={c.view}>
                    <Eye size={17} />
                    <span>{c.view}</span>
                  </Link>
                </td>
              </tr>
            ))}
            {!entries.length && (
              <tr><td colSpan={8} className="empty-table">{c.noEntries}</td></tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
