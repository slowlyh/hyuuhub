// ============================================================
// lib/anichin/adapter.ts — Normalizer Anichin → tipe domain HyuuHub
// UI HANYA memanggil modul ini; tidak pernah menyentuh HTML/cheerio.
// Semua fungsi server-only (dipanggil dari Route Handler / RSC).
// ============================================================
import type {
  DonghuaCard, DonghuaDetail, EpisodeEntry, Genre, HomeData,
  LeaderboardEntry, Paginated, ScheduleMap, WatchData, ServerOption, DownloadLink,
} from "@/types";
import {
  BASE_URL, UpstreamError, fetchHtml, load, decodeBase64,
  slugFromUrl, cleanTitle, imgSrc,
  type CheerioAPI, type CheerioEl,
} from "./scrape";
import type { AnyNode } from "domhandler";

// ── internal: parse satu kartu .bsx ─────────────────────────
function parseCard($: CheerioAPI, el: AnyNode): DonghuaCard | null {
  const a = $(el).find("a").first();
  const link = a.attr("href") || "";
  const raw =
    $(el).find(".tt h2, .tt").first().text().trim() ||
    a.attr("title")?.trim() ||
    "";
  const title = cleanTitle(raw);
  if (!link || !title) return null;

  const epLabel = $(el).find(".bt .epx").text().trim() || undefined;
  const epNum = epLabel ? Number(epLabel.replace(/\D/g, "")) || undefined : undefined;

  return {
    id: slugFromUrl(link),
    title,
    poster: imgSrc($, el),
    episodeLabel: epLabel,
    episode: epNum,
    type: $(el).find(".typez").first().text().trim() || undefined,
    url: link,
  };
}

function cardsIn($: CheerioAPI, container: CheerioEl): DonghuaCard[] {
  const out: DonghuaCard[] = [];
  container.find(".bsx").each((_, el) => {
    const c = parseCard($, el);
    if (c) out.push(c);
  });
  return out;
}

function dedupById<T extends { id: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((i) => i.id && !seen.has(i.id) && (seen.add(i.id), true));
}

function hasNextPageFn($: CheerioAPI, page: number): boolean {
  return (
    $(".pagination .next, .hpage .r, .next, .pagination a:contains('Next')").length > 0 ||
    $(`.pagination a[href*="/page/${page + 1}/"]`).length > 0
  );
}

// ── HOME ────────────────────────────────────────────────────
export async function getHome(): Promise<HomeData> {
  const $ = load(await fetchHtml(`${BASE_URL}/`));

  const popularToday = cardsIn($, $(".releases.hothome").parent());

  let latest: DonghuaCard[] = [];
  $('.releases').filter((_, el) => $(el).text().trim() === "Latest Release").each((_, rel) => {
    latest.push(...cardsIn($, $(rel).closest(".bixbox, body")));
  });
  if (!latest.length) latest = cardsIn($, $(".listupd").first());

  const recommended: DonghuaCard[] = [];
  $('.releases').filter((_, el) => $(el).text().includes("Recommendation")).each((_, rel) => {
    $(rel).parent().find(".bsx").each((_, el) => {
      const c = parseCard($, el);
      if (c) recommended.push(c);
    });
  });

  const parseWpop = (range: string): LeaderboardEntry[] => {
    const items: LeaderboardEntry[] = [];
    $(`.serieslist.wpop-${range} li, .wpop-${range} li`).each((_, el) => {
      const a = $(el).find(".leftseries h4 a, h4 a, .series").first();
      const link = a.attr("href") || $(el).find("a").attr("href") || "";
      const title = a.text().trim() || $(el).find("h4").text().trim();
      if (!title || !link) return;
      const genres: string[] = [];
      $(el).find(".leftseries span a").each((_, g) => { genres.push($(g).text().trim()); });
      items.push({
        id: slugFromUrl(link),
        rank: $(el).find(".ctr").text().trim(),
        title,
        rating: $(el).find(".numscore").first().text().trim() || null,
        genres,
        poster: imgSrc($, el),
        url: link,
      });
    });
    return items;
  };

  const genres: Genre[] = [];
  $("ul.genre li a, .genre li a").each((_, el) => {
    const title = $(el).text().trim();
    const href = $(el).attr("href") || "";
    if (title && href) genres.push({ id: slugFromUrl(href).split("/").pop() || title, title });
  });

  const heroSource = popularToday.length ? popularToday : latest;

  return {
    hero: heroSource.slice(0, 5),
    popularToday,
    latest: latest.slice(0, 24),
    recommended: dedupById(recommended).slice(0, 12),
    leaderboard: {
      weekly: parseWpop("weekly"),
      monthly: parseWpop("monthly"),
      alltime: parseWpop("alltime"),
    },
    genres,
  };
}

