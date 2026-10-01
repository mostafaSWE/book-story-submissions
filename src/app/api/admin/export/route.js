import { NextResponse } from "next/server";

// Old export URL → «كتاب من قارئ إلى كاتب» export at its new path, filters kept (the new route checks the session).
export async function GET(request) {
  const url = new URL(request.url);
  return NextResponse.redirect(new URL(`/api/admin/reader-to-writer/export${url.search}`, request.url), { status: 308 });
}
