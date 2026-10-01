import { defineCloudflareConfig } from "@opennextjs/cloudflare";
import staticAssetsIncrementalCache from "@opennextjs/cloudflare/overrides/incremental-cache/static-assets-incremental-cache";

// The language pages are prerendered at build time and never revalidated, so the static-assets
// incremental cache is enough to serve them (no R2/KV needed).
export default defineCloudflareConfig({ incrementalCache: staticAssetsIncrementalCache });
