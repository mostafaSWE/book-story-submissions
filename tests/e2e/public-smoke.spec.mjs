// Read-only smoke tests of the original public site. Never submits anything.
import { expect, test } from "@playwright/test";

test.describe("original public site (read-only)", () => {
  test("landing, /share and /terms load", async ({ page }) => {
    for (const path of ["/", "/share", "/terms"]) {
      const res = await page.goto(path);
      expect(res.status(), path).toBe(200);
    }
    await page.goto("/");
    await expect(page.locator(".brand-lockup strong").first()).toContainText(/From Reader to Writer|كتاب من قارئ إلى كاتب/);
  });

  test("language switch changes the whole interface", async ({ page }) => {
    await page.goto("/");
    await page.locator(".language-select-trigger").first().click();
    await page.locator(".language-select-option", { hasText: "العربية" }).click();
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await expect(page.locator("h1")).toHaveText("اختر لغتك وابدأ الرحلة");
    await page.locator(".language-select-trigger").first().click();
    await page.locator(".language-select-option", { hasText: "English" }).click();
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
  });

  test("validation messages show (no submission)", async ({ page }) => {
    let posted = false;
    page.on("request", (r) => { if (r.method() === "POST" && r.url().includes("/api/submissions")) posted = true; });
    await page.goto("/");
    await page.locator(".language-continue").click();
    await page.locator(".intro-copy .primary-button").click();
    await page.locator(".form-screen .button-row .primary-button").click(); // "Next" with empty fields
    await expect(page.locator(".field-error").first()).toBeVisible();
    await expect(page.locator(".server-message")).toBeVisible();
    expect(posted).toBe(false);
  });
});
