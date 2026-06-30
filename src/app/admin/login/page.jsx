import { LockKeyhole } from "lucide-react";
import { redirect } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { isAdminAuthenticated } from "@/lib/auth";
import { getAdminCopy, getLanguage } from "@/lib/i18n";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage({ searchParams }) {
  if (await isAdminAuthenticated()) {
    redirect("/admin");
  }

  const params = await searchParams;
  const adminCode = params?.adminLang === "ar" ? "ar" : "en";
  const adminLanguage = getLanguage(adminCode);
  const admin = getAdminCopy(adminCode);
  const hasError = params?.error === "invalid";

  return (
    <main className="admin-shell login-shell" dir={adminLanguage.dir}>
      <section className="admin-login-panel">
        <div className="brand-lockup admin-brand">
          <BrandMark />
          <span>
            <small>{admin.protectedDashboard}</small>
            <strong>كتاب من قارئ إلى كاتب</strong>
          </span>
        </div>

        <div className="admin-login-language">
          <a href="/admin/login?adminLang=en" aria-current={adminCode === "en" ? "page" : undefined}>
            English
          </a>
          <a href="/admin/login?adminLang=ar" aria-current={adminCode === "ar" ? "page" : undefined}>
            العربية
          </a>
        </div>

        <form className="admin-login-form" action="/api/admin/login" method="post">
          <input type="hidden" name="adminLang" value={adminCode} />
          <label className="field">
            <span>{admin.username}</span>
            <input name="username" autoComplete="username" required />
          </label>
          <label className="field">
            <span>{admin.password}</span>
            <input name="password" type="password" autoComplete="current-password" required />
          </label>

          {hasError && <p className="server-message">{admin.invalidLogin}</p>}

          <button className="primary-button" type="submit">
            <LockKeyhole size={18} />
            {admin.signIn}
          </button>
        </form>
      </section>
    </main>
  );
}
