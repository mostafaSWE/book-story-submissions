// Deploy guard. OpenNext embeds values from .env files (this folder AND the repo root) into the Worker
// as fallbacks. This site's secrets must come only from Cloudflare (`wrangler secret put`), and the
// other site's .env.production must never end up inside this Worker. Abort if anything was embedded.
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
  console.error("Remove .env* files from sites/anta and the repo root (or build from a clean checkout) and build again.");
  process.exit(1);
}
console.log("check-bundle-env: no .env values embedded — OK to deploy.");
