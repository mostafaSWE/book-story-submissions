import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  createSessionValue,
  getSessionCookieOptions,
  verifyAdminCredentials
} from "@/lib/auth";

export async function POST(request) {
  const formData = await request.formData();
  const username = String(formData.get("username") || "").trim();
  const password = String(formData.get("password") || "");
  const adminLang = String(formData.get("adminLang") || "") === "ar" ? "ar" : "en";
  const ok = await verifyAdminCredentials(username, password);

  if (!ok) {
    return NextResponse.redirect(new URL(`/admin/login?error=invalid&adminLang=${adminLang}`, request.url), { status: 303 });
  }

  const response = NextResponse.redirect(new URL(`/admin?adminLang=${adminLang}`, request.url), { status: 303 });
  response.cookies.set(ADMIN_SESSION_COOKIE, await createSessionValue(username), getSessionCookieOptions());
  return response;
}
