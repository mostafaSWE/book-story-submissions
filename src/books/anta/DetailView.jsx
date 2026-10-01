// «أنت الكاتب» — one entry: the text exactly as typed, contributor details, status and private note.
import Link from "next/link";
import { ArrowLeft, Check, Mail, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import { AdminTopbar, BookBar } from "@/admin/AdminChrome";
import { fill, getBooksCopy } from "@/admin/copy";
import { getAdminCopy, getLanguage } from "@/lib/i18n";
import { STATUSES, book, get } from "./index";

function formatDate(date, locale) {
  return date ? new Intl.DateTimeFormat(locale, { dateStyle: "full", timeStyle: "short" }).format(date) : "—";
}

function regionName(code, locale) {
  if (!code) return "—";
  try { return new Intl.DisplayNames([locale], { type: "region" }).of(code) || code; } catch { return code; }
}

function languageName(code, locale) {
  try { return new Intl.DisplayNames([locale], { type: "language" }).of(code) || code; } catch { return code; }
}

export default async function AntaDetail({ params, searchParams }) {
  const adminCode = searchParams?.adminLang === "ar" ? "ar" : "en";
  const lang = getLanguage(adminCode);
  const admin = getAdminCopy(adminCode);
  const c = getBooksCopy(adminCode);
  const id = Number(params.id);
  if (!Number.isInteger(id) || id < 1) notFound();
  const e = await get(id);
  if (!e) notFound();

  const back = new URLSearchParams(Object.entries(searchParams || {}).filter(([k, v]) => k !== "saved" && typeof v === "string")).toString();
  const action = `/api/admin/anta/entries/${e.id}?adminLang=${adminCode}`;

  return (
    <main className="admin-shell detail-shell ab-book" dir={lang.dir} data-accent={book.accent} data-book={book.slug}>
      <AdminTopbar admin={admin} adminCode={adminCode} heading={e.name} />
      <BookBar book={book} adminCode={adminCode} />
      <div className="detail-back-row" style={{ maxWidth: 1240, width: "100%", margin: "0 auto" }}>
        <Link className="secondary-button compact-button" href={`${book.listPath}?${back}`}>
          <ArrowLeft size={16} />
          {c.backToList}
        </Link>
      </div>

      {searchParams?.saved === "1" && <p className="ab-saved" role="status" style={{ maxWidth: 1240, width: "100%", margin: "0 auto" }}>{c.saved}</p>}

      <section className="detail-grid">
        <div className="detail-panel">
          <h2>{c.contribution}</h2>
          <p className="ab-text-title" dir="auto" lang={e.language}>{e.title || <span className="ab-hint">{c.noTitle}</span>}</p>
          <p className="ab-text" dir="auto" lang={e.language}>{e.body}</p>
        </div>

        <div className="detail-panel">
          <h2>{c.contributor}</h2>
          <dl className="detail-list">
            <div><dt>{admin.name}</dt><dd><bdi>{e.name}</bdi></dd></div>
            <div><dt>{admin.email}</dt><dd dir="ltr"><Mail size={15} /><a href={`mailto:${e.email}`}>{e.email}</a></dd></div>
            <div><dt>{admin.phone}</dt><dd dir="ltr"><Phone size={15} /><a href={`tel:${e.phone}`}>{e.phone}</a></dd></div>
            <div><dt>{admin.language}</dt><dd>{languageName(e.language, adminCode)}</dd></div>
            <div><dt>{admin.submitted}</dt><dd>{formatDate(e.createdAt, lang.code)}</dd></div>
            <div><dt>{c.sentFrom}</dt><dd>{regionName(e.requestCountry, adminCode)}</dd></div>
            <div><dt>{c.consent}</dt><dd>{e.consent ? <><Check size={15} />{fill(c.consentGiven, { version: e.consentVersion })}</> : c.consentMissing}</dd></div>
            <div><dt>{c.reference}</dt><dd className="ab-ltr" style={{ fontSize: "0.8rem" }}>{e.ref}</dd></div>
          </dl>
        </div>
      </section>

      <section className="detail-panel story-panel">
        <h2>{c.curation}</h2>
        <form method="post" action={action} className="ab-status-buttons" aria-label={c.moveTo}>
          <input type="hidden" name="action" value="status" />
          {STATUSES.map((s) => (
            <button key={s} type="submit" name="status" value={s} className="secondary-button compact-button" aria-pressed={e.status === s}>
              {c.statusNames[s]}
            </button>
          ))}
        </form>
        <p className="ab-hint" style={{ marginTop: 10 }}>
          {c.status}: <span className="ab-status" data-status={e.status}>{c.statusNames[e.status]}</span>
          {e.statusChangedAt ? ` · ${c.statusChanged}: ${formatDate(e.statusChangedAt, lang.code)}` : ""}
        </p>

        <form method="post" action={action} className="ab-note" style={{ marginTop: 18 }}>
          <input type="hidden" name="action" value="note" />
          <label htmlFor="ab-note"><strong>{c.note}</strong></label>
          <textarea id="ab-note" name="note" defaultValue={e.note} maxLength={4000} dir="auto" />
          <p className="ab-hint">{c.noteHint}</p>
          <div><button type="submit" className="primary-button compact-button">{c.saveNote}</button></div>
        </form>
      </section>
    </main>
  );
}
