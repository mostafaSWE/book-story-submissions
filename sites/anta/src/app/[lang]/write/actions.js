"use server";

import { headers } from "next/headers";
import { supabaseStore } from "@/lib/db";
import { checkRateLimit } from "@/lib/rate-limit";
import { handleSubmission } from "@/lib/submit";
import { cloudflare } from "@/lib/cloudflare";

const FIELDS = ["lang", "title", "body", "name", "email", "phone", "region", "consent", "website", "startedAt"];

/** Server Action behind the form. Works with and without JavaScript (useActionState). */
export async function submitContribution(_previousState, formData) {
  const raw = Object.fromEntries(FIELDS.map((f) => [f, formData.get(f) ?? ""]));
  const h = await headers();
  const cf = cloudflare();
  const ip = h.get("cf-connecting-ip") || h.get("x-forwarded-for")?.split(",")[0]?.trim() || "";

  return handleSubmission(raw, {
    store: supabaseStore,
    ip,
    country: cf.cf?.country || h.get("cf-ipcountry") || "",
    userAgent: h.get("user-agent") || "",
    ipSecret: process.env.IP_HASH_SECRET || "",
    async limitIp(key) {
      const perHour = Number(process.env.SUBMIT_MEMORY_LIMIT_PER_HOUR) || 20; // memory layer (same util as the original)
      if (!checkRateLimit(`anta:${key}`, perHour, 60 * 60 * 1000)) return false;
      if (cf.env?.SUBMIT_LIMITER) {
        const { success } = await cf.env.SUBMIT_LIMITER.limit({ key });
        return success;
      }
      return true;
    }
  });
}
