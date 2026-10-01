import { LogOut } from "lucide-react";
import AdminLanguageSwitch from "@/components/AdminLanguageSwitch";
import BrandMark from "@/components/BrandMark";
import { getBooksCopy } from "@/admin/copy";

export function adminLanguageFrom(searchParams) {
  return searchParams?.adminLang === "ar" ? "ar" : "en";
}

/** The admin's existing top bar (brand, admin language, logout); `heading` says where you are. */
export function AdminTopbar({ admin, adminCode, heading }) {
  return (
    <header className="admin-topbar">
      <div className="brand-lockup admin-brand">
        <BrandMark />
        <span>
          <small>{admin.protectedDashboard}</small>
          <strong>{heading}</strong>
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
  );
}

/** Book marks: gold book for «كتاب من قارئ إلى كاتب», ink nib on parchment for «أنت الكاتب». */
export function BookMark({ accent }) {
  if (accent === "parchment") {
    return (
      <span className="ab-book-mark" aria-hidden="true">
        <svg viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 1.5 18.5 10 12 22.5 5.5 10Z" />
          <circle cx="12" cy="10.6" r="1.7" fill="#0b1f2f" />
          <path d="M12 12.4v10" stroke="#0b1f2f" strokeWidth="1.3" />
        </svg>
      </span>
    );
  }
  return (
    <span className="ab-book-mark" aria-hidden="true">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round">
        <path d="M3 5.5c3.4-1.4 6.3-.9 9 1.1 2.7-2 5.6-2.5 9-1.1v13c-3.4-1.4-6.3-.9-9 1.1-2.7-2-5.6-2.5-9-1.1z" />
        <path d="M12 6.6v13.1" />
      </svg>
    </span>
  );
}

/** Shown at the top of every book page so you always know which book's entries you are looking at. */
export function BookBar({ book, adminCode, children }) {
  const c = getBooksCopy(adminCode);
  return (
    <div className="ab-bookbar ab-book" data-accent={book.accent} data-book={book.slug}>
      <a className="ab-crumb" href={`/admin?adminLang=${adminCode}`}>
        {adminCode === "ar" ? "→" : "←"} {c.books}
      </a>
      <BookMark accent={book.accent} />
      <span>
        <span className="ab-book-label">{c.bookLabel} · </span>
        <strong lang="ar">{book.title}</strong>
      </span>
      <p className="ab-book-meta">
        <bdi>{book.domain}</bdi> · {c.table}: <bdi>{book.table}</bdi>
      </p>
      {children}
    </div>
  );
}
