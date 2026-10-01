// Book module: «كتاب من قارئ إلى كاتب» (readertowriter.net) — table public.submissions.
// Wraps the existing query code in src/lib (shared with the public site, unchanged).
// Never imports another book's module.
import { getSupabaseAdminClient } from "@/lib/supabase-server";
import { countSubmissions, getSubmissionById, listSubmissions } from "@/lib/submissions";
import { parseFileMeta, parseFileMetaList } from "@/lib/uploads";

export const book = {
  slug: "reader-to-writer",
  title: "كتاب من قارئ إلى كاتب",
  domain: "readertowriter.net",
  table: "submissions",
  accent: "gold",
  listPath: "/admin/reader-to-writer",
  exportPath: "/api/admin/reader-to-writer/export",
  detailPath: (id) => `/admin/reader-to-writer/submissions/${id}`
};

export const list = listSubmissions;
export const count = countSubmissions;
export const get = getSubmissionById;

/** Overview numbers: total, last 7 days, latest entries. Reads public.submissions only. */
export async function summary({ latest = 5 } = {}) {
  const supabase = getSupabaseAdminClient();
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const [total, week, rows] = await Promise.all([
    supabase.from(book.table).select("id", { count: "exact", head: true }),
    supabase.from(book.table).select("id", { count: "exact", head: true }).gte("created_at", since),
    supabase.from(book.table).select("id, full_name, story_text, selected_language, created_at").order("created_at", { ascending: false }).limit(latest)
  ]);
  for (const r of [total, week, rows]) if (r.error) throw r.error;
  return {
    total: total.count || 0,
    lastWeek: week.count || 0,
    byStatus: null, // this book has no curation status
    latest: (rows.data || []).map((r) => ({
      id: r.id,
      name: r.full_name,
      excerpt: r.story_text || "",
      language: r.selected_language,
      createdAt: new Date(r.created_at),
      href: book.detailPath(r.id)
    }))
  };
}

/** CSV columns: identical to the export the admin had before (same names, same order). */
export const csvColumns = [
  { key: "id", label: "id" },
  { key: "selected_language", label: "selected_language" },
  { key: "full_name", label: "full_name" },
  { key: "phone_number", label: "phone_number", kind: "phone" },
  { key: "email", label: "email" },
  { key: "country", label: "country" },
  { key: "country_code", label: "country_code" },
  { key: "receipt_image", label: "receipt_image" },
  { key: "story_text", label: "story_text" },
  { key: "story_images", label: "story_images" },
  { key: "accepted_terms", label: "accepted_terms" },
  { key: "accepted_terms_at", label: "accepted_terms_at" },
  { key: "created_at", label: "created_at" },
  { key: "updated_at", label: "updated_at" }
];

export function csvRow(s) {
  const receipt = parseFileMeta(s.receiptImage);
  const storyImages = parseFileMetaList(s.storyImages);
  return {
    id: s.id,
    selected_language: s.selectedLanguage,
    full_name: s.fullName,
    phone_number: s.phoneNumber,
    email: s.email,
    country: s.country,
    country_code: s.countryCode,
    receipt_image: receipt?.originalName || "",
    story_text: s.storyText || "",
    story_images: storyImages.map((image) => image.originalName).join("; "),
    accepted_terms: s.acceptedTerms ? "true" : "false",
    accepted_terms_at: s.acceptedTermsAt ? s.acceptedTermsAt.toISOString() : "",
    created_at: s.createdAt.toISOString(),
    updated_at: s.updatedAt.toISOString()
  };
}
