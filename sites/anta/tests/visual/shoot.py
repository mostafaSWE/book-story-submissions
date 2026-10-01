"""
Screenshots of the BUILT site on the same screens/viewports as the approved prototype
(prototype/anta/screenshots on branch prototype/anta-alkateb), plus side-by-side comparisons.
Usage: python tests/visual/shoot.py [base_url]   (default http://127.0.0.1:3100)
Needs the local test database (thanks screen submits a TEST entry there).
"""
import os, sys, subprocess, io, random
from playwright.sync_api import sync_playwright
from PIL import Image

BASE = sys.argv[1] if len(sys.argv) > 1 else "http://127.0.0.1:3100"
HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, "..", ".artifacts", "built")
CMP = os.path.join(HERE, "..", ".artifacts", "compare")
REPO = os.path.abspath(os.path.join(HERE, "..", "..", "..", ".."))
os.makedirs(OUT, exist_ok=True); os.makedirs(CMP, exist_ok=True)

VIEWPORTS = {
    "mobile": dict(viewport={"width": 390, "height": 844}, device_scale_factor=2, is_mobile=True, has_touch=True),
    "desktop": dict(viewport={"width": 1440, "height": 900}, device_scale_factor=1),
}
SAMPLE = {
    "ar": dict(title="حكمة القلم", body="الكلمةُ الصادقةُ لا تشيخ؛ تكبرُ مع قارئها كلّما عاد إليها.", name="TEST عبد الرحمن الكعبي", phone="٠٥٠١٢٣٤٥٦٧"),
    "en": dict(title="On ink", body="A true sentence does not age; it grows with every reader who returns to it.", name="TEST Layla Haddad", phone="050 123 4567"),
}

def prototype(name):
    try:
        data = subprocess.run(["git", "-C", REPO, "show", f"prototype/anta-alkateb:prototype/anta/screenshots/{name}.jpg"], capture_output=True, check=True).stdout
        return Image.open(io.BytesIO(data)).convert("RGB")
    except subprocess.CalledProcessError:
        return None

def side_by_side(name):
    built = Image.open(os.path.join(OUT, name + ".jpg")).convert("RGB")
    proto = prototype(name)
    if proto is None: return
    h = max(built.height, proto.height)
    sheet = Image.new("RGB", (proto.width + built.width + 20, h), "white")
    sheet.paste(proto, (0, 0)); sheet.paste(built, (proto.width + 20, 0))
    sheet.save(os.path.join(CMP, name + ".jpg"), quality=80)

def shoot(page, name, full=False):
    page.evaluate("document.fonts.ready"); page.wait_for_timeout(700)
    page.screenshot(path=os.path.join(OUT, name + ".jpg"), full_page=full, type="jpeg", quality=88)
    side_by_side(name)
    print("  ", name)

with sync_playwright() as p:
    browser = p.chromium.launch(channel="msedge")
    for vp, opts in VIEWPORTS.items():
        for lang in ("ar", "en"):
            ctx = browser.new_context(locale="ar-AE" if lang == "ar" else "en-GB", **opts)
            ctx.route("**/api/country", lambda route: route.fulfill(json={"country": None}))  # default UAE, like the prototype
            page = ctx.new_page()
            page.set_extra_http_headers({"x-forwarded-for": f"198.51.100.{random.randint(1, 250)}"})
            stem = f"A-{lang}-{vp}"
            page.goto(f"{BASE}/{lang}"); shoot(page, f"{stem}-1-landing")
            page.goto(f"{BASE}/{lang}/write"); page.wait_for_function("document.querySelector('input[name=startedAt]')?.value")
            shoot(page, f"{stem}-2-form", full=True)
            page.click("button.submit"); page.wait_for_timeout(300); shoot(page, f"{stem}-2b-form-errors", full=True)
            s = SAMPLE[lang]
            page.fill("#f-title", s["title"]); page.fill("#f-body", s["body"]); page.fill("#f-name", s["name"])
            page.fill("#f-email", f"test+visual-{random.randint(1, 10**9)}@example.com"); page.select_option("#f-country", "AE"); page.fill("#f-phone", s["phone"])
            page.locator(".check").click(); page.wait_for_timeout(400)
            if vp == "mobile": shoot(page, f"{stem}-2c-form-filled", full=True)
            page.wait_for_timeout(2600); page.click("button.submit")
            page.wait_for_selector("#thanks-heading", timeout=15000)
            shoot(page, f"{stem}-3-thanks", full=True)
            page.goto(f"{BASE}/{lang}/privacy"); shoot(page, f"{stem}-4-privacy", full=True)
            ctx.close()
    for vp, lang in (("mobile", "ar"), ("desktop", "en")):
        ctx = browser.new_context(reduced_motion="reduce", **VIEWPORTS[vp]); page = ctx.new_page()
        page.goto(f"{BASE}/{lang}"); shoot(page, f"A-{lang}-{vp}-1b-landing-reduced-motion"); ctx.close()
    browser.close()
