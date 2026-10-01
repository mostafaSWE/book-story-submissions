// Shared admin (both books). LOCAL ONLY: runs against the local test database seeded by seed-local.sql
// and the throwaway admin in .env.local. Skipped unless ADMIN_SUITE=local.
import crypto from "node:crypto";
import { expect, test } from "@playwright/test";

test.skip(process.env.ADMIN_SUITE !== "local", "admin suite runs against the local test database only");

const USER = process.env.ADMIN_USER;
const PASS = process.env.ADMIN_PASS;
const REST = "http://127.0.0.1:18321/rest/v1";
const ANTA = "أنت الكاتب";
const ORIGINAL = "كتاب من قارئ إلى كاتب";

function localServiceKey() {
  const b64 = (o) => Buffer.from(JSON.stringify(o)).toString("base64url");
  const head = b64({ alg: "HS256", typ: "JWT" });
  const body = b64({ role: "service_role", iss: "anta-local-tests", iat: 1700000000, exp: 4102444800 });
  const sig = crypto.createHmac("sha256", "local-test-jwt-secret-at-least-32-characters-long").update(`${head}.${body}`).digest("base64url");
  return `${head}.${body}.${sig}`;
}
async function rows(table, query = "select=*") {
  const key = localServiceKey();
  const res = await fetch(`${REST}/${table}?${query}`, { headers: { apikey: key, Authorization: `Bearer ${key}` } });
  expect(res.ok).toBeTruthy();
  return res.json();
}
const weekAgo = () => Date.now() - 7 * 24 * 60 * 60 * 1000;

async function login(page, lang = "en") {
  await page.goto(`/admin/login?adminLang=${lang}`);
  await page.fill('input[name="username"]', USER);
  await page.fill('input[name="password"]', PASS);
  await page.click('.admin-login-form button[type="submit"]');
  await expect(page).toHaveURL(/\/admin\?adminLang=/);
}

async function download(page, url) {
  const res = await page.request.get(url);
  expect(res.status()).toBe(200);
  expect(res.headers()["content-type"]).toContain("text/csv");
  return (await res.body()).toString("utf8");
}

test.describe.configure({ mode: "serial" });

test.describe("logged out", () => {
  const blocked = [
    "/admin", "/admin?q=TEST", "/admin/reader-to-writer", "/admin/reader-to-writer/submissions/1",
    "/admin/anta", "/admin/anta/entries/1", "/api/admin/reader-to-writer/export", "/api/admin/anta/export",
    "/api/admin/anta/export?status=selected", "/api/admin/export"
  ];
  for (const url of blocked) {
    test(`blocked: ${url}`, async ({ request }) => {
      const res = await request.get(url, { maxRedirects: 5 });
      expect(res.url()).toContain("/admin/login");
      const text = await res.text();
      expect(text).not.toContain("TEST ");
      expect(text).not.toContain("example.com");
    });
  }
  test("blocked: changing an entry's status", async ({ request }) => {
    const before = (await rows("anta_contributions", "select=id,status&id=eq.1"))[0];
    const res = await request.post("/api/admin/anta/entries/1", { form: { action: "status", status: "selected" }, maxRedirects: 0 });
    expect([303, 307, 308]).toContain(res.status());
    expect(res.headers()["location"]).toContain("/admin/login");
    expect((await rows("anta_contributions", "select=id,status&id=eq.1"))[0].status).toBe(before.status);
  });
  test("blocked: receipt files", async ({ request }) => {
    expect((await request.get("/api/admin/files/receipts/local/r1.jpg")).status()).toBe(401);
  });
});

