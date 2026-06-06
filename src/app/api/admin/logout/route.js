import { NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE } from "@/lib/auth";

export async function POST(request) {
  const response = NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 });
  response.cookies.set(ADMIN_SESSION_COOKIE, "", {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 0,
    path: "/"
  });
  return response;
}
