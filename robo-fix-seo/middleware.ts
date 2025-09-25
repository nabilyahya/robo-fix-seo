// middleware.ts
import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";

const COOKIE_NAME = "robosess";
const SECRET = process.env.SESSION_SECRET || "";

// شغّل الميدلوير على كل المسارات (عدا static/image/api...)
export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/.*).*)"],
};

// HMAC-SHA256 (Web Crypto)
async function hmacSha256Hex(message: string, secret: string) {
  const te = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    te.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", key, te.encode(message));
  const bytes = new Uint8Array(sig);
  return Array.from(bytes)
    .map((x) => x.toString(16).padStart(2, "0"))
    .join("");
}

// Base64URL → string بدون Buffer
function base64urlToString(b64url: string) {
  const b64 = b64url.replace(/-/g, "+").replace(/_/g, "/");
  const pad = b64.length % 4 ? 4 - (b64.length % 4) : 0;
  const b64p = b64 + "=".repeat(pad);
  const bin = atob(b64p);
  const bytes = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i);
  return new TextDecoder().decode(bytes);
}

async function verifyToken(token: string) {
  try {
    const [b64, sig] = token.split(".");
    if (!b64 || !sig || !SECRET) return null;

    const expected = await hmacSha256Hex(b64, SECRET);

    // مقارنة ثابتة الزمن تقريبية
    if (expected.length !== sig.length) return null;
    let diff = 0;
    for (let i = 0; i < expected.length; i++) {
      diff |= expected.charCodeAt(i) ^ sig.charCodeAt(i);
    }
    if (diff !== 0) return null;

    const payloadStr = base64urlToString(b64);
    const payload = JSON.parse(payloadStr) as {
      id: string;
      name: string;
      role?: string;
      exp: number;
    };
    if (!payload?.exp || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const url = new URL(req.url);
  const pathname = url.pathname;
  const pathLower = pathname.toLowerCase();

  // 1) حماية /track/123456 بنفس المنطق، ولكن case-insensitive
  if (pathLower.startsWith("/track")) {
    const passPage = /^\/track\/\d{6}$/; // على lower-case
    if (!passPage.test(pathLower)) return NextResponse.next();

    const ok = req.cookies.get("tsok")?.value === "1";
    if (ok) return NextResponse.next();

    const to = new URL("/track", req.url);
    to.searchParams.set("need", "1");
    return NextResponse.redirect(to);
  }

  // 2) حماية /admin/** (case-insensitive)
  if (pathLower.startsWith("/admin")) {
    const token = req.cookies.get(COOKIE_NAME)?.value;
    const sess = token ? await verifyToken(token) : null;
    if (!sess || (sess.role || "").toLowerCase() !== "admin") {
      const to = new URL("/login", req.url);
      // نُمرّر المسار الأصلي كما كتبه المستخدم (حتى لو كان /ADmin/finance)
      to.searchParams.set("next", pathname);
      return NextResponse.redirect(to);
    }
  }

  return NextResponse.next();
}
