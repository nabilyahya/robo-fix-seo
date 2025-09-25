// app/api/login/route.ts
import { NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "robosess";
const DEFAULT_MAX_AGE = 15 * 24 * 60 * 60; // 15 يوم
const SESSION_SECRET = process.env.SESSION_SECRET ?? "";

type SessionPayload = { id: string; name: string; role?: string; exp: number };

function signSession(
  payload: Omit<SessionPayload, "exp">,
  maxAge = DEFAULT_MAX_AGE
) {
  const secret = SESSION_SECRET || "dev-secret";
  const p: SessionPayload = {
    ...payload,
    exp: Math.floor(Date.now() / 1000) + maxAge,
  };
  const base = Buffer.from(JSON.stringify(p)).toString("base64url");
  const sig = crypto.createHmac("sha256", secret).update(base).digest("hex");
  return `${base}.${sig}`;
}

/* بيانات مؤقتة للتطوير */
type UserRow = { id: string; name: string; role: string; password: string };
async function fetchUsers(): Promise<UserRow[]> {
  return [
    { id: "1", name: "Yasmin", role: "call-center", password: "Y2067#" },
    { id: "2", name: "Nabil", role: "Admin", password: "N3824#" },
    { id: "3", name: "Ilhan", role: "Kargo", password: "I5677#" },
    { id: "4", name: "Mustafa", role: "Usta", password: "M7268#" },
  ];
}

function isSafePath(p: string) {
  return !!p && p.startsWith("/") && !p.startsWith("//");
}

export async function POST(req: Request) {
  const form = await req.formData();
  const name = (form.get("name") ?? "").toString().trim();
  const password = (form.get("password") ?? "").toString();
  const nextParam = (form.get("next") ?? "").toString().trim();

  const url = new URL(req.url);
  const mkErr = (code: "missing" | "invalid") => {
    const to = new URL("/login", url);
    to.searchParams.set("error", code);
    if (isSafePath(nextParam)) to.searchParams.set("next", nextParam);
    return NextResponse.redirect(to, 303);
  };

  if (!name || !password) return mkErr("missing");

  const users = await fetchUsers();
  const user = users.find((u) => u.name.toLowerCase() === name.toLowerCase());
  if (!user || user.password !== password) return mkErr("invalid");

  const role = (user.role || "").toLowerCase(); // ✅
  const token = signSession({ id: user.id, name: user.name, role });

  const dest = isSafePath(nextParam) ? nextParam : "/customers";
  const res = NextResponse.redirect(new URL(dest, url), 303);
  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: DEFAULT_MAX_AGE,
  });
  return res;
}
