import Link from "next/link";
import { Download, Eye, LogOut, Search, ShieldCheck } from "lucide-react";
import AdminLanguageSwitch from "@/components/AdminLanguageSwitch";
import BrandMark from "@/components/BrandMark";
import { requireAdmin } from "@/lib/auth";
import { getAdminCopy, getLanguage, languages } from "@/lib/i18n";
import { searchParamsToQueryString } from "@/lib/admin-queries";
import { countSubmissions, listSubmissions } from "@/lib/submissions";

export const dynamic = "force-dynamic";

function normalizeParams(searchParams = {}) {
  return {
    q: String(searchParams.q || ""),
    country: String(searchParams.country || ""),
    language: String(searchParams.language || ""),
    adminLang: String(searchParams.adminLang || "en"),
    dateFrom: String(searchParams.dateFrom || ""),
    dateTo: String(searchParams.dateTo || "")
  };
}

function formatDate(date, locale = "en") {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(date);
}

function languageName(code) {
  return languages.find((language) => language.code === code)?.name || code;
}

function normalizeAdminLanguage(code) {
  return code === "ar" ? "ar" : "en";
}

function storyExcerpt(value) {
  const normalized = String(value || "").replace(/\s+/g, " ").trim();
  if (!normalized) return "";
  return normalized.length > 72 ? `${normalized.slice(0, 72)}...` : normalized;
}

export default async function AdminDashboardPage({ searchParams }) {
  await requireAdmin();

  const params = normalizeParams(await searchParams);
  const adminCode = normalizeAdminLanguage(params.adminLang);
  const queryString = searchParamsToQueryString({ ...params, adminLang: adminCode });
  const adminLanguage = getLanguage(adminCode);
  const admin = getAdminCopy(adminLanguage.code);

  const [submissions, totalCount, filteredCount] = await Promise.all([
    listSubmissions(params, 200),
    countSubmissions(),
    countSubmissions(params)
  ]);

  return (
    <main className="admin-shell" dir={adminLanguage.dir}>
      <header className="admin-topbar">
        <div className="brand-lockup admin-brand">
          <BrandMark />
          <span>
            <small>{admin.protectedDashboard}</small>
            <strong>{admin.submissions}</strong>
          </span>
        </div>

        <div className="admin-topbar-actions">
          <AdminLanguageSwitch value={adminCode} label={admin.adminLanguage} />
          <form action="/api/admin/logout" method="post">
            <button className="secondary-button compact-button" type="submit">
              <LogOut size={16} />
              {admin.logout}
            </button>
          </form>
        </div>
      </header>

      <section className="admin-metrics">
        <div>
          <span>{admin.totalSubmissions}</span>
          <strong>{totalCount}</strong>
        </div>
        <div>
          <span>{admin.filteredResults}</span>
          <strong>{filteredCount}</strong>
        </div>
        <div>
          <span>{admin.security}</span>
          <strong>
            <ShieldCheck size={20} />
            {admin.protected}
          </strong>
        </div>
      </section>

      <section className="admin-panel">
        <form className="admin-filters" method="get">
          <label className="admin-filter-search">
            <span>{admin.search}</span>
            <div className="admin-input-icon">
              <Search size={16} />
              <input name="q" defaultValue={params.q} placeholder={admin.searchPlaceholder} />
            </div>
          </label>
          <label className="admin-filter-country">
            <span>{admin.country}</span>
            <input name="country" defaultValue={params.country} />
          </label>
          <label className="admin-filter-submission-language">
            <span>{admin.submissionLanguage}</span>
            <select name="language" defaultValue={params.language}>
              <option value="">{admin.allLanguages}</option>
              {languages.map((language) => (
                <option key={language.code} value={language.code}>
                  {language.name} ({language.code.toUpperCase()})
                </option>
              ))}
            </select>
          </label>
          <input type="hidden" name="adminLang" value={adminCode} />
          <label className="admin-filter-from">
            <span>{admin.from}</span>
            <input name="dateFrom" type="date" defaultValue={params.dateFrom} />
          </label>
          <label className="admin-filter-to">
            <span>{admin.to}</span>
            <input name="dateTo" type="date" defaultValue={params.dateTo} />
          </label>
          <div className="filter-actions">
            <button className="primary-button compact-button" type="submit">
              <Search size={16} />
              {admin.filter}
            </button>
            <Link className="secondary-button compact-button" href="/admin">
              {admin.clear}
            </Link>
            <a className="secondary-button compact-button" href={`/api/admin/export${queryString ? `?${queryString}` : ""}`}>
              <Download size={16} />
              {admin.csv}
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
              <th>{admin.phone}</th>
              <th>{admin.email}</th>
              <th>{admin.country}</th>
              <th>{admin.countryCode}</th>
              <th>{admin.language}</th>
              <th>{admin.story}</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {submissions.map((submission) => (
              <tr key={submission.id}>
                <td data-label={admin.date}>{formatDate(submission.createdAt, adminLanguage.code)}</td>
                <td data-label={admin.name}>{submission.fullName}</td>
                <td data-label={admin.phone} dir="ltr">{submission.phoneNumber}</td>
                <td data-label={admin.email} dir="ltr">{submission.email}</td>
                <td data-label={admin.country}>{submission.country}</td>
                <td data-label={admin.countryCode}>{submission.countryCode || "-"}</td>
                <td data-label={admin.language}>{languageName(submission.selectedLanguage)}</td>
                <td data-label={admin.story}>
                  <span className="story-excerpt">{storyExcerpt(submission.storyText) || admin.imagesOnly}</span>
                </td>
                <td>
                  <Link className="table-action" href={`/admin/submissions/${submission.id}?adminLang=${adminLanguage.code}`} aria-label={admin.viewSubmission}>
                    <Eye size={17} />
                    <span>{admin.viewSubmission}</span>
                  </Link>
                </td>
              </tr>
            ))}
            {!submissions.length && (
              <tr>
                <td colSpan={9} className="empty-table">
                  {admin.noSubmissions}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </main>
  );
}
