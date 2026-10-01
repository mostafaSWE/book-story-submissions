import { defineConfig } from "@playwright/test";

// BASE_URL: http://127.0.0.1:3100 (next start), http://127.0.0.1:8788 (Cloudflare preview), or a workers.dev URL.
// E2E_DB=local lets tests read rows from the local test database to prove what was stored.
export default defineConfig({
  testDir: "tests/e2e",
  timeout: 60_000,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: process.env.BASE_URL || "http://127.0.0.1:3100", channel: "msedge", trace: "off" },
  projects: [
    { name: "mobile-390", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true, deviceScaleFactor: 2 } },
    { name: "desktop-1440", use: { viewport: { width: 1440, height: 900 } } }
  ]
});
