import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/** Cloudflare request context ({ env, cf }) on Workers; an empty object under plain `next start`. */
export function cloudflare() {
  try {
    return getCloudflareContext() || {};
  } catch {
    return {};
  }
}
