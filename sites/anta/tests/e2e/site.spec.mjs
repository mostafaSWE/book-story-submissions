import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";
import { AR_INDIC_PHONE, fillForm, localRows, openForm, submitAndWaitForThanks, testEmail } from "./helpers.mjs";

const MOON = String.fromCodePoint(0x1f319);
const errorText = (page, field) => page.locator(`#f-${field}-err`);

test.describe("language and URL", () => {
  test("/ goes to Arabic by default; the English choice is remembered", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveURL(/\/ar$/);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    await page.click('.lang a[lang="en"]');
    await expect(page).toHaveURL(/\/en$/);
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await page.goto("/");
    await expect(page).toHaveURL(/\/en$/);
    await page.goto("/ar"); // a shared /ar link always opens in Arabic
    await expect(page.locator("h1")).toHaveText("أنت الكاتب");
  });

  test("typed text survives a language switch and errors re-render in the new language", async ({ page }) => {
    await openForm(page, "ar");
    await fillForm(page, { body: "نصٌّ تجريبي", name: "مريم" });
    await page.click("button.submit");
    await expect(errorText(page, "email")).toHaveText("اكتب بريدك الإلكتروني.");
    await page.waitForTimeout(400); // draft is saved shortly after typing
    await page.click('.lang a[lang="en"]');
    await expect(page).toHaveURL(/\/en\/write$/);
    await expect(page.locator("#f-body")).toHaveValue("نصٌّ تجريبي");
    await expect(page.locator("#f-name")).toHaveValue("مريم");
    await expect(errorText(page, "email")).toHaveText("Enter your email address.");
  });
});

test.describe("landing", () => {
  for (const lang of ["ar", "en"]) {
    test(`${lang}: hero, four rows drifting left → right, pause`, async ({ page }) => {
      await page.goto(`/${lang}`);
      await expect(page.locator(".row")).toHaveCount(4);
      const x = () => page.evaluate(() => new DOMMatrix(getComputedStyle(document.querySelectorAll(".track")[1]).transform).m41);
      const a = await x();
      await page.waitForTimeout(1200);
      expect(await x()).toBeGreaterThan(a);
      await page.mouse.move(1, 1); // hover pause must not be what we're measuring
      await page.click(".motion-toggle");
      await expect(page.locator(".motion-toggle")).toHaveAttribute("aria-pressed", "true");
      expect(await page.evaluate(() => getComputedStyle(document.querySelector(".track")).animationPlayState)).toBe("paused");
      await expect(page.locator(".quotes-list li")).toHaveCount(40);
    });
  }

  test("reduced motion: static quotes instead of the band", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/ar");
    await expect(page.locator(".rows")).toBeHidden();
    await expect(page.locator(".static-quotes figure")).toHaveCount(3);
    await expect(page.locator(".static-quotes figure").first()).toBeVisible();
  });

  test("keyboard order: skip link → mark → languages → quotes → pause → CTA", async ({ page }) => {
    await page.goto("/ar");
    const order = [];
    for (let i = 0; i < 7; i++) {
      await page.keyboard.press("Tab");
      order.push(await page.evaluate(() => {
        const e = document.activeElement;
        return e.className || e.tagName;
      }));
    }
    expect(order.join(" ")).toMatch(/skip.*mark.*quotes.*motion-toggle.*cta/);
  });
});

