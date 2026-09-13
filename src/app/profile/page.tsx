// ============================================================
// app/profile/page.tsx — Area profil (Server)
// Riwayat baca + favorit milik user (RLS menjamin).
// ============================================================
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/states";
import { HistoryRow, FavoriteRow } from "@/components/profile-rows";

export const metadata = { title: "Profil" };

export default async function ProfilePage() {
  let supabase;
  try {
    supabase = await createClient();
  } catch {
    redirect("/login?next=/profile");
  }
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login?next=/profile");

  const [{ data: profile }, { data: history }, { data: favorites }] = await Promise.all([
    supabase.from("profiles").select("username, avatar_url, created_at").eq("id", user.id).single(),
    supabase
      .from("watch_history")
      .select("series_id, series_title, series_poster, episode_number, episode_id, updated_at")
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .limit(20),
    supabase
      .from("favorites")
      .select("id, series_id, series_title, series_poster, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(24),
  ]);

  return (
    <div className="mx-auto max-w-4xl px-4 py-8">
      {/* Header profil */}
      <div className="mb-8 flex items-center gap-4">
        <div className="btn-accent flex h-16 w-16 items-center justify-center rounded-2xl text-xl font-bold">
          {(profile?.username || user.email || "U")[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            @{profile?.username || user.email?.split("@")[0]}
          </h1>
          <p className="text-sm text-dim">{user.email}</p>
        </div>
      </div>

      {/* Riwayat baca */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Riwayat Baca</h2>
        {!history?.length ? (
          <EmptyState
            title="Belum ada riwayat"
            description="Buka chapter apa pun untuk mulai menyimpan riwayat baca."
          />
        ) : (
          <div className="glass hairline-top divide-y divide-white/5 overflow-hidden">
            {history.map((h) => (
              <HistoryRow key={h.series_id} entry={h} />
            ))}
          </div>
        )}
      </section>

      {/* Favorit */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Favorit</h2>
        {!favorites?.length ? (
          <EmptyState
            title="Belum ada favorit"
            description="Simpan manga dari halaman detailnya lewat tombol Simpan."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {favorites.map((f) => (
              <FavoriteRow key={f.id} entry={f} />
            ))}
          </div>
        )}
      </section>

      <p className="mt-10 text-center text-xs text-faint">
        Data favorit & riwayat tersimpan di akunmu sendiri (Supabase, RLS).
      </p>
    </div>
  );
}
