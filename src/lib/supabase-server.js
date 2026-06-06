import { createClient } from "@supabase/supabase-js";

let cachedClient;

function requiredEnv(name, fallbackName) {
  const value = process.env[name] || (fallbackName ? process.env[fallbackName] : "");
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

export function getSupabaseAdminClient() {
  if (cachedClient) return cachedClient;

  const supabaseUrl = requiredEnv("PUBLIC_SUPABASE_URL", "SUPABASE_URL");
  const serviceRoleKey = requiredEnv("SUPABASE_SERVICE_ROLE_KEY");

  cachedClient = createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return cachedClient;
}
