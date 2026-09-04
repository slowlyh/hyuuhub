// ============================================================
// components/leaderboard.tsx — Tab Weekly/Monthly/All (Client)
// ============================================================
"use client";

import { useState } from "react";
import Link from "next/link";
import type { HomeData } from "@/types";

const RANGES = [
  { key: "weekly" as const, label: "Weekly" },
  { key: "monthly" as const, label: "Monthly" },
  { key: "alltime" as const, label: "All Time" },
];

export function LeaderboardSection({ data }: { data: HomeData["leaderboard"] }) {
  const [range, setRange] = useState<"weekly" | "monthly" | "alltime">("weekly");
  const entries = data[range] || [];

  if (!entries.length) return null;

  return (
    <section>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold tracking-tight">Leaderboard</h2>
        <div className="flex gap-1 rounded-lg border border-border p-0.5">
          {RANGES.map((r) => (
            <button
              key={r.key}
              onClick={() => setRange(r.key)}
              className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                range === r.key
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>
      </div>

      <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
        {entries.slice(0, 10).map((e, i) => (
          <Link
            key={e.id + i}
            href={`/donghua/${encodeURIComponent(e.id)}`}
            className="flex items-center gap-3 bg-card px-3 py-2.5 transition-colors hover:bg-muted"
          >
            <span
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-xs font-bold ${
                i === 0
                  ? "bg-yellow-400/20 text-yellow-600 dark:text-yellow-400"
                  : i === 1
                    ? "bg-zinc-400/20 text-zinc-500 dark:text-zinc-300"
                    : i === 2
                      ? "bg-orange-400/20 text-orange-600 dark:text-orange-400"
                      : "bg-muted text-muted-foreground"
              }`}
            >
              {e.rank || i + 1}
            </span>
            {e.poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={e.poster}
                alt=""
                loading="lazy"
                className="h-11 w-8 shrink-0 rounded object-cover"
              />
            )}
            <div className="min-w-0 flex-1">
              <p className="line-clamp-1 text-sm font-medium">{e.title}</p>
              <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                {e.rating && <span>★ {e.rating}</span>}
                {e.genres.slice(0, 2).map((g) => (
                  <span key={g} className="truncate">{g}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
