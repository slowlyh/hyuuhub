// ============================================================
// components/profile-rows.tsx — Baris history + kartu favorit
// HistoryRow & FavoriteRow: tautan lanjut nonton; tombol hapus favorit
// perlu interaksi → FavoriteRow jadi Client kecil.
// ============================================================
import Link from "next/link";
import { RemoveFavorite } from "./remove-favorite";

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
      href={`/watch/${encodeURIComponent(entry.series_id)}/${encodeURIComponent(entry.episode_id)}`}
      className="group flex items-center gap-3 bg-card px-3 py-3 transition-colors hover:bg-muted"
    >
      {entry.series_poster ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={entry.series_poster}
          alt=""
          loading="lazy"
          className="h-14 w-10 shrink-0 rounded-md object-cover"
        />
      ) : (
        <div className="flex h-14 w-10 shrink-0 items-center justify-center rounded-md bg-muted text-sm font-bold text-muted-foreground">
          {(entry.series_title || "?")[0]}
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="line-clamp-1 text-sm font-medium group-hover:text-accent">
          {entry.series_title}
        </p>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Ep {entry.episode_number ?? "?"} ·{" "}
          {new Date(entry.updated_at).toLocaleDateString("id-ID")}
        </p>
      </div>
      <span className="shrink-0 text-xs font-medium text-accent opacity-0 transition-opacity group-hover:opacity-100">
        Lanjut →
      </span>
    </Link>
  );
}

export function FavoriteRow({ entry }: { entry: FavoriteRowData }) {
  return (
    <div className="relative overflow-hidden rounded-lg border border-border bg-card">
      <Link href={`/donghua/${encodeURIComponent(entry.series_id)}`} className="group block">
        <div className="relative aspect-[2/3] bg-muted">
          {entry.series_poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={entry.series_poster}
              alt={entry.series_title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>
        <p className="line-clamp-2 p-2 text-xs font-medium leading-snug">{entry.series_title}</p>
      </Link>
      <RemoveFavorite seriesId={entry.series_id} />
    </div>
  );
}