test.describe("logged in", () => {
  test("wrong password is refused", async ({ page }) => {
    await page.goto("/admin/login?adminLang=en");
    await page.fill('input[name="username"]', USER);
    await page.fill('input[name="password"]', "not-the-password");
    await page.click('.admin-login-form button[type="submit"]');
    await expect(page.locator(".server-message")).toBeVisible();
    await expect(page).toHaveURL(/error=invalid/);
  });

  test("overview: one section per book, counts match each book's own table", async ({ page }) => {
    await login(page);
    const original = await rows("submissions", "select=id,full_name,created_at");
    const anta = await rows("anta_contributions", "select=id,full_name,status,created_at");
    const sections = page.locator("section.ab-card");
    await expect(sections).toHaveCount(2);

    const o = page.locator('section[data-book="reader-to-writer"]');
    const a = page.locator('section[data-book="anta"]');
    await expect(o.locator("h2")).toHaveText(ORIGINAL);
    await expect(a.locator("h2")).toHaveText(ANTA);
    await expect(o.locator('[data-stat="total"]')).toHaveText(String(original.length));
    await expect(o.locator('[data-stat="lastWeek"]')).toHaveText(String(original.filter((r) => Date.parse(r.created_at) >= weekAgo()).length));
    await expect(a.locator('[data-stat="total"]')).toHaveText(String(anta.length));
    await expect(a.locator('[data-stat="lastWeek"]')).toHaveText(String(anta.filter((r) => Date.parse(r.created_at) >= weekAgo()).length));
    for (const s of ["new", "shortlisted", "selected"]) {
      await expect(a.locator(`[data-stat="${s}"]`)).toHaveText(String(anta.filter((r) => r.status === s).length));
    }
    // entries never mix: each section lists only its own book's people
    const oText = await o.locator(".ab-latest").innerText();
    const aText = await a.locator(".ab-latest").innerText();
    for (const r of anta) expect(oText).not.toContain(r.full_name);
    for (const r of original) expect(aText).not.toContain(r.full_name);
    await expect(a.locator(".ab-latest li")).toHaveCount(Math.min(5, anta.length));
    await expect(o.locator(".ab-latest li")).toHaveCount(Math.min(5, original.length));
  });

  test("original book: list, filter, detail with receipt, export exactly as before + Excel-safe", async ({ page }) => {
    await login(page);
    await page.locator('section[data-book="reader-to-writer"] a', { hasText: "All entries" }).click();
    await expect(page).toHaveURL(/\/admin\/reader-to-writer/);
    await expect(page.locator(".ab-bookbar strong")).toHaveText(ORIGINAL);
    await expect(page.locator(".admin-table tbody tr")).toHaveCount(3);
    await page.fill('input[name="q"]', "Second");
    await page.click('.admin-filters button[type="submit"]');
    await expect(page.locator(".admin-table tbody tr")).toHaveCount(1);
    await page.locator(".table-action").first().click();
    await expect(page).toHaveURL(/\/admin\/reader-to-writer\/submissions\/\d+/);
    await expect(page.locator(".detail-panel h2").nth(1)).toHaveText("Receipt");
    await expect(page.locator(".admin-image-link img")).toHaveCount(1);

    const csv = await download(page, "/api/admin/reader-to-writer/export");
    expect(csv.charCodeAt(0)).toBe(0xfeff); // BOM
    const header = csv.slice(1).split("\r\n")[0];
    expect(header).toBe(["id", "selected_language", "full_name", "phone_number", "email", "country", "country_code", "receipt_image", "story_text", "story_images", "accepted_terms", "accepted_terms_at", "created_at", "updated_at"].map((h) => `"${h}"`).join(","));
    expect(csv).toContain('"=""+971 50 111 2222"""'); // phone stays text in Excel, + kept
    expect(csv).toContain('"=""0501112233"""'); // leading zero kept
    expect(csv).toContain(`"'=HYPERLINK(""http://example.com"",""x"")"`); // formula neutralised
    expect(csv).toContain('"قصة قصيرة\nبسطرين"'); // line break kept
    expect(csv).not.toContain("test+a"); // no أنت الكاتب rows
    const filtered = await download(page, "/api/admin/reader-to-writer/export?language=fr");
    expect(filtered.split("\r\n").filter(Boolean)).toHaveLength(2);
  });

  test("أنت الكاتب: list filters, detail as typed, status changes and note", async ({ page }) => {
    await login(page, "ar");
    await page.locator('section[data-book="anta"] a').filter({ hasText: "كل المشاركات" }).click();
    await expect(page).toHaveURL(/\/admin\/anta/);
    await expect(page.locator(".ab-bookbar strong")).toHaveText(ANTA);
    const all = await rows("anta_contributions", "select=id,status,ui_language,full_name");
    await expect(page.locator(".admin-table tbody tr")).toHaveCount(all.length);

    await page.selectOption('select[name="status"]', "selected");
    await page.click('.admin-filters button[type="submit"]');
    await expect(page.locator(".admin-table tbody tr")).toHaveCount(all.filter((r) => r.status === "selected").length);
    await page.goto("/admin/anta?adminLang=ar&language=en");
    await expect(page.locator(".admin-table tbody tr")).toHaveCount(all.filter((r) => r.ui_language === "en").length);
    await page.goto("/admin/anta?adminLang=ar&q=" + encodeURIComponent("مريم"));
    await expect(page.locator(".admin-table tbody tr")).toHaveCount(1);
    await page.goto("/admin/anta?adminLang=ar&q=" + encodeURIComponent("a,b)(or"));
    await expect(page.locator(".admin-table")).toBeVisible(); // filter-string injection attempt is harmless

    const target = (await rows("anta_contributions", "select=*&full_name=eq." + encodeURIComponent("TEST عبدُالله")))[0];
    await page.goto(`/admin/anta/entries/${target.id}?adminLang=ar`);
    await expect(page.locator(".ab-text")).toHaveText(target.body); // full text as typed (newline, emoji)
    await expect(page.locator(".ab-text-title")).toHaveText(target.title);

    for (const status of ["shortlisted", "selected", "new"]) {
      await page.locator(".ab-status-buttons button", { hasText: { new: "جديدة", shortlisted: "في القائمة القصيرة", selected: "مختارة" }[status] }).click();
      await expect(page.locator(".ab-saved")).toBeVisible();
      await expect(page.locator(`.ab-status-buttons button[aria-pressed="true"]`)).toHaveText({ new: "جديدة", shortlisted: "في القائمة القصيرة", selected: "مختارة" }[status]);
      const row = (await rows("anta_contributions", `select=status,status_changed_at&id=eq.${target.id}`))[0];
      expect(row.status).toBe(status);
      expect(row.status_changed_at).toBeTruthy();
    }

    const note = "TEST ملاحظة خاصة\nسطر ثانٍ";
    await page.fill("#ab-note", note);
    await page.locator(".ab-note button[type=submit]").click();
    await expect(page.locator(".ab-saved")).toBeVisible();
    await expect(page.locator("#ab-note")).toHaveValue(note);
    expect((await rows("anta_contributions", `select=admin_note&id=eq.${target.id}`))[0].admin_note).toBe(note);

    // the original book's table is untouched by any of this
    expect((await rows("submissions", "select=id")).length).toBe(3);
  });

  test("أنت الكاتب export: follows filters; Export selected; never the other book", async ({ page }) => {
    await login(page);
    const anta = await rows("anta_contributions", "select=status");
    const all = await download(page, "/api/admin/anta/export");
    expect(all.charCodeAt(0)).toBe(0xfeff);
    expect(all.split("\r\n").filter(Boolean)).toHaveLength(anta.length + 1);
    expect(all).toContain('"=""+971501234567"""');
    expect(all).toContain(`"'-2+3 تبدأ بعلامة ناقص"`);
    expect(all).not.toContain("reader1@example.com");
    const selected = await download(page, "/api/admin/anta/export?status=selected");
    const lines = selected.slice(1).split("\r\n").filter(Boolean);
    expect(lines).toHaveLength(anta.filter((r) => r.status === "selected").length + 1);
    for (const l of lines.slice(1)) expect(l).toContain('"selected"');
  });

  test("old admin URLs redirect to the original book's new paths", async ({ page }) => {
    await login(page);
    await page.goto("/admin/submissions/1?adminLang=en");
    await expect(page).toHaveURL(/\/admin\/reader-to-writer\/submissions\/1\?adminLang=en$/);
    await expect(page.locator(".ab-bookbar strong")).toHaveText(ORIGINAL);
    await page.goto("/admin?q=Second&adminLang=en");
    await expect(page).toHaveURL(/\/admin\/reader-to-writer\?q=Second/);
    await expect(page.locator(".admin-table tbody tr")).toHaveCount(1);
    const csv = await download(page, "/api/admin/export?language=fr");
    expect(csv.split("\r\n").filter(Boolean)).toHaveLength(2);
  });

  test("admin language switch stays on the current page", async ({ page }) => {
    await login(page);
    await page.goto("/admin/anta?adminLang=en&status=new");
    await page.selectOption(".admin-language-switch select", "ar");
    await expect(page).toHaveURL(/\/admin\/anta\?.*adminLang=ar/);
    await expect(page.locator("main")).toHaveAttribute("dir", "rtl");
    await expect(page.locator('select[name="status"]')).toHaveValue("new");
  });

  test("logout blocks everything again", async ({ page }) => {
    await login(page);
    await page.locator('form[action="/api/admin/logout"] button').click();
    await expect(page).toHaveURL(/\/admin\/login/);
    await page.goto("/admin/anta");
    await expect(page).toHaveURL(/\/admin\/login/);
  });
});
