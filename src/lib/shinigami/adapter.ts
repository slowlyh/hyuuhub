// ============================================================
// lib/shinigami/adapter.ts — Normalizer Shinigami → tipe domain
// UI HANYA memanggil modul ini; tidak pernah menyentuh response
// mentah upstream. Semua fungsi server-only.
//
// Identity publik = slug (turunan judul). Resolusi slug → uuid
// dilakukan lewat upstream search lalu dicocokkan exact-slug,
// jadi URL /manga/<slug> tetap stabil dan bersih.
// ============================================================
import type {
  BrowseFilters, ChapterEntry, FormatKey, Genre, HomeData, MangaCard,
  MangaDetail, Paginated, RankingEntry, ReaderData, StatusKey,
} from "@/types";
import {
  UpstreamError, getAllChapters, getChapterDetail, getGenreList, getMangaDetail,
  getMangaList, getMangaTop, getImageUrls, type Meta, type RawChapter, type RawManga,
} from "./client";
import { chapterSlug, looksLikeUuid, slugify } from "./slug";

export { UpstreamError };

// ── mapping upstream → domain ───────────────────────────────
const STATUS_MAP: Record<number, StatusKey> = { 1: "ongoing", 2: "completed", 3: "hiatus" };
export const STATUS_LABEL: Record<StatusKey, string> = {
  ongoing: "Ongoing",
  completed: "Completed",
  hiatus: "Hiatus",
  unknown: "Unknown",
};

const COUNTRY_LABEL: Record<string, string> = {
  JP: "Jepang", KR: "Korea", CN: "China", TW: "Taiwan", ID: "Indonesia",
};

function statusOf(raw: number | undefined): StatusKey {
  return STATUS_MAP[raw ?? 0] ?? "unknown";
}

function formatOf(raw: RawManga): string | undefined {
  return raw.taxonomy?.Format?.[0]?.name;
}

function genresOf(raw: RawManga): Genre[] {
  return (raw.taxonomy?.Genre ?? [])
    .map((g) => ({ slug: g.slug, name: g.name }))
    .filter((g) => g.name);
}

/** angka pembulatan rapi: 3495701 → "3.5M" */
export function compactNumber(n: number | null | undefined): string | null {
  if (n == null || !Number.isFinite(n) || n <= 0) return null;
  if (n >= 1_000_000_000) return `${(n / 1_000_000_000).toFixed(1)}B`;
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return String(n);
}

export function chapterLabelOf(n: number | null | undefined): string | undefined {
  if (n == null || !Number.isFinite(n)) return undefined;
  return `Ch. ${n}`;
}

function toCard(raw: RawManga): MangaCard {
  return {
    slug: slugify(raw.title),
    mangaId: raw.manga_id,
    title: raw.title.trim(),
    cover: raw.cover_image_url || raw.cover_portrait_url || null,
    chapterLabel: chapterLabelOf(raw.latest_chapter_number),
    chapterNumber: raw.latest_chapter_number ?? undefined,
    format: formatOf(raw),
    rating: raw.user_rate || null,
    views: raw.view_count,
    status: statusOf(raw.status),
    latestChapterId: raw.latest_chapter_id ?? null,
    updatedAt: raw.latest_chapter_time || raw.updated_at || null,
  };
}

function toRanking(raw: RawManga, rank: number): RankingEntry {
  return {
    slug: slugify(raw.title),
    rank,
    title: raw.title.trim(),
    cover: raw.cover_image_url || raw.cover_portrait_url || null,
    rating: raw.user_rate || null,
    views: raw.view_count ?? null,
    format: formatOf(raw) ?? null,
    chapterNumber: raw.latest_chapter_number ?? null,
  };
}

function pagination(meta: Meta | undefined, page: number, pageSize: number) {
  const totalPage = meta?.total_page ?? 1;
  return {
    page,
    pageSize: meta?.page_size ?? pageSize,
    totalPage,
    totalRecord: meta?.total_record ?? 0,
    hasNextPage: page < totalPage,
  };
}

function dedupBySlug<T extends { slug: string }>(items: T[]): T[] {
  const seen = new Set<string>();
  return items.filter((i) => i.slug && !seen.has(i.slug) && (seen.add(i.slug), true));
}

