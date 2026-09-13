// ============================================================
// components/profile-rows.tsx — Baris riwayat + kartu favorit
// series_id = slug manga kita; episode_id = nomor chapter.
// ============================================================
import Link from "next/link";
import { RemoveFavorite } from "./remove-favorite";
import { mangaHref, readHref } from "@/lib/shinigami/slug";

interface HistoryRowData {
  series_id: string;
  series_title: string;
  series_poster: string | null;
  episode_number: number | null;
  episode_id: string;
  updated_at: string;
}

interface FavoriteRowData {
  id: string;
  series_id: string;
  series_title: string;
  series_poster: string | null;
  created_at: string;
}

export function HistoryRow({ entry }: { entry: HistoryRowData }) {
  return (
    <Link
      href={readHref(entry.series_id, entry.episode_id || "latest")}
      className="group flex items-center gap-3 px-3 py-3 transition-colors hover:bg-white/5"
    >
      {entry.series_poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.series_poster}
          alt=""
          loading="lazy"
          referrerPolicy="no-referrer"
          className="h-14 w-10 shrink-0 rounded-lg object-cover"
        />
      ) : (
        <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-lg bg-white/5 text-sm font-bold text-faint">
          {(entry.series_title || "?")[0]}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-medium group-hover:text-accent-2">{entry.series_title}</p>
        <p className="mt-0.5 text-xs text-faint">
          Ch. {entry.episode_number ?? "?"} ·{" "}
          {new Date(entry.updated_at).toLocaleDateString("id-ID")}
        </p>
      </div>
      <span className="shrink-0 text-xs font-medium text-accent-2 opacity-0 transition-opacity group-hover:opacity-100">
        Lanjut →
      </span>
    </Link>
  );
}

export function FavoriteRow({ entry }: { entry: FavoriteRowData }) {
  return (
    <div className="group relative overflow-hidden rounded-2xl border border-stroke bg-glass backdrop-blur-xl">
      <Link href={mangaHref(entry.series_id)} className="block">
        <div className="relative aspect-[2/3] bg-white/5">
          {entry.series_poster ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.series_poster}
              alt={entry.series_title}
              loading="lazy"
              referrerPolicy="no-referrer"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-2xl font-bold text-faint">
              {entry.series_title[0]}
            </div>
          )}
        </div>
        <p className="line-clamp-2 p-2 text-xs font-medium leading-snug">{entry.series_title}</p>
      </Link>
      <RemoveFavorite seriesSlug={entry.series_id} />
    </div>
  );
}
