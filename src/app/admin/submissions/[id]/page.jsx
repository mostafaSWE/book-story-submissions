import Link from "next/link";
import { ArrowLeft, Check, FileImage, Mail, Phone } from "lucide-react";
import { notFound } from "next/navigation";
import BrandMark from "@/components/BrandMark";
import { requireAdmin } from "@/lib/auth";
import { getAdminCopy, getLanguage, languages } from "@/lib/i18n";
import { adminFileUrl, parseFileMeta, parseFileMetaList } from "@/lib/uploads";
import { getSubmissionById } from "@/lib/submissions";

export const dynamic = "force-dynamic";

function formatDate(date, locale = "en") {
  return new Intl.DateTimeFormat(locale, {
    dateStyle: "full",
    timeStyle: "short"
  }).format(date);
}

function languageName(code) {
  return languages.find((language) => language.code === code)?.name || code;
}

function normalizeAdminLanguage(code) {
  return code === "ar" ? "ar" : "en";
}

export default async function SubmissionDetailPage({ params, searchParams }) {
  await requireAdmin();
  const routeParams = await params;
  const query = await searchParams;
  const adminCode = normalizeAdminLanguage(query?.adminLang || "en");
  const adminLanguage = getLanguage(adminCode);
  const admin = getAdminCopy(adminLanguage.code);
  const id = Number(routeParams.id);

  if (!Number.isInteger(id)) notFound();

  const submission = await getSubmissionById(id);
  if (!submission) notFound();

  const receipt = parseFileMeta(submission.receiptImage);
  const storyImages = parseFileMetaList(submission.storyImages);

  return (
    <main className="admin-shell detail-shell" dir={adminLanguage.dir}>
      <div className="detail-back-row">
        <Link className="secondary-button compact-button" href={`/admin?adminLang=${adminLanguage.code}`}>
          <ArrowLeft size={16} />
          {admin.back}
        </Link>
      </div>
      <header className="admin-topbar">
        <div className="brand-lockup admin-brand">
          <BrandMark />
          <span>
            <small>{admin.submissions} #{submission.id}</small>
            <strong>{submission.fullName}</strong>
          </span>
        </div>
      </header>

      <section className="detail-grid">
        <div className="detail-panel">
          <h2>{admin.readerInformation}</h2>
          <dl className="detail-list">
            <div>
              <dt>{admin.name}</dt>
              <dd>{submission.fullName}</dd>
            </div>
            <div>
              <dt>{admin.phone}</dt>
              <dd dir="ltr">
                <Phone size={15} />
                {submission.phoneNumber}
              </dd>
            </div>
            <div>
              <dt>{admin.email}</dt>
              <dd dir="ltr">
                <Mail size={15} />
                {submission.email}
              </dd>
            </div>
            <div>
              <dt>{admin.country}</dt>
              <dd>{submission.country}</dd>
            </div>
            <div>
              <dt>{admin.countryCode}</dt>
              <dd>{submission.countryCode || "-"}</dd>
            </div>
            <div>
              <dt>{admin.language}</dt>
              <dd>{languageName(submission.selectedLanguage)}</dd>
            </div>
            <div>
              <dt>{admin.submitted}</dt>
              <dd>{formatDate(submission.createdAt, adminLanguage.code)}</dd>
            </div>
            <div>
              <dt>{admin.termsAccepted}</dt>
              <dd>
                {submission.acceptedTerms ? (
                  <>
                    <Check size={15} />
                    {admin.accepted}
                    {submission.acceptedTermsAt
                      ? ` — ${formatDate(submission.acceptedTermsAt, adminLanguage.code)}`
                      : ""}
                  </>
                ) : (
                  admin.notRecorded
                )}
              </dd>
            </div>
          </dl>
        </div>

        <div className="detail-panel">
          <h2>{admin.receipt}</h2>
          {receipt ? (
            <a className="admin-image-link" href={adminFileUrl(receipt)} target="_blank">
              <img src={adminFileUrl(receipt)} alt={receipt.originalName || "Receipt"} />
              <span>
                <FileImage size={16} />
                {receipt.originalName}
              </span>
            </a>
          ) : (
            <p>{admin.noReceipt}</p>
          )}
        </div>
      </section>

      <section className="detail-panel story-panel">
        <h2>{admin.story}</h2>
        <p className="story-copy">{submission.storyText || admin.noWrittenStory}</p>
      </section>

      <section className="detail-panel story-panel">
        <h2>{admin.storyImages}</h2>
        {storyImages.length ? (
          <div className="admin-image-grid">
            {storyImages.map((image) => (
              <a className="admin-image-link" href={adminFileUrl(image)} target="_blank" key={image.storedName}>
                <img src={adminFileUrl(image)} alt={image.originalName || "Story image"} />
                <span>
                  <FileImage size={16} />
                  {image.originalName}
                </span>
              </a>
            ))}
          </div>
        ) : (
          <p>{admin.noStoryImages}</p>
        )}
      </section>
    </main>
  );
}
