// ============================================================
// components/ranking.tsx — Ranking harian vs rating tertinggi (glass)
// Server component — dua kolom, tab-free, minimalis.
// ============================================================
import Link from "next/link";
import { Flame, Trophy } from "lucide-react";
import type { RankingEntry } from "@/types";
import { mangaHref } from "@/lib/shinigami/slug";
import { compactNumber } from "@/lib/shinigami/adapter";

function RankList({
  title,
  icon,
  entries,
  metric,
}: {
  title: string;
  icon: React.ReactNode;
  entries: RankingEntry[];
  metric: "views" | "rating";
}) {
  if (!entries.length) return null;
  return (
    <div className="glass hairline-top overflow-hidden">
      <div className="flex items-center gap-2 border-b border-stroke px-4 py-3">
        {icon}
        <h3 className="text-sm font-semibold tracking-tight">{title}</h3>
      </div>
      <ol className="divide-y divide-white/5">
        {entries.map((e, i) => (
          <li key={e.slug + i}>
            <Link
              href={mangaHref(e.slug)}
              className="flex items-center gap-3 px-3 py-2.5 transition-colors hover:bg-white/5"
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg text-xs font-bold ${
                  i === 0
                    ? "bg-amber-400/15 text-amber-300"
                    : i === 1
                      ? "bg-zinc-300/10 text-zinc-200"
                      : i === 2
                        ? "bg-orange-400/15 text-orange-300"
                        : "bg-white/5 text-dim"
                }`}
              >
                {e.rank || i + 1}
              </span>
              {e.cover ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={e.cover}
                  alt=""
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  className="h-12 w-8 shrink-0 rounded-md object-cover"
                />
              ) : (
                <div className="flex h-12 w-8 shrink-0 items-center justify-center rounded-md bg-white/5 text-xs font-bold text-faint">
                  {e.title[0]}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <p className="line-clamp-1 text-sm font-medium">{e.title}</p>
                <div className="mt-0.5 flex items-center gap-2 text-[11px] text-faint">
                  {e.format && <span>{e.format}</span>}
                  {e.chapterNumber != null && (
                    <>
                      <span>·</span>
                      <span>Ch. {e.chapterNumber}</span>
                    </>
                  )}
                </div>
              </div>
              <span className="shrink-0 text-right text-[11px] font-semibold text-dim">
                {metric === "views"
                  ? compactNumber(e.views) ?? "—"
                  : e.rating
                    ? `★ ${e.rating.toFixed(1)}`
                    : "—"}
              </span>
            </Link>
          </li>
        ))}
      </ol>
    </div>
  );
}

export function RankingSections({
  hot,
  topRated,
}: {
  hot: RankingEntry[];
  topRated: RankingEntry[];
}) {
  if (!hot.length && !topRated.length) return null;
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      <RankList
        title="Paling Banyak Dibaca"
        metric="views"
        entries={hot}
        icon={<Flame className="h-4 w-4 text-orange-400" />}
      />
      <RankList
        title="Rating Tertinggi"
        metric="rating"
        entries={topRated}
        icon={<Trophy className="h-4 w-4 text-amber-300" />}
      />
    </section>
  );
}
