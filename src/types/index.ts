// ============================================================
// HyuuHub — domain types
// Semua struktur data yang dikonsumsi UI — hasil normalisasi
// adapter anichin (lihat lib/anichin/*). UI tidak pernah
// menyentuh response mentah scraper.
// ============================================================

export interface DonghuaCard {
  /** slug seri — dipakai sebagai id di route /donghua/[slug] */
  id: string;
  title: string;
  poster: string | null;
  /** label episode mentah, mis. "Ep 285" */
  episodeLabel?: string;
  /** nomor episode bila ter-parsing */
  episode?: number;
  type?: string;
  url: string;
}

export interface LeaderboardEntry {
  id: string;
  rank: string;
  title: string;
  rating: string | null;
  genres: string[];
  poster: string | null;
  url: string;
}

export interface Genre {
  id: string;
  title: string;
}

export interface HomeData {
  hero: DonghuaCard[];
  popularToday: DonghuaCard[];
  latest: DonghuaCard[];
  recommended: DonghuaCard[];
  leaderboard: {
    weekly: LeaderboardEntry[];
    monthly: LeaderboardEntry[];
    alltime: LeaderboardEntry[];
  };
  genres: Genre[];
}

export interface Paginated<T> {
  page: number;
  hasNextPage: boolean;
  items: T[];
}

export interface ScheduleItem {
  id: string;
  title: string;
  time?: string;
  poster: string | null;
  url: string;
}

export type ScheduleMap = Record<string, ScheduleItem[]>;

export interface EpisodeEntry {
  id: string;
  number: number;
  title: string;
  date?: string;
  url: string;
}

export interface DonghuaDetail {
  id: string;
  title: string;
  alternativeTitle: string | null;
  poster: string | null;
  synopsis: string;
  rating: string | null;
  genres: string[];
  status: string | null;
  type: string | null;
  year: string | null;
  studio: string | null;
  network: string | null;
  season: string | null;
  duration: string | null;
  totalEpisodes: number;
  episodes: EpisodeEntry[];
  url: string;
}

export interface ServerOption {
  name: string;
  embedUrl: string | null;
}

export interface DownloadLink {
  host: string;
  url: string;
}

export interface WatchData {
  id: string;
  title: string;
  seriesTitle: string;
  episodeNumber: number | null;
  defaultStream: string | null;
  servers: ServerOption[];
  downloads: Record<string, DownloadLink[]>;
  navigation: {
    prevId: string | null;
    nextId: string | null;
    seriesId: string | null;
  };
  url: string;
}

// ── Supabase user data ─────────────────────────────────────
export interface Profile {
  id: string;
  username: string | null;
  avatar_url: string | null;
  created_at: string;
}

export interface WatchHistoryEntry {
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
