import { createHash, randomBytes } from "crypto";

export function hashPass(p: string) {
  return createHash("sha256").update(p).digest("hex");
}

export function genPass6() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

export function genPublicId() {
  return randomBytes(3).toString("hex").toUpperCase(); // 6 chars
}
