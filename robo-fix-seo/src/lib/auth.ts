// src/lib/auth.ts
import crypto from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "robosess";
const SECRET = process.env.SESSION_SECRET || "";

export type SessionPayload = {
  id: string;
  name: string;
  role?: string;
  exp: number;
};

function verifyTokenServer(token: string): SessionPayload | null {
  try {
    const [b64, sig] = token.split(".");
    if (!b64 || !sig || !SECRET) return null;

    const expected = crypto
      .createHmac("sha256", SECRET)
      .update(b64)
      .digest("hex");

    // timing-safe compare
    const a = Buffer.from(expected);
    const b = Buffer.from(sig);
    if (a.length !== b.length) return null;
    if (!crypto.timingSafeEqual(a, b)) return null;

    const payload = JSON.parse(
      Buffer.from(b64, "base64url").toString("utf-8")
    ) as SessionPayload;
    if (!payload.exp || payload.exp * 1000 < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

/** يرجّع الـ session إن وُجد وصالح، أو null */
export async function getSessionFromCookies(): Promise<SessionPayload | null> {
  const token = (await cookies()).get(COOKIE_NAME)?.value;
  return token ? verifyTokenServer(token) : null;
}
