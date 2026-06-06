import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export const ADMIN_SESSION_COOKIE = "book_admin_session";
export const MAX_PBKDF2_ITERATIONS = 100000;

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function getSessionSecret() {
  const secret = process.env.SESSION_SECRET;
  if (!secret && process.env.NODE_ENV === "production") {
    throw new Error("Missing required environment variable: SESSION_SECRET");
  }
  return secret || "local-development-session-secret";
}

function bytesToBase64Url(bytes) {
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBytes(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  return Uint8Array.from(binary, (character) => character.charCodeAt(0));
}

function textToBase64Url(value) {
  return bytesToBase64Url(encoder.encode(value));
}

function base64UrlToText(value) {
  return decoder.decode(base64UrlToBytes(value));
}

function timingSafeEqual(left, right) {
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);
  const length = Math.max(leftBytes.length, rightBytes.length);
  let diff = leftBytes.length ^ rightBytes.length;

  for (let index = 0; index < length; index += 1) {
    diff |= (leftBytes[index] || 0) ^ (rightBytes[index] || 0);
  }

  return diff === 0;
}

async function sign(value) {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSessionSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(value));
  return bytesToBase64Url(new Uint8Array(signature));
}

async function pbkdf2(password, salt, iterations) {
  const keyMaterial = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      hash: "SHA-256",
      salt: encoder.encode(salt),
      iterations
    },
    keyMaterial,
    256
  );

  return bytesToBase64Url(new Uint8Array(bits));
}

export function getSessionCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 8,
    path: "/"
  };
}

export async function createSessionValue(username) {
  const payload = textToBase64Url(
    JSON.stringify({
      sub: username,
      exp: Date.now() + 8 * 60 * 60 * 1000
    })
  );

  return `${payload}.${await sign(payload)}`;
}

export async function verifySessionValue(value) {
  if (!value || !value.includes(".")) return null;
  const [payload, signature] = value.split(".");
  const expected = await sign(payload);

  if (!signature || !timingSafeEqual(expected, signature)) {
    return null;
  }

  try {
    const session = JSON.parse(base64UrlToText(payload));
    if (!session.exp || session.exp < Date.now()) return null;
    return session;
  } catch {
    return null;
  }
}

export async function getAdminSession() {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(ADMIN_SESSION_COOKIE);
  return verifySessionValue(sessionCookie?.value);
}

export async function isAdminAuthenticated() {
  return Boolean(await getAdminSession());
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

async function verifyPassword(password, storedHash) {
  if (!storedHash) return false;

  const separator = storedHash.includes(":") ? ":" : "$";
  const [algorithm, iterationsRaw, salt, expectedHash] = storedHash.split(separator);
  const iterations = Number(iterationsRaw);

  if (
    algorithm !== "pbkdf2_sha256" ||
    !iterations ||
    iterations > MAX_PBKDF2_ITERATIONS ||
    !salt ||
    !expectedHash
  ) {
    return false;
  }

  const actualHash = await pbkdf2(password, salt, iterations);
  return timingSafeEqual(actualHash, expectedHash);
}

export async function verifyAdminCredentials(username, password) {
  const expectedUsername = process.env.ADMIN_USERNAME || process.env.ADMIN_EMAIL || "admin";
  const storedHash = process.env.ADMIN_PASSWORD_HASH;

  if (username !== expectedUsername) return false;
  return verifyPassword(password, storedHash);
}