// ── RESOLUSI SLUG → uuid upstream ───────────────────────────
/**
 * Ambil entri upstream dari slug publik.
 * 1) kalau slugLooksLikeUuid → langsung detail (fallback internal)
 * 2) upstream search q=<slug>, cocokkan slugify(title) === slug
 */
export async function resolveManga(slug: string): Promise<RawManga> {
  const clean = decodeURIComponent(slug).trim().toLowerCase();
  if (!clean) throw new UpstreamError("Slug tidak valid", 404);

  if (looksLikeUuid(clean)) {
    const det = await getMangaDetail(clean);
    if (det.data?.manga_id) return det.data;
  }

  const search = await getMangaList({ q: clean, page: 1, pageSize: 24, sort: "rank" });
  const hit = (search.data ?? []).find((m) => slugify(m.title) === clean);
  if (hit) return hit;

  throw new UpstreamError("Manga tidak ditemukan", 404);
}

// ── HOME ────────────────────────────────────────────────────
export async function getHome(): Promise<HomeData> {
  const [top, ranked, latest, recommended, rated, genres] = await Promise.all([
    getMangaTop({ filter: "daily", page: 1, pageSize: 12 }).catch(() => null),
    getMangaList({ sort: "rank", page: 1, pageSize: 12 }).catch(() => null),
    getMangaList({ sort: "latest", page: 1, pageSize: 18 }).catch(() => null),
    getMangaList({ isRecommended: true, page: 1, pageSize: 12 }).catch(() => null),
    getMangaList({ sort: "rating", page: 1, pageSize: 10 }).catch(() => null),
    getGenres().catch(() => [] as Genre[]),
  ]);

  const trending = dedupBySlug((ranked?.data ?? []).map(toCard));
  const hero = dedupBySlug([
    ...((top?.data ?? []).map(toCard)),
    ...trending,
  ]).slice(0, 7);

  return {
    hero,
    trending,
    latest: dedupBySlug((latest?.data ?? []).map(toCard)),
    recommended: dedupBySlug((recommended?.data ?? []).map(toCard)),
    hot: (top?.data ?? []).slice(0, 10).map((m, i) => toRanking(m, i + 1)),
    topRated: (rated?.data ?? []).slice(0, 10).map((m, i) => toRanking(m, i + 1)),
    genres: genres.slice(0, 24),
  };
}

// ── GENRES ──────────────────────────────────────────────────
export async function getGenres(): Promise<Genre[]> {
  const res = await getGenreList();
  return dedupBySlug(
    (res.data ?? [])
      .map((g) => ({ slug: g.slug, name: g.name }))
      .filter((g) => g.slug && g.name && g.name.toLowerCase() !== "latest")
  );
}

// ── BROWSE (format / genre / sort, paginated) ───────────────
export async function getBrowse(f: BrowseFilters = {}): Promise<Paginated<MangaCard>> {
  const page = Math.max(1, f.page ?? 1);
  const pageSize = Math.min(60, Math.max(1, f.pageSize ?? 24));
  const res = await getMangaList({
    page,
    pageSize,
    sort: f.sort ?? "latest",
    sortOrder: "desc",
    format: f.format || undefined,
    genreInclude: f.genre || undefined,
  });
  const items = dedupBySlug((res.data ?? []).map(toCard));
  const base = pagination(res.meta, page, items.length);
  return { ...base, items };
}

// ── LATEST (kompatibel route lama) ──────────────────────────
export async function getLatest(page = 1, format: FormatKey | "" = ""): Promise<Paginated<MangaCard>> {
  return getBrowse({ page, format, sort: "latest", pageSize: 24 });
}

// ── SEARCH ──────────────────────────────────────────────────
export async function searchManga(query: string, page = 1): Promise<Paginated<MangaCard>> {
  const q = query.trim();
  const res = await getMangaList({ q, page: Math.max(1, page), pageSize: 24, sort: "rank" });
  const items = dedupBySlug((res.data ?? []).map(toCard));
  const base = pagination(res.meta, Math.max(1, page), items.length);
  return { ...base, items };
}

