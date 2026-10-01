"""
Builds two tiny Amiri subsets for fixed Arabic text, so it paints without waiting for the full 78 KB faces:
  public/fonts/amiri-700-title.woff2  — bold, the headings (the LCP on most pages)
  public/fonts/amiri-400-ui.woff2     — regular, the form intro, the writing placeholder and the privacy lead
User-typed text always uses the full faces. Writes content/title-font-chars.json, which a unit test compares
against the current copy.

Run after changing any heading below:   python scripts/subset-title-font.py   (needs: pip install fonttools brotli)
"""
import json, os, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
HEADING_KEYS = ["title", "formTitle", "thanksTitle", "notFoundTitle", "privacyPage.title"]
UI_KEYS = ["formIntro", "bodyPlaceholder", "privacyPage.lead"]

def get(obj, dotted):
    for part in dotted.split("."):
        obj = obj[part]
    return obj

def collect(keys):
    texts = []
    for name in sorted(os.listdir(os.path.join(ROOT, "messages"))):
        if name.endswith(".json"):
            m = json.load(open(os.path.join(ROOT, "messages", name), encoding="utf-8"))
            if m["meta"]["dir"] == "rtl":
                texts += [get(m, k) for k in keys]
    return sorted(set("".join(texts)) | {" "})

def build(src_name, out_name, chars):
    src = os.path.join(ROOT, "public", "fonts", src_name)
    out = os.path.join(ROOT, "public", "fonts", out_name)
    subprocess.run([sys.executable, "-m", "fontTools.subset", src, "--text=" + "".join(chars), "--layout-features=*",
                    "--flavor=woff2", "--output-file=" + out], check=True)
    print(f"{out_name}: {os.path.getsize(out)} bytes, {len(chars)} characters")

title_chars, ui_chars = collect(HEADING_KEYS), collect(UI_KEYS)
build("amiri-700.woff2", "amiri-700-title.woff2", title_chars)
build("amiri-400.woff2", "amiri-400-ui.woff2", ui_chars)
json.dump({"keys": HEADING_KEYS, "chars": "".join(title_chars), "uiKeys": UI_KEYS, "uiChars": "".join(ui_chars)},
          open(os.path.join(ROOT, "content", "title-font-chars.json"), "w", encoding="utf-8"), ensure_ascii=False, indent=2)
