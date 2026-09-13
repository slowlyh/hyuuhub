// ============================================================
// components/continue-reading.tsx — Baris lanjut baca (Server)
// Baca dari Supabase watch_history (kolom lama dipakai untuk
// chapter: episode_id = nomor chapter, series_id = slug manga).
// ============================================================
import Link from "next/link";
import { BookMarked } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { readHref } from "@/lib/shinigami/slug";

export async function ContinueReadingRow() {
  let entries: Array<{
    series_id: string;
    series_title: string;
    series_poster: string | null;
    episode_id: string;
    episode_number: number | null;
  }> = [];

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const { data } = await supabase
      .from("watch_history")
      .select("series_id, series_title, series_poster, episode_id, episode_number")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(12);

    entries = data || [];
  } catch {
    return null; // Supabase belum dikonfigurasi — sembunyikan
  }

  if (!entries.length) return null;

  return (
    <section className="mb-12">
      <div className="mb-3 flex items-center gap-2">
        <BookMarked className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-dim">
          Lanjut baca
        </h2>
      </div>
      <div className="scrollbar-none -mx-4 flex gap-3 overflow-x-auto px-4 pb-2">
        {entries.map((e) => (
          <Link
            key={e.series_id}
            href={readHref(e.series_id, e.episode_id || "latest")}
            className="group flex w-60 shrink-0 gap-3 rounded-2xl border border-stroke bg-glass p-2 backdrop-blur-xl transition-colors hover:border-accent/40 hover:bg-white/[0.07]"
          >
            {e.series_poster ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={e.series_poster}
                alt=""
                loading="lazy"
                referrerPolicy="no-referrer"
                className="h-20 w-14 shrink-0 rounded-xl object-cover"
              />
            ) : (
              <div className="flex h-20 w-14 shrink-0 items-center justify-center rounded-xl bg-white/5 text-lg font-bold text-faint">
                {(e.series_title || "?")[0]}
              </div>
            )}
            <div className="min-w-0 flex-1 py-1">
              <p className="line-clamp-2 text-sm font-medium leading-snug group-hover:text-accent-2">
                {e.series_title}
              </p>
              <p className="mt-1 text-xs text-faint">
                {e.episode_number != null ? `Ch. ${e.episode_number}` : "Bab terbaru"}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
