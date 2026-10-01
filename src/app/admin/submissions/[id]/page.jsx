import { permanentRedirect } from "next/navigation";

// Old bookmark → «كتاب من قارئ إلى كاتب» entry at its new path (the new page checks the admin session).
export default async function LegacySubmissionDetail({ params, searchParams }) {
  const { id } = await params;
  const query = new URLSearchParams(Object.entries((await searchParams) || {}).filter(([, v]) => typeof v === "string")).toString();
  permanentRedirect(`/admin/reader-to-writer/submissions/${encodeURIComponent(id)}${query ? `?${query}` : ""}`);
}
