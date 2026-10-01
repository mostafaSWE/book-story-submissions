// Book module: «أنت الكاتب» (anta.readertowriter.net) — table public.anta_contributions.
// Queries only its own table. Never imports another book's module.
import { getSupabaseAdminClient } from "@/lib/supabase-server";

export const STATUSES = ["new", "shortlisted", "selected"];

export const book = {
  slug: "anta",
  title: "أنت الكاتب",
  domain: "anta.readertowriter.net",
  table: "anta_contributions",
  accent: "parchment",
  listPath: "/admin/anta",
  exportPath: "/api/admin/anta/export",
  detailPath: (id) => `/admin/anta/entries/${id}`,
  statuses: STATUSES
};

const LIST_COLUMNS = "id, public_ref, created_at, full_name, email, phone_e164, ui_language, status, title, body";
const DETAIL_COLUMNS =
  "id, public_ref, created_at, updated_at, ui_language, full_name, email, phone_e164, phone_region, title, body, consent_publish, consent_version, status, status_changed_at, admin_note, request_country";

const db = () => getSupabaseAdminClient().from(book.table);
const toDate = (v) => (v ? new Date(v) : null);

function mapRow(r) {
  if (!r) return null;
  return {
    id: r.id,
    ref: r.public_ref,
    createdAt: toDate(r.created_at),
    updatedAt: toDate(r.updated_at),
    language: r.ui_language,
    name: r.full_name,
    email: r.email,
    phone: r.phone_e164,
    phoneRegion: r.phone_region,
    title: r.title || "",
    body: r.body || "",
    consent: r.consent_publish === true,
    consentVersion: r.consent_version,
    status: r.status,
    statusChangedAt: toDate(r.status_changed_at),
    note: r.admin_note || "",
    requestCountry: r.request_country
  };
}

/** Search text is reduced to safe characters before it goes into a PostgREST filter string. */
function safeTerm(value) {
  return String(value || "")
    .replace(/[,()"\\%*:]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 100);
}

export function normalizeFilters(params = {}) {
  const date = (v) => (/^\d{4}-\d{2}-\d{2}$/.test(String(v || "")) ? String(v) : "");
  return {
    q: safeTerm(params.q),
    status: STATUSES.includes(params.status) ? params.status : "",
    language: /^[a-z]{2}$/.test(String(params.language || "")) ? params.language : "",
    dateFrom: date(params.dateFrom),
    dateTo: date(params.dateTo)
  };
}

function applyFilters(query, f) {
  let q = query;
  if (f.q) {
    const like = `*${f.q}*`;
    q = q.or(["full_name", "email", "phone_e164", "title", "body"].map((c) => `${c}.ilike.${like}`).join(","));
  }
  if (f.status) q = q.eq("status", f.status);
  if (f.language) q = q.eq("ui_language", f.language);
  if (f.dateFrom) q = q.gte("created_at", `${f.dateFrom}T00:00:00.000Z`);
  if (f.dateTo) q = q.lte("created_at", `${f.dateTo}T23:59:59.999Z`);
  return q;
}

function check({ data, error, count }) {
  if (error) throw error;
  return { data, count };
}

export async function list(params = {}, limit) {
  let q = applyFilters(db().select(LIST_COLUMNS), normalizeFilters(params)).order("created_at", { ascending: false });
  if (limit) q = q.limit(limit);
  return (check(await q).data || []).map(mapRow);
}

export async function listForExport(params = {}) {
  const q = applyFilters(db().select(DETAIL_COLUMNS), normalizeFilters(params)).order("created_at", { ascending: false });
  return (check(await q).data || []).map(mapRow);
}

export async function count(params = {}) {
  return check(await applyFilters(db().select("id", { count: "exact", head: true }), normalizeFilters(params))).count || 0;
}

export async function get(id) {
  return mapRow(check(await db().select(DETAIL_COLUMNS).eq("id", id).maybeSingle()).data);
}

export async function setStatus(id, status) {
  if (!STATUSES.includes(status)) throw new Error(`Unknown status: ${status}`);
  check(await db().update({ status }).eq("id", id));
}

export async function setNote(id, note) {
  const text = String(note ?? "").replace(/\r\n?/g, "\n").slice(0, 4000);
  check(await db().update({ admin_note: text.trim() ? text : null }).eq("id", id));
}

/** Overview numbers: total, last 7 days, per status, latest entries. Reads anta_contributions only. */
export async function summary({ latest = 5 } = {}) {
  const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();
  const head = () => db().select("id", { count: "exact", head: true });
  const [total, week, rows, ...perStatus] = await Promise.all([
    head(),
    head().gte("created_at", since),
    db().select("id, full_name, title, body, ui_language, status, created_at").order("created_at", { ascending: false }).limit(latest),
    ...STATUSES.map((s) => head().eq("status", s))
  ]);
  for (const r of [total, week, rows, ...perStatus]) if (r.error) throw r.error;
  return {
    total: total.count || 0,
    lastWeek: week.count || 0,
    byStatus: Object.fromEntries(STATUSES.map((s, i) => [s, perStatus[i].count || 0])),
    latest: (rows.data || []).map((r) => ({
      id: r.id,
      name: r.full_name,
      excerpt: r.title ? `${r.title} — ${r.body}` : r.body,
      language: r.ui_language,
      status: r.status,
      createdAt: new Date(r.created_at),
      href: book.detailPath(r.id)
    }))
  };
}

export const csvColumns = [
  { key: "ref", label: "reference" },
  { key: "created_at", label: "created_at" },
  { key: "status", label: "status" },
  { key: "status_changed_at", label: "status_changed_at" },
  { key: "language", label: "ui_language" },
  { key: "name", label: "full_name" },
  { key: "email", label: "email" },
  { key: "phone", label: "phone_e164", kind: "phone" },
  { key: "phoneRegion", label: "phone_region" },
  { key: "title", label: "title" },
  { key: "body", label: "body" },
  { key: "consent", label: "consent_publish" },
  { key: "consentVersion", label: "consent_version" },
  { key: "note", label: "admin_note" },
  { key: "requestCountry", label: "request_country" },
  { key: "id", label: "id" }
];

export function csvRow(e) {
  return {
    ...e,
    created_at: e.createdAt?.toISOString() || "",
    status_changed_at: e.statusChangedAt?.toISOString() || "",
    consent: e.consent ? "true" : "false"
  };
}
