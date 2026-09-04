// ============================================================
// lib/anichin/scrape.ts — scraper inti Anichin (server-only)
// Murni fetch+cheerio; TIDAK tahu apa pun tentang Next.js.
// ============================================================
import * as cheerio from "cheerio";
import type { AnyNode } from "domhandler";

export const BASE_URL = "https://anichin.cafe";
const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export class UpstreamError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

export async function fetchHtml(url: string): Promise<string> {
  const res = await fetch(url, {
    headers: {
      "User-Agent": USER_AGENT,
      "Accept-Language": "en-US,en;q=0.9,id;q=0.8",
    },
    // Next.js fetch cache — revalidasi 5 menit
    next: { revalidate: 300 },
  });
  if (!res.ok) {
    throw new UpstreamError(`Anichin merespons ${res.status}`, res.status === 404 ? 404 : 502);
  }
  return res.text();
}

export type CheerioAPI = cheerio.CheerioAPI;
export type CheerioEl = cheerio.Cheerio<AnyNode>;

export function load(html: string): CheerioAPI {
  return cheerio.load(html);
}

export function decodeBase64(str: string): string {
  try {
    return Buffer.from(str, "base64").toString("utf-8");
  } catch {
    return str;
  }
}

/** slug seri dari URL: /seri/<slug>/ → <slug>; path lain → full path */
export function slugFromUrl(url: string | undefined): string {
  if (!url) return "";
  try {
    const u = new URL(url, BASE_URL);
    const parts = u.pathname.split("/").filter(Boolean);
    if (parts[0] === "seri") return parts[1] || parts.join("/");
    return parts.join("/");
  } catch {
    return String(url).replace(/^\/+|\/+$/g, "");
  }
}

export function cleanTitle(raw: string | undefined): string {
  if (!raw) return "";
  return raw.split("\n")[0].replace(/\t+/g, " ").trim();
}

export function imgSrc($: CheerioAPI, el: AnyNode): string | null {
  return $(el).find("img").attr("src") || $(el).find("img").attr("data-src") || null;
}