test.describe("form", () => {
  test("Arabic: name with tashkeel, Arabic-Indic digits → stored as typed, phone in E.164", async ({ page }) => {
    const email = testEmail("ar");
    const body = `الكلمةُ الصادقةُ لا تشيخ؛\nتكبرُ مع قارئها ${MOON}`;
    await openForm(page, "ar");
    await fillForm(page, { title: "حكمة القلم", body, name: "TEST عبدُالله بن سالم", email, phone: AR_INDIC_PHONE, consent: true });
    await expect(page.locator("#f-phone-ok")).toContainText("+971 50 123 4567");
    await submitAndWaitForThanks(page);
    await expect(page.locator(".their-text")).toHaveText(`«${body}»`);
    await expect(page.locator(".their-name")).toHaveText("— TEST عبدُالله بن سالم");
    const rows = await localRows(email);
    if (rows) {
      expect(rows).toHaveLength(1);
      expect(rows[0]).toMatchObject({ ui_language: "ar", phone_e164: "+971501234567", phone_region: "AE", body, title: "حكمة القلم", consent_publish: true, status: "new" });
      expect(rows[0].ip_hash).toMatch(/^[0-9a-f]{32}$/);
    }
  });

  test("English submission", async ({ page }) => {
    const email = testEmail("en");
    await openForm(page, "en");
    await fillForm(page, { body: "A true sentence does not age.", name: "TEST Layla Haddad", email, region: "SA", phone: "050 123 4567", consent: true });
    await submitAndWaitForThanks(page);
    await expect(page.locator("#thanks-heading")).toHaveText("Until we meet again, in the sanctuary of the pen");
    const rows = await localRows(email);
    if (rows) expect(rows[0]).toMatchObject({ ui_language: "en", phone_e164: "+966501234567", title: null });
  });

  test("validation edge cases (messages in Arabic)", async ({ page }) => {
    await openForm(page, "ar");
    const base = { body: "نص صالح", name: "TEST مريم", email: testEmail("edge"), phone: "0501234567" };
    const expectError = async (patch, field, text) => {
      await page.fill("#f-title", "");
      await fillForm(page, { ...base, ...patch });
      await page.click("button.submit");
      await expect(errorText(page, field)).toContainText(text);
      await expect(page.locator(".error-summary")).toBeVisible();
    };
    await expectError({ body: "   \n  " }, "body", "اكتب كلماتك أولًا");
    await expectError({ body: "ا".repeat(1001) }, "body", "النصّ أطول من 1,000 حرف");
    await expectError({ name: "Ali123" }, "name", "الاسم يحتوي على أرقام أو رموز");
    await expectError({ email: "بريد@مثال.كوم" }, "email", "لوحة المفاتيح عربية");
    await expectError({ phone: "12" }, "phone", "الإمارات العربية المتحدة");
    await expectError({}, "consent", "نحتاج موافقتك");
  });

  test("1,000 characters with emoji are accepted (graphemes, not code units)", async ({ page }) => {
    const email = testEmail("emoji");
    const body = `${MOON}✍️ ` + "ب".repeat(997);
    await openForm(page, "ar");
    await fillForm(page, { body, name: "TEST نور", email, phone: AR_INDIC_PHONE, consent: true });
    await expect(page.locator("#f-body-count")).toHaveText("1,000 من 1,000");
    await submitAndWaitForThanks(page);
    const rows = await localRows(email);
    if (rows) expect(rows[0].body).toBe(body);
  });

  test("the same words from the same email twice → duplicate message", async ({ page }) => {
    const email = testEmail("dup");
    const v = { body: "حكمةٌ لا تتكرر", name: "TEST سالم", email, phone: "0501234567", consent: true };
    await openForm(page, "ar");
    await fillForm(page, v);
    await submitAndWaitForThanks(page);
    await page.click("[class*='button-quiet']"); // write another (keeps name and contact)
    await expect(page.locator("#f-email")).toHaveValue(email);
    await fillForm(page, { body: v.body, consent: true });
    await page.waitForTimeout(2600);
    await page.click("button.submit");
    await expect(page.locator(".form-status")).toHaveText("وصلتنا هذه الكلمات منك من قبل.");
  });

  test("phone country defaults to the visitor's country (D8), else UAE", async ({ page }) => {
    await page.route("**/api/country", (route) => route.fulfill({ json: { country: "SA" } }));
    await openForm(page, "ar");
    await expect(page.locator("#f-country")).toHaveValue("SA");
    await expect(page.locator(".phone-dial")).toHaveText("+966");
    await page.route("**/api/country", (route) => route.fulfill({ json: { country: null } }));
    await openForm(page, "en");
    await expect(page.locator("#f-country")).toHaveValue("AE");
    await page.fill("#f-phone", "+966 50 123 4567"); // typing another country's code switches the picker
    await expect(page.locator("#f-country")).toHaveValue("SA");
  });

  test("regression: ticking consent right after an invalid phone is not swallowed", async ({ page, isMobile }) => {
    test.skip(isMobile, "mouse-only layout shift; covered on desktop");
    await openForm(page, "ar");
    await fillForm(page, { body: "نص", name: "TEST مريم", email: "a@example.com", phone: "12" });
    await page.locator(".check").click(); // blur(phone) happens on mousedown here
    await expect(page.locator("#f-consent")).toBeChecked();
    await expect(errorText(page, "phone")).toBeVisible();
  });

  test("per-connection limit: the 6th submission within a minute is refused", async ({ page }) => {
    test.skip(!!process.env.NO_LIMITER, "limiter binding not available in this runtime");
    const ip = `203.0.113.${Math.floor(Math.random() * 250) + 1}`;
    await openForm(page, "ar", { ip });
    let refused = false;
    for (let i = 1; i <= 6 && !refused; i++) {
      if (i > 1) {
        await page.click("[class*='button-quiet']");
        await fillForm(page, { body: `TEST نصٌّ رقم ${i} ${Date.now()}`, consent: true });
      } else {
        await fillForm(page, { body: `TEST نصٌّ رقم 1 ${Date.now()}`, name: "TEST حدّ", email: testEmail("limit"), phone: "0501234567", consent: true });
      }
      await page.waitForTimeout(2600);
      await page.click("button.submit");
      const outcome = await Promise.race([
        page.locator("#thanks-heading").waitFor({ timeout: 15_000 }).then(() => "ok"),
        page.locator(".form-status").filter({ hasText: /./ }).waitFor({ timeout: 15_000 }).then(() => "status")
      ]);
      if (outcome === "status") {
        await expect(page.locator(".form-status")).toHaveText("وصلنا عددٌ كبير من المشاركات من هذا الجهاز. حاول بعد قليل.");
        expect(i).toBe(6);
        refused = true;
      }
    }
    expect(refused).toBe(true);
  });

  test("works without JavaScript (plain form post)", async ({ browser }) => {
    const ctx = await browser.newContext({ javaScriptEnabled: false });
    const page = await ctx.newPage();
    const email = testEmail("nojs");
    await page.goto("/ar/write");
    await page.fill("#f-body", "حكمةٌ بلا جافاسكربت");
    await page.fill("#f-name", "TEST بلا سكربت");
    await page.fill("#f-email", email);
    await page.fill("#f-phone", "0501234567");
    await page.check("#f-consent", { force: true });
    await page.click("button.submit");
    await expect(page.locator("#thanks-heading")).toBeVisible({ timeout: 15_000 });
    const rows = await localRows(email);
    if (rows) expect(rows).toHaveLength(1);
    await ctx.close();
  });
});

