// src/app/sitemap.ts
import type { MetadataRoute } from "next";
import { getAllPosts } from "@/lib/posts";

export const revalidate = 60 * 60 * 24; // يومياً (اختياري)

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const posts = getAllPosts();

  // عناصر ثابتة
  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: `${base}/`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${base}/blog`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // عناصر التدوينات — نحدد نوع الماب صراحةً
  const postEntries = posts.map<MetadataRoute.Sitemap[number]>((p) => ({
    url: `${base}/blog/${p.slug}`,
    lastModified: new Date(p.date), // ISO من الـArray
    changeFrequency: "monthly",
    priority: 0.7,
  }));

  return [...staticEntries, ...postEntries];
}