// ── CHAPTER ENTRY (normalisasi uuid → angka slug) ───────────
function toChapterEntry(raw: RawChapter): ChapterEntry {
  return {
    id: raw.chapter_id,
    slug: chapterSlug(raw.chapter_number),
    number: raw.chapter_number,
    title: (raw.chapter_title || "").trim() || `Chapter ${raw.chapter_number}`,
    releaseDate: raw.release_date,
    views: raw.view_count,
  };
}

// ── DETAIL ──────────────────────────────────────────────────
export async function getDetail(slug: string): Promise<MangaDetail> {
  const raw = await resolveManga(slug);
  const chapters = await getAllChapters(raw.manga_id).catch(() => [] as RawChapter[]);
  const entries = chapters
    .map(toChapterEntry)
    .sort((a, b) => a.number - b.number);

  return {
    slug: slugify(raw.title),
    mangaId: raw.manga_id,
    title: raw.title.trim(),
    alternativeTitle: raw.alternative_title?.trim() || null,
    cover: raw.cover_image_url || raw.cover_portrait_url || null,
    banner: raw.cover_portrait_url || raw.cover_image_url || null,
    synopsis: (raw.description || "").trim(),
    rating: raw.user_rate || null,
    views: raw.view_count ?? null,
    bookmarks: raw.bookmark_count ?? null,
    status: statusOf(raw.status),
    format: formatOf(raw) ?? null,
    year: raw.release_year || null,
    country: COUNTRY_LABEL[raw.country_id || ""] || raw.country_id || null,
    authors: (raw.taxonomy?.Author ?? []).map((a) => a.name),
    artists: (raw.taxonomy?.Artist ?? []).map((a) => a.name),
    genres: genresOf(raw),
    totalChapters: entries.length || raw.latest_chapter_number || 0,
    chapters: entries,
    latestChapter: entries.length ? entries[entries.length - 1] : null,
  };
}

// ── READER ──────────────────────────────────────────────────
/**
 * chapter = "latest" | angka chapter ("97", "110.3") | uuid (internal fallback)
 */
export async function getReader(slug: string, chapter: string): Promise<ReaderData> {
  const raw = await resolveManga(slug);
  const want = decodeURIComponent(chapter).trim();

  const chapters = await getAllChapters(raw.manga_id);
  if (!chapters.length) throw new UpstreamError("Chapter belum tersedia", 404);
  const asc = [...chapters].sort((a, b) => a.chapter_number - b.chapter_number);

  let target: RawChapter | undefined;
  if (!want || /^(latest|terbaru)$/i.test(want)) {
    target = asc[asc.length - 1];
  } else if (looksLikeUuid(want)) {
    target = asc.find((c) => c.chapter_id === want);
  } else {
    const num = Number(want);
    if (Number.isFinite(num)) target = asc.find((c) => c.chapter_number === num);
    // deck 01 / 02: beberapa judul pakai nomor dengan padding
    if (!target && Number.isFinite(num)) {
      target = asc.find((c) => Math.abs(c.chapter_number - num) < 0.001);
    }
  }
  if (!target) throw new UpstreamError("Chapter tidak ditemukan", 404);

  const detail = await getChapterDetail(target.chapter_id);
  const ch = detail.data;
  const pages = getImageUrls(ch).map((url, index) => ({ url, index }));

  return {
    slug: slugify(raw.title),
    mangaId: raw.manga_id,
    title: raw.title.trim(),
    cover: raw.cover_image_url || raw.cover_portrait_url || null,
    chapterSlug: chapterSlug(target.chapter_number),
    chapterNumber: ch.chapter_number ?? target.chapter_number,
    chapterTitle: (ch.chapter_title || "").trim() || `Chapter ${target.chapter_number}`,
    pages,
    navigation: {
      prevChapter: ch.prev_chapter_number ?? null,
      nextChapter: ch.next_chapter_number ?? null,
    },
    totalChapters: asc.length,
    releaseDate: ch.release_date || target.release_date || null,
  };
}

/** daftar chapter ringkas untuk navigasi reader (client-light) */
export async function getChapterIndex(slug: string): Promise<ChapterEntry[]> {
  const raw = await resolveManga(slug);
  const chapters = await getAllChapters(raw.manga_id);
  return chapters.map(toChapterEntry).sort((a, b) => a.number - b.number);
}
