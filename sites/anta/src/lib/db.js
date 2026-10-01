import "server-only";
import { createClient } from "@supabase/supabase-js";

// Client factory copied from the repo-root site (src/lib/supabase-server.js @ f6ebe99).
// This app only ever touches public.anta_contributions.
export const TABLE = "anta_contributions";

let cachedClient;

function requiredEnv(name) {
  const value = process.env[name];
  if (!value) throw new Error(`Missing required environment variable: ${name}`);
  return value;
}

function client() {
  if (cachedClient) return cachedClient;
  cachedClient = createClient(requiredEnv("PUBLIC_SUPABASE_URL"), requiredEnv("SUPABASE_SERVICE_ROLE_KEY"), {
    auth: { autoRefreshToken: false, persistSession: false }
  });
  return cachedClient;
}

function escapeLike(value) {
  return value.replace(/[\\%_]/g, (c) => `\\${c}`);
}

/** Store adapter used by the submit handler (tests pass an in-memory one instead). */
export const supabaseStore = {
  async countRecentByEmail(email, sinceIso) {
    const { count, error } = await client()
      .from(TABLE)
      .select("id", { count: "exact", head: true })
      .ilike("email", escapeLike(email))
      .gte("created_at", sinceIso);
    if (error) throw error;
    return count || 0;
  },
  async insert(row) {
    const { data, error } = await client().from(TABLE).insert(row).select("public_ref").single();
    if (error) {
      if (error.code === "23505") return { duplicate: true };
      throw error;
    }
    return { ref: data.public_ref };
  }
};
