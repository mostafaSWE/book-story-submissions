import { getSupabaseAdminClient } from "@/lib/supabase-server";
import { applySubmissionFilters } from "@/lib/admin-queries";

const submissionColumns = `
  id,
  selected_language,
  full_name,
  phone_number,
  email,
  country,
  country_code,
  receipt_image,
  story_text,
  story_images,
  created_at,
  updated_at
`;

function toDate(value) {
  return value ? new Date(value) : null;
}

export function mapSubmission(row) {
  if (!row) return null;

  return {
    id: row.id,
    selectedLanguage: row.selected_language,
    fullName: row.full_name,
    phoneNumber: row.phone_number,
    email: row.email,
    country: row.country,
    countryCode: row.country_code || "",
    receiptImage: row.receipt_image,
    storyText: row.story_text || "",
    storyImages: row.story_images || [],
    createdAt: toDate(row.created_at),
    updatedAt: toDate(row.updated_at)
  };
}

function handleError(error) {
  if (error) throw error;
}

export async function listSubmissions(filters = {}, limit) {
  const supabase = getSupabaseAdminClient();
  let query = supabase.from("submissions").select(submissionColumns);
  query = applySubmissionFilters(query, filters).order("created_at", { ascending: false });
  if (limit) query = query.limit(limit);

  const { data, error } = await query;
  handleError(error);
  return (data || []).map(mapSubmission);
}

export async function countSubmissions(filters = {}) {
  const supabase = getSupabaseAdminClient();
  let query = supabase.from("submissions").select("id", { count: "exact", head: true });
  query = applySubmissionFilters(query, filters);

  const { count, error } = await query;
  handleError(error);
  return count || 0;
}

export async function getSubmissionById(id) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase.from("submissions").select(submissionColumns).eq("id", id).maybeSingle();
  handleError(error);
  return mapSubmission(data);
}

export async function findDuplicateSubmission({ phoneNumber, email }) {
  const supabase = getSupabaseAdminClient();
  const { data, error } = await supabase
    .from("submissions")
    .select("id")
    .or(`phone_number.eq.${phoneNumber},email.eq.${email}`)
    .limit(1)
    .maybeSingle();

  handleError(error);
  return data;
}

function isMissingConsentColumnError(error) {
  // Postgres 42703 = undefined_column. Lets submissions keep working if the
  // accepted_terms migration has not been applied to the database yet.
  return error?.code === "42703" && /accepted_terms/i.test(error.message || "");
}

export async function createSubmission(values) {
  const supabase = getSupabaseAdminClient();
  const baseRow = {
    selected_language: values.selectedLanguage,
    full_name: values.fullName,
    phone_number: values.phoneNumber,
    email: values.email,
    country: values.country,
    country_code: values.countryCode,
    receipt_image: values.receiptImage,
    story_text: values.storyText || null,
    story_images: values.storyImages || []
  };
  const consentRow = {
    ...baseRow,
    accepted_terms: values.acceptedTerms === true,
    accepted_terms_at: values.acceptedTerms ? new Date().toISOString() : null
  };

  let { data, error } = await supabase.from("submissions").insert(consentRow).select("id").single();

  if (isMissingConsentColumnError(error)) {
    console.warn(
      "submissions.accepted_terms column missing — apply migration 20260630120000_add_terms_consent.sql to persist consent."
    );
    ({ data, error } = await supabase.from("submissions").insert(baseRow).select("id").single());
  }

  if (error) throw error;
  return data;
}

export function isUniqueConstraintError(error) {
  return error?.code === "23505";
}
