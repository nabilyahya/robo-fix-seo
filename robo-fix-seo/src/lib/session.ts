// src/lib/session.ts
import crypto from "crypto";
import { cookies } from "next/headers";
import { NextResponse } from "next/server";

const COOKIE_NAME = "robosess";
const DEFAULT_MAX_AGE = 15 * 24 * 60 * 60;

function b64u(input: string) {
  return Buffer.from(input).toString("base64url");
}
function unb64u(input: string) {
  return Buffer.from(input, "base64url").toString();
}

export type SessionPayload = {
  id: string;
  name: string;
  role?: string;
  exp: number; // epoch seconds
};

const SECRET = process.env.SESSION_SECRET;
if (!SECRET) {
  // لا ترمي خطأ تلقائياً هنا لأن بعض أوامر dev قد لا تستخدم auth.
  // لكن الأفضل تعيين SESSION_SECRET في env.
}

/** sign payload (JSON) -> token: payloadBase64.signatureHex */
export function signSession(
  payload: Omit<SessionPayload, "exp">,
  maxAge = DEFAULT_MAX_AGE
) {
  if (!SECRET) throw new Error("Missing SESSION_SECRET env");
  const p: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + maxAge,
  };
  const json = JSON.stringify(p);
  const payloadB64 = b64u(json);
  const h = crypto
    .createHmac("sha256", SECRET)
    .update(payloadB64)
    .digest("hex");
  return `${payloadB64}.${h}`;
}

/** verify token, returns payload or null */
export function verifySession(token?: string): SessionPayload | null {
  if (!SECRET || !token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;
  const [payloadB64, sig] = parts;
  try {
    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(payloadB64)
      .digest("hex");
    if (!crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(sig)))
      return null;
    const json = unb64u(payloadB64);
    const p = JSON.parse(json) as SessionPayload;
    if (typeof p.exp !== "number") return null;
    if (p.exp < Math.floor(Date.now() / 1000)) return null;
    return p;
  } catch {
    return null;
  }
}

/** set cookie on server action (Next.js server component or server action) */
export function setSessionCookie(
  resCookies: ReturnType<typeof cookies> | null,
  token: string,
  maxAge = DEFAULT_MAX_AGE
) {
  // If called from a server action, prefer using next/headers cookies() for same request.
  // But for simplicity the caller may set cookie via NextResponse in redirect. We'll provide simple helper:
  // If resCookies provided (cookies()), set there; otherwise return cookie string for NextResponse.
  const cookieOptions = [
    `${COOKIE_NAME}=${token}`,
    `Max-Age=${maxAge}`,
    `Path=/`,
    `HttpOnly`,
    `SameSite=Lax`,
    process.env.NODE_ENV === "production" ? "Secure" : "",
  ]
    .filter(Boolean)
    .join("; ");

  if (resCookies && typeof (resCookies as any).set === "function") {
    // next/headers cookies() in server action is read-only in many contexts — so this may not always work.
    // We'll not rely on it; caller can set via NextResponse.
  }
  return cookieOptions;
}

/** helper to read cookie value from headers (inside server components / layouts) */
export function getSessionFromRequestCookie(
  reqCookies: { get: (name: string) => { value?: string } | undefined } | null
) {
  if (!reqCookies) return null;
  const c = reqCookies.get ? reqCookies.get(COOKIE_NAME) : undefined;
  return c?.value ?? null;
}
