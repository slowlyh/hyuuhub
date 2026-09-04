// ============================================================
// components/continue-watching.tsx — Baris lanjut nonton (Server)
// Hanya dirender bila user punya watch_history.
// ============================================================
import Link from "next/link";
import { PlayCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export async function ContinueWatchingRow() {
  let entries: Array<{
    series_id: string;
    series_title: string;
    series_poster: string | null;
    episode_number: number | null;
  }> = [];

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("watch_history")
      .select("series_id, series_title, series_poster, episode_number")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(12);

    entries = data || [];
  } catch {
    return null; // Supabase belum dikonfigurasi — sembunyikan section
  }

  if (!entries.length) return null;

  return (
    <section className="mb-10">
      <div className="mb-4 flex items-center gap-2">
        <PlayCircle className="h-5 w-5 text-accent" />
        <h2 className="text-lg font-semibold tracking-tight">Continue Watching</h2>
      </div>
      <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {entries.map((e) => (
          <Link
            key={e.series_id}
            href={`/donghua/${encodeURIComponent(e.series_id)}`}
            className="group flex w-56 shrink-0 gap-3 rounded-xl border border-border bg-card p-2 transition-colors hover:bg-muted"
          >
            {e.series_poster && (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={e.series_poster}
                alt=""
                loading="lazy"
                className="h-20 w-14 shrink-0 rounded-lg object-cover"
              />
            )}
            <div className="min-w-0 flex-1 py-1">
              <p className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-accent">
                {e.series_title}
              </p>
              {e.episode_number != null && (
                <p className="mt-1 text-xs text-muted-foreground">
                  Ep {e.episode_number}
                </p>
              )}
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
