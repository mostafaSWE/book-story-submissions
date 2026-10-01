import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { book, setNote, setStatus } from "@/books/anta";

// Status and private-note changes for one «أنت الكاتب» entry (plain HTML form posts from the detail page).
export async function POST(request, context) {
  await requireAdmin();

  // Same-site forms only (the session cookie is SameSite=Lax; this is a second line of defence).
  const origin = request.headers.get("origin");
  if (origin && new URL(origin).host !== new URL(request.url).host) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id: rawId } = await context.params;
  const id = Number(rawId);
  if (!Number.isInteger(id) || id < 1) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const form = await request.formData();
  const action = String(form.get("action") || "");
  if (action === "status") {
    const status = String(form.get("status") || "");
    if (!book.statuses.includes(status)) return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    await setStatus(id, status);
  } else if (action === "note") {
    await setNote(id, form.get("note"));
  } else {
    return NextResponse.json({ error: "Unknown action" }, { status: 400 });
  }

  const adminLang = new URL(request.url).searchParams.get("adminLang") === "ar" ? "ar" : "en";
  return NextResponse.redirect(new URL(`${book.detailPath(id)}?adminLang=${adminLang}&saved=1`, request.url), { status: 303 });
}
