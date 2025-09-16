// src/app/robots.ts
import type { MetadataRoute } from "next";

const ENV = process.env.VERCEL_ENV ?? process.env.NODE_ENV; // 'production' | 'preview' | 'development'
const VERCEL_URL = process.env.VERCEL_URL; // robo-serfix.vercel.app
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL
  ? process.env.NEXT_PUBLIC_SITE_URL
  : VERCEL_URL
  ? `https://${VERCEL_URL}`
  : "http://localhost:3000";

export default function robots(): MetadataRoute.Robots {
  const isProd = ENV === "production";

  if (!isProd) {
    return {
      rules: [
        {
          userAgent: "*",
          allow: "/",
          disallow: ["/customers", "/customers/*", "/track", "/track/*"],
        },
      ],
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/customers", "/customers/*", "/track", "/track/*"],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
