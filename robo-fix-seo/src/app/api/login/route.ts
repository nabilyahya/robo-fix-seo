import { NextResponse } from "next/server";
import crypto from "crypto";

const COOKIE_NAME = "robosess";
const DEFAULT_MAX_AGE = 15 * 24 * 60 * 60; // 15 يوم
const SESSION_SECRET = process.env.SESSION_SECRET ?? "";

/* توقيع الجلسة */
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

/* بيانات مؤقتة للتطوير – بدّلها بربط Google Sheets لاحقًا */
type UserRow = { id: string; name: string; role: string; password: string };
async function fetchUsers(): Promise<UserRow[]> {
  return [
    { id: "1", name: "Yasmin", role: "call-center", password: "Y2067#" },
    { id: "2", name: "Nabil", role: "Admin", password: "N3824#" },
    { id: "3", name: "Ilhan", role: "Kargo", password: "I5677#" },
    { id: "4", name: "Mustafa", role: "Usta", password: "M7268#" },
  ];
}

/* POST /api/login */
export async function POST(req: Request) {
  const form = await req.formData();
  const name = (form.get("name") ?? "").toString().trim();
  const password = (form.get("password") ?? "").toString();

  const url = new URL(req.url);

  if (!name || !password) {
    return NextResponse.redirect(new URL("/login?error=missing", url), 303);
  }

  const users = await fetchUsers();
  const user = users.find((u) => u.name.toLowerCase() === name.toLowerCase());
  if (!user || user.password !== password) {
    return NextResponse.redirect(new URL("/login?error=invalid", url), 303);
  }

  const token = signSession({ id: user.id, name: user.name, role: user.role });

  const res = NextResponse.redirect(new URL("/customers", url), 303);
  res.cookies.set({
    name: COOKIE_NAME,
    value: token,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: true, // على Vercel دائماً HTTPS
    maxAge: DEFAULT_MAX_AGE,
  });

  return res;
}
