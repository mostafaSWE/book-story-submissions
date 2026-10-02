// Deploy guard. OpenNext embeds values from .env files (.env, .env.production, .env.local, ...) into the
// Worker as fallbacks. This site's configuration must come only from the Worker's secrets in Cloudflare,
// so abort the deploy if anything was embedded. Build from a clean checkout (or Workers Builds) instead.
import { pathToFileURL } from "node:url";
import path from "node:path";
import fs from "node:fs";

const file = path.resolve(".open-next/cloudflare/next-env.mjs");
if (!fs.existsSync(file)) {
  console.error("check-bundle-env: run `opennextjs-cloudflare build` first.");
  process.exit(1);
}
const env = await import(pathToFileURL(file).href);
const embedded = Object.keys(env.production || {});
if (embedded.length) {
  console.error(`check-bundle-env: refusing to deploy — values from .env files were embedded in the Worker: ${embedded.join(", ")}`);
  console.error("Deploy from a clean checkout (no .env files), e.g. a fresh `git clone`, or let Workers Builds deploy.");
  process.exit(1);
}
console.log("check-bundle-env: no .env values embedded — OK to deploy.");
