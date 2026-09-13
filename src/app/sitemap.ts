// ============================================================
// app/sitemap.ts — Sitemap dinamis
// Route jelajah + home; judul dinamis tidak di-enumerate
// (jumlah besar, discovery via internal links).
// ============================================================
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://hyuuhub.vercel.app";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "hourly", priority: 1 },
    { url: `${base}/latest`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/manga`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/manhwa`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/manhua`, lastModified: now, changeFrequency: "daily", priority: 0.8 },
    { url: `${base}/genres`, lastModified: now, changeFrequency: "weekly", priority: 0.6 },
    { url: `${base}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.3 },
  ];
}