// ── LATEST (paginated) ──────────────────────────────────────
export async function getLatest(page = 1): Promise<Paginated<DonghuaCard>> {
  const url = page > 1 ? `${BASE_URL}/page/${page}/` : `${BASE_URL}/`;
  const $ = load(await fetchHtml(url));

  let items: DonghuaCard[] = [];
  if (page === 1) {
    $('.releases').filter((_, el) => $(el).text().trim() === "Latest Release").each((_, rel) => {
      items.push(...cardsIn($, $(rel).closest(".bixbox, body")));
    });
    if (!items.length) items = cardsIn($, $(".listupd").first());
  } else {
    items = cardsIn($, $(".listupd").first());
  }

  return { page, hasNextPage: hasNextPageFn($, page), items };
}

// ── SEARCH ───────────────────────────────────────────────────
export async function searchDonghua(query: string, page = 1): Promise<Paginated<DonghuaCard>> {
  const url = page > 1
    ? `${BASE_URL}/page/${page}/?s=${encodeURIComponent(query)}`
    : `${BASE_URL}/?s=${encodeURIComponent(query)}`;

  const $ = load(await fetchHtml(url));
  const results: DonghuaCard[] = [];
  $(".listupd .bsx, .animpost").each((_, el) => {
    const c = parseCard($, el);
    if (c) results.push(c);
  });

  return { page, hasNextPage: hasNextPageFn($, page), items: dedupById(results) };
}

// ── SCHEDULE ─────────────────────────────────────────────────
export async function getSchedule(): Promise<ScheduleMap> {
  const $ = load(await fetchHtml(`${BASE_URL}/schedule/`));
  const schedule: ScheduleMap = {};

  $(".schedulepage, .schedule-day, .days").each((_, el) => {
    const day = $(el).find("h3, h2, .day-title").first().text().trim() || $(el).attr("data-day") || "";
    if (!day) return;
    const items: ScheduleMap[string] = [];
    $(el).find(".bsx").each((__, itemEl) => {
      const a = $(itemEl).find("a").first();
      const link = a.attr("href") || "";
      const title = cleanTitle(
        $(itemEl).find(".tt h2, .tt").first().text().trim() || a.attr("title")?.trim() || ""
      );
      if (!link || !title) return;
      items.push({
        id: slugFromUrl(link),
        title,
        time: $(itemEl).find(".bt .epx").text().trim() || undefined,
        poster: imgSrc($, itemEl),
        url: link,
      });
    });
    schedule[day.toLowerCase()] = items;
  });

  return schedule;
}

