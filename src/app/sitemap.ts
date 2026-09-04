// ============================================================
// app/sitemap.ts — Sitemap dinamis (berisi static routes;
// dynamic donghua IDs tidak di-enumerate — source tidak sediakan
// index list, dan jumlahnya besar. Google tetap menemukan via internal links.)
// ============================================================
import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL || "https://hyuuhub.vercel.app";
  const now = new Date();

  return [
    { url: base, lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: `${base}/latest`, lastModified: now, changeFrequency: "hourly", priority: 0.9 },
    { url: `${base}/schedule`, lastModified: now, changeFrequency: "daily", priority: 0.7 },
    { url: `${base}/genres`, lastModified: now, changeFrequency: "weekly", priority: 0.5 },
    { url: `${base}/search`, lastModified: now, changeFrequency: "weekly", priority: 0.3 },
  ];
}