test.describe("other pages", () => {
  test("privacy note in both languages", async ({ page }) => {
    await page.goto("/ar/privacy");
    await expect(page.locator("h1")).toHaveText("ملاحظة الخصوصية");
    await expect(page.locator(".privacy-list > div")).toHaveCount(7);
    await page.goto("/en/privacy");
    await expect(page.locator("h1")).toHaveText("Privacy note");
  });

  test("unknown address → the site's own 404", async ({ page }) => {
    const res = await page.goto("/ar/does-not-exist");
    expect(res.status()).toBe(404);
    await expect(page.locator("h1")).toHaveText("الصفحة غير موجودة");
  });
});

test.describe("accessibility (axe, WCAG 2.1 AA)", () => {
  for (const path of ["/ar", "/en", "/ar/write", "/en/write", "/ar/privacy", "/en/privacy"]) {
    test(`no violations on ${path}`, async ({ page }) => {
      await page.goto(path);
      await page.waitForTimeout(300);
      if (path.endsWith("/write")) await page.click("button.submit"); // include the error state
      const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
      expect(result.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
    });
  }
  test("no violations on the thank-you screen", async ({ page }) => {
    await openForm(page, "ar");
    await fillForm(page, { body: "نصٌّ للفحص", name: "TEST فحص", email: testEmail("axe"), phone: "0501234567", consent: true });
    await submitAndWaitForThanks(page);
    const result = await new AxeBuilder({ page }).withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"]).analyze();
    expect(result.violations.map((v) => `${v.id}: ${v.nodes.length}`)).toEqual([]);
  });
});