// ── DETAIL ───────────────────────────────────────────────────
export async function getDetail(id: string): Promise<DonghuaDetail> {
  const cleanUrl = id.startsWith("http")
    ? id
    : id.includes("/")
      ? `${BASE_URL}/${id.replace(/^\/+|\/+$/g, "")}/`
      : `${BASE_URL}/seri/${id.replace(/^\/+|\/+$/g, "")}/`;

  const $ = load(await fetchHtml(cleanUrl));
  const title = $("h1.entry-title").text().trim();
  if (!title) throw new UpstreamError("Donghua tidak ditemukan", 404);

  const poster =
    $(".thumb img, .wp-post-image").first().attr("src") ||
    $(".thumb img").attr("data-src") ||
    $('meta[property="og:image"]').attr("content") ||
    null;

  const synopsis =
    $(".synp .entry-content, .entry-content-single").first().text().trim() ||
    $('meta[name="description"]').attr("content") ||
    "";

  const metadata: Record<string, string> = {};
  $(".info-content .spe span, .spe span").each((_, el) => {
    const raw = $(el).text().replace(/\s+/g, " ").trim();
    const m = raw.match(/^([A-Za-z ]+?):\s*(.+)$/);
    if (m) metadata[m[1].trim().toLowerCase().replace(/\s+/g, "_")] = m[2].trim();
  });

  const genres: string[] = [];
  $(".genxed a").each((_, el) => { genres.push($(el).text().trim()); });

  const episodes: EpisodeEntry[] = [];
  $(".eplister li").each((_, el) => {
    const a = $(el).find("a");
    const epLink = a.attr("href");
    if (!epLink) return;
    const num = parseInt($(el).find(".epl-num").text().trim(), 10);
    episodes.push({
      id: slugFromUrl(epLink),
      number: Number.isNaN(num) ? episodes.length + 1 : num,
      title: $(el).find(".epl-title").text().trim(),
      date: $(el).find(".epl-date").text().trim() || undefined,
      url: epLink,
    });
  });
  episodes.sort((a, b) => a.number - b.number);

  return {
    id: slugFromUrl(cleanUrl),
    title,
    alternativeTitle:
      $(".alternative .tl, .alter .tl").first().text().replace(/^Alternative:\s*/i, "").trim() || null,
    poster,
    synopsis,
    rating: $(".rating strong, .num, .ratingval").first().text().trim() || null,
    genres,
    status: metadata.status || null,
    type: metadata.type || "Donghua",
    year: metadata.released?.match(/\d{4}/)?.[0] || metadata.season || null,
    studio: metadata.studio || null,
    network: metadata.network || null,
    season: metadata.season || null,
    duration: metadata.duration || null,
    totalEpisodes: episodes.length,
    episodes,
    url: cleanUrl,
  };
}

// ── WATCH / STREAM ───────────────────────────────────────────
export async function getWatch(episodeId: string): Promise<WatchData> {
  const cleanUrl = episodeId.startsWith("http")
    ? episodeId
    : `${BASE_URL}/${episodeId.replace(/^\/+|\/+$/g, "")}/`;

  const $ = load(await fetchHtml(cleanUrl));
  const title = $("h1.entry-title").text().trim();
  if (!title) throw new UpstreamError("Episode tidak ditemukan", 404);

  const servers: ServerOption[] = [];
  $("select.mirror option").each((_, el) => {
    const name = $(el).text().trim();
    const rawVal = $(el).attr("value");
    if (!rawVal || !name || /^select/i.test(name)) return;
    const decoded = decodeBase64(rawVal);
    const src = decoded.match(/src=["']([^"']+)["']/i)?.[1];
    servers.push({
      name,
      embedUrl: src || (decoded.startsWith("http") ? decoded : null),
    });
  });

  const defaultStream =
    $(".player-embed iframe, .video-content iframe, iframe").first().attr("src") || null;

  const downloads: Record<string, DownloadLink[]> = {};
  $(".soraurlx").each((_, el) => {
    const quality = $(el).find("strong").first().text().trim() || "unknown";
    const links: DownloadLink[] = [];
    $(el).find("a").each((__, linkEl) => {
      const host = $(linkEl).text().trim();
      const url = $(linkEl).attr("href");
      if (url && host) links.push({ host, url });
    });
    if (links.length) downloads[quality] = links;
  });

  const prevUrl = $(".naveps .nvs a[rel='prev']").attr("href") || null;
  const nextUrl = $(".naveps .nvs a[rel='next']").attr("href") || null;
  const allUrl = $(".naveps .nvsc a").attr("href") || null;

  const epMatch = title.match(/Episode\s+(\d+)/i);

  return {
    id: slugFromUrl(cleanUrl),
    title,
    seriesTitle: title.split(/\s+Episode\s+\d+/i)[0].trim(),
    episodeNumber: epMatch ? Number(epMatch[1]) : null,
    defaultStream,
    servers,
    downloads,
    navigation: {
      prevId: prevUrl ? slugFromUrl(prevUrl) : null,
      nextId: nextUrl ? slugFromUrl(nextUrl) : null,
      seriesId: allUrl ? slugFromUrl(allUrl) : null,
    },
    url: cleanUrl,
  };
}
