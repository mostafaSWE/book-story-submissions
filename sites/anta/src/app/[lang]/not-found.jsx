import { Nib } from "@/components/Icons";
import ar from "@messages/ar.json";
import en from "@messages/en.json";

// Server-rendered and bilingual (not-found pages don't receive the route's params).
export default function NotFound() {
  return (
    <main id="main" className="thanks" style={{ paddingBlockStart: "12vh" }}>
      <Nib className="nib nib-large" />
      <h1 className="thanks-title" lang="ar" dir="rtl">{ar.notFoundTitle}</h1>
      <p className="thanks-body" lang="ar" dir="rtl">{ar.notFoundBody}</p>
      <p className="thanks-body" lang="en" dir="ltr" style={{ marginBlockStart: 0 }}>{en.notFoundTitle}. {en.notFoundBody}</p>
      <div className="thanks-actions">
        <a className="button button-primary" href="/ar" lang="ar">{ar.home}</a>
        <a className="text-link" href="/en" lang="en">{en.home}</a>
      </div>
    </main>
  );
}
