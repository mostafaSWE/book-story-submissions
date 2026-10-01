import { defineConfig } from "@playwright/test";

// BASE_URL: the repo-root app (local `next start -p 3200`, or https://readertowriter.net for read-only checks).
// ADMIN_SUITE=local runs the admin tests (needs the local test DB + .env.local admin); public smoke tests are read-only.
export default defineConfig({
  testDir: ".",
  testMatch: /.*\.spec\.mjs/,
  timeout: 60_000,
  workers: 1,
  reporter: [["list"]],
  use: { baseURL: process.env.BASE_URL || "http://localhost:3200" /* the login route redirects to the host it sees */, channel: "msedge" },
  projects: [
    { name: "desktop-1440", use: { viewport: { width: 1440, height: 900 } } },
    { name: "mobile-390", use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true } }
  ]
});
