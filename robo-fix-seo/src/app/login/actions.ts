"use server";

import crypto from "crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const COOKIE_NAME = "robosess";
const DEFAULT_MAX_AGE = 15 * 24 * 60 * 60; // 15 يوم
const SESSION_SECRET = process.env.SESSION_SECRET ?? "";

type SessionPayload = {
  id: string;
  name: string;
  role?: string;
  exp: number;
};

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

type UserRow = { id: string; name: string; role: string; password: string };

// بيانات تطوير افتراضية – استبدلها بربط Google Sheets عندك
async function fetchUsers(): Promise<UserRow[]> {
  return [
    { id: "1", name: "Yasmin", role: "call-center", password: "Y2067#" },
    { id: "2", name: "Nabil", role: "Admin", password: "N3824#" },
    { id: "3", name: "Ilhan", role: "Kargo", password: "I5677#" },
    { id: "4", name: "Mustafa", role: "Usta", password: "M7268#" },
  ];
}

function getField(fd: FormData, key: string): string {
  const v = fd.get(key);
  return (typeof v === "string" ? v : "").trim();
}

export async function loginAction(formData: FormData): Promise<void> {
  const name = getField(formData, "name");
  const password = getField(formData, "password");

  const err = (code: string) =>
    redirect(`/login?error=${encodeURIComponent(code)}`);

  if (!name || !password) err("missing");

  const users = await fetchUsers();
  const user = users.find((u) => u.name.toLowerCase() === name.toLowerCase());
  if (!user || user.password !== password) err("invalid");

  const token = signSession({
    id: user!.id,
    name: user!.name,
    role: user!.role,
  });
  (await cookies()).set(COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    secure: process.env.NODE_ENV === "production",
    maxAge: DEFAULT_MAX_AGE,
  });

  redirect("/customers");
}
