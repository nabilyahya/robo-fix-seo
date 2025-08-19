// src/lib/site.ts
export const ENV =
  process.env.VERCEL_ENV ?? process.env.NODE_ENV ?? "development";

export const VERCEL_URL = process.env.VERCEL_URL; // ex: myapp.vercel.app

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ||
  (VERCEL_URL ? `https://${VERCEL_URL}` : "http://localhost:3000");

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID || ""; // "G-XXXX"
export const GADS_ID = process.env.NEXT_PUBLIC_GOOGLE_ADS_ID || ""; // "AW-XXXX"
export const IS_PROD = ENV === "production";
