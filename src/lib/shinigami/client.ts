// ============================================================
// lib/shinigami/client.ts — klien API Shinigami (server-only)
// Source data baru HyuuHub. Adapter dari:
//   https://code.vyrgo.cyou/shanmolvyr/shinigami/shinigami.js
//   (kreator: ShanMolvyr — attribution dipertahankan)
// Murni fetch; TIDAK tahu apa pun tentang Next.js / cheerio.
// ============================================================

export const BASE_API = "https://api.shngm.io";
export const UPSTREAM_SITE = "https://g.shinigami.asia";

const HEADERS = {
  Accept: "application/json",
  "Content-Type": "application/json",
  Origin: UPSTREAM_SITE,
  Referer: `${UPSTREAM_SITE}/`,
  "User-Agent":
    "Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36",
};

export class UpstreamError extends Error {
  status: number;
  constructor(message: string, status = 502) {
    super(message);
    this.status = status;
  }
}

export interface Meta {
  page?: number;
  page_size?: number;
  total_page?: number;
  total_record?: number;
}

export interface RawTaxonomy {
  taxonomy_id?: number;
  slug: string;
  name: string;
}

export interface RawManga {
  manga_id: string;
  title: string;
  description?: string;
  alternative_title?: string | null;
  release_year?: string | null;
  status?: number;
  cover_image_url?: string | null;
  cover_portrait_url?: string | null;
  view_count?: number;
  user_rate?: number;
  bookmark_count?: number;
  rank?: number;
  is_recommended?: boolean;
  country_id?: string;
  latest_chapter_id?: string | null;
  latest_chapter_number?: number | null;
  latest_chapter_time?: string | null;
  updated_at?: string | null;
  taxonomy?: {
    Genre?: RawTaxonomy[];
    Format?: RawTaxonomy[];
    Author?: RawTaxonomy[];
    Artist?: RawTaxonomy[];
    Type?: RawTaxonomy[];
  };
  chapters?: { chapter_id: string; chapter_number: number; created_at?: string }[];
}

export interface RawChapter {
  chapter_id: string;
  manga_id: string;
  chapter_title?: string;
  chapter_number: number;
  thumbnail_image_url?: string | null;
  view_count?: number;
  release_date?: string;
}

export interface RawChapterDetail {
  chapter_id: string;
  manga_id: string;
  chapter_number: number;
  chapter_title?: string;
  base_url: string;
  base_url_low?: string;
  chapter: { path: string; data: string[] };
  prev_chapter_id?: string | null;
  prev_chapter_number?: number | null;
  next_chapter_id?: string | null;
  next_chapter_number?: number | null;
  release_date?: string;
}

interface Envelope<T> {
  retcode: number;
  message?: string;
  meta?: Meta;
  data: T;
}

async function api<T>(path: string, revalidate = 300): Promise<Envelope<T>> {
  let res: Response;
  try {
    res = await fetch(`${BASE_API}${path}`, {
      headers: HEADERS,
      next: { revalidate },
    });
  } catch {
    throw new UpstreamError("Shinigami API tidak bisa dijangkau");
  }
  if (!res.ok) {
    throw new UpstreamError(
      `Shinigami merespons ${res.status}`,
      res.status === 404 ? 404 : 502
    );
  }
  const body = (await res.json()) as Envelope<T>;
  if (body.retcode !== 0) {
    throw new UpstreamError(
      body.message || "Upstream menolak request",
      body.retcode === 404001 ? 404 : 502
    );
  }
  return body;
}

const qs = (o: Record<string, string | number | boolean | undefined | null>) => {
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(o)) {
    if (v !== undefined && v !== null && v !== "") p.set(k, String(v));
  }
  return p.toString();
};

// ── endpoints (sama seperti shinigami.js, plus genre filter) ──

export function getMangaList(p: {
  page?: number;
  pageSize?: number;
  sort?: string;
  sortOrder?: string;
  format?: string;
  genreInclude?: string;
  genreExclude?: string;
  isRecommended?: boolean;
  isUpdate?: boolean;
  q?: string;
} = {}) {
  return api<RawManga[]>(
    `/v1/manga/list?${qs({
      page: p.page ?? 1,
      page_size: p.pageSize ?? 24,
      sort: p.sort ?? "latest",
      sort_order: p.sortOrder ?? "desc",
      format: p.format,
      genre_include: p.genreInclude,
      genre_exclude: p.genreExclude,
      is_recommended: p.isRecommended,
      is_update: p.isUpdate,
      q: p.q,
      genre_include_mode: p.genreInclude ? "or" : undefined,
      genre_exclude_mode: p.genreExclude ? "or" : undefined,
    })}`
  );
}

export function getMangaTop(p: { filter?: string; page?: number; pageSize?: number } = {}) {
  return api<RawManga[]>(
    `/v1/manga/top?${qs({
      filter: p.filter ?? "daily",
      page: p.page ?? 1,
      page_size: p.pageSize ?? 10,
    })}`
  );
}

export const getMangaDetail = (mangaId: string) =>
  api<RawManga>(`/v1/manga/detail/${encodeURIComponent(mangaId)}`);

export function getChapterList(mangaId: string, p: { page?: number; pageSize?: number; sortOrder?: string } = {}) {
  return api<RawChapter[]>(
    `/v1/chapter/${encodeURIComponent(mangaId)}/list?${qs({
      page: p.page ?? 1,
      page_size: p.pageSize ?? 1000,
      sort_by: "chapter_number",
      sort_order: p.sortOrder ?? "asc",
    })}`
  );
}

export const getChapterDetail = (chapterId: string) =>
  api<RawChapterDetail>(`/v1/chapter/detail/${encodeURIComponent(chapterId)}`);

export function getImageUrls(ch: RawChapterDetail): string[] {
  const base = ch.base_url + ch.chapter.path;
  return (ch.chapter.data ?? []).map((f) => base + f);
}

export const getGenreList = () =>
  api<RawTaxonomy[]>("/v1/genre/list", 3600);

export const getFormatList = () =>
  api<RawTaxonomy[]>("/v1/format/list?page=1", 3600);

/**
 * Chapter list untuk satu manga, di-cache lebih lama (1 jam).
 * Upstream menerima page_size besar (dihemat: cap 2000).
 */
export async function getAllChapters(mangaId: string): Promise<RawChapter[]> {
  const all: RawChapter[] = [];
  let page = 1;
  for (;;) {
    const res = await getChapterList(mangaId, { page, pageSize: 1000 });
    all.push(...res.data);
    const total = res.meta?.total_page ?? 1;
    if (page >= total || !res.data.length) break;
    page++;
  }
  return all;
}
