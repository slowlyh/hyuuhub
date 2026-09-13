// ============================================================
// types/index.ts — domain types HyuuHub (manga/manhwa/manhua)
// Semua struktur data yang dikonsumsi UI — hasil normalisasi
// adapter shinigami (lihat lib/shinigami/*).
//
// PENTING: `slug` adalah identity publik kita (dipakai di URL:
// /manga/<slug>, /read/<slug>/<chapter>). UUID upstream
// (mangaId/chapterId) hanya dipakai internal, tidak pernah
// muncul di URL UI.
// ============================================================

export type FormatKey = "manga" | "manhwa" | "manhua";
export type StatusKey = "ongoing" | "completed" | "hiatus" | "unknown";

export interface MangaCard {
  /** slug dari judul — id publik di URL */
  slug: string;
  /** uuid upstream, internal only */
  mangaId: string;
  title: string;
  cover: string | null;
  /** label chapter mentah, mis. "Ch. 97" */
  chapterLabel?: string;
  chapterNumber?: number;
  /** Manga | Manhwa | Manhua */
  format?: string;
  rating?: number | null;
  views?: number;
  status?: StatusKey;
  /** uuid chapter terbaru — dipakai tombol "Baca" */
  latestChapterId?: string | null;
  updatedAt?: string | null;
}

export interface Genre {
  slug: string;
  name: string;
}

export interface RankingEntry {
  slug: string;
  rank: number;
  title: string;
  cover: string | null;
  rating: number | null;
  views: number | null;
  format: string | null;
  chapterNumber: number | null;
}

export interface HomeData {
  hero: MangaCard[];
  trending: MangaCard[];
  latest: MangaCard[];
  recommended: MangaCard[];
  hot: RankingEntry[];
  topRated: RankingEntry[];
  genres: Genre[];
}

export interface Paginated<T> {
  page: number;
  pageSize: number;
  totalPage: number;
  totalRecord: number;
  hasNextPage: boolean;
  items: T[];
}

export interface ChapterEntry {
  /** uuid upstream, internal only */
  id: string;
  slug: string;
  number: number;
  title: string;
  releaseDate?: string;
  views?: number;
}

export interface MangaDetail {
  slug: string;
  mangaId: string;
  title: string;
  alternativeTitle: string | null;
  cover: string | null;
  banner: string | null;
  synopsis: string;
  rating: number | null;
  views: number | null;
  bookmarks: number | null;
  status: StatusKey;
  format: string | null;
  year: string | null;
  country: string | null;
  authors: string[];
  artists: string[];
  genres: Genre[];
  totalChapters: number;
  chapters: ChapterEntry[];
  latestChapter: ChapterEntry | null;
}

export interface ReaderPage {
  url: string;
  index: number;
}

export interface ReaderData {
  slug: string;
  mangaId: string;
  title: string;
  cover: string | null;
  chapterSlug: string;
  chapterNumber: number;
  chapterTitle: string;
  pages: ReaderPage[];
  navigation: {
    prevChapter: number | null;
    nextChapter: number | null;
  };
  totalChapters: number;
  releaseDate?: string | null;
}

export interface BrowseFilters {
  format?: FormatKey | "";
  genre?: string;
  sort?: "latest" | "rank" | "bookmark" | "rating";
  page?: number;
  pageSize?: number;
}

// ── Supabase user data ─────────────────────────────────────
export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface HistoryEntry {
  id: string;
  user_id: string;
  series_id: string;
  series_title: string;
  series_poster: string | null;
  episode_id: string;
  episode_number: number | null;
  episode_title: string | null;
  updated_at: string;
}

export interface FavoriteEntry {
  id: string;
  user_id: string;
  series_id: string;
  series_title: string;
  series_poster: string | null;
  created_at: string;
}
