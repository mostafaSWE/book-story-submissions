import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { initOpenNextCloudflareForDev } from "@opennextjs/cloudflare";

const DEFAULT_LOCALE = "ar";
const locales = fs.readdirSync(new URL("./messages", import.meta.url)).filter((f) => /^[a-z]{2}\.json$/.test(f)).map((f) => f.slice(0, 2));

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // This app is self-contained in sites/anta (own lockfile and node_modules).
  outputFileTracingRoot: fileURLToPath(new URL(".", import.meta.url)),
  turbopack: { root: fileURLToPath(new URL(".", import.meta.url)) },
  poweredByHeader: false,
  async redirects() {
    // "/" → the language the visitor chose before (cookie), otherwise Arabic.
    return [
      ...locales
        .filter((l) => l !== DEFAULT_LOCALE)
        .map((l) => ({ source: "/", has: [{ type: "cookie", key: "anta_lang", value: l }], destination: `/${l}`, permanent: false })),
      { source: "/", destination: `/${DEFAULT_LOCALE}`, permanent: false }
    ];
  },
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), interest-cohort=()" }
        ]
      },
      { source: "/fonts/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=31536000, immutable" }] },
      { source: "/og/:path*", headers: [{ key: "Cache-Control", value: "public, max-age=86400" }] }
    ];
  }
};

export default nextConfig;

// Gives `next dev` access to Cloudflare bindings (rate limiter) from wrangler.jsonc.
initOpenNextCloudflareForDev();
