import { expect } from "@playwright/test";

export const AR_INDIC_PHONE = "٠٥٠١٢٣٤٥٦٧"; // Arabic-Indic digits
export const uid = () => `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;
export const testEmail = (tag) => `test+${tag}-${uid()}@example.com`; // every e2e row is marked: @example.com + "TEST" name

/** Reads rows from the LOCAL test database (never production). Skipped unless E2E_DB=local. */
export async function localRows(email) {
  if (process.env.E2E_DB !== "local") return null;
  const { localKey } = await import("../db/rest-proxy.mjs");
  const key = localKey("service_role");
  const url = `http://127.0.0.1:18321/rest/v1/anta_contributions?email=eq.${encodeURIComponent(email)}&select=*`;
  const res = await fetch(url, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  expect(res.ok).toBeTruthy();
  return res.json();
}

export async function fillForm(page, v) {
  if (v.title !== undefined) await page.fill("#f-title", v.title);
  if (v.body !== undefined) await page.fill("#f-body", v.body);
  if (v.name !== undefined) await page.fill("#f-name", v.name);
  if (v.email !== undefined) await page.fill("#f-email", v.email);
  // Pick the phone country like a user would; local runs report a mock visitor country ("US").
  const region = v.region || (v.phone !== undefined ? "AE" : null);
  if (region) await page.selectOption("#f-country", region);
  if (v.phone !== undefined) await page.fill("#f-phone", v.phone);
  if (v.consent) await page.locator(".check").click();
}

/** Waits until the form is hydrated (client validation active), so the test exercises the real flow. */
export async function openForm(page, lang = "ar", { ip } = {}) {
  // Each test is its own "visitor" for the per-IP limit. (On Cloudflare, cf-connecting-ip wins over this header.)
  await page.setExtraHTTPHeaders({ "x-forwarded-for": ip || `198.51.100.${Math.floor(Math.random() * 250) + 1}` });
  await page.goto(`/${lang}/write`);
  await page.evaluate(() => sessionStorage.clear());
  await page.reload();
  await page.waitForFunction(() => document.querySelector('input[name="startedAt"]')?.value);
}

/**
 * Waits before a submission: a human can't fill the form in < 2.5 s, so neither may the test.
 * E2E_PACE_MS (for runs against a deployed site, where the real per-IP limits apply to the one machine
 * running the tests) spaces submissions out, e.g. 13000 → under 5 a minute.
 */
export const PACED = Number(process.env.E2E_PACE_MS) > 0;
export function beforeSubmit(page, min = 2600) {
  return page.waitForTimeout(Math.max(min, Number(process.env.E2E_PACE_MS) || 0));
}

export async function submitAndWaitForThanks(page) {
  await beforeSubmit(page);
  await page.click("button.submit");
  await expect(page.locator("#thanks-heading")).toBeVisible({ timeout: 15_000 });
}
