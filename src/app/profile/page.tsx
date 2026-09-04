// ============================================================
// app/profile/page.tsx — Protected profile area (Server)
// Watch history + favorites milik user (RLS menjamin).
// ============================================================
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { EmptyState } from "@/components/states";
import { HistoryRow, FavoriteRow } from "@/components/profile-rows";

export const metadata = { title: "Profile" };

export default async function ProfilePage() {
  const supabase = await createClient();
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
      {/* Header profile */}
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-accent text-xl font-bold text-accent-foreground">
          {(profile?.username || user.email || "U")[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold tracking-tight">
            @{profile?.username || user.email?.split("@")[0]}
          </h1>
          <p className="text-sm text-muted-foreground">{user.email}</p>
        </div>
      </div>

      {/* Watch history */}
      <section className="mb-10">
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Riwayat Tontonan</h2>
        {!history?.length ? (
          <EmptyState title="Belum ada riwayat" description="Tonton donghua apa pun untuk mulai menyimpan riwayat." />
        ) : (
          <div className="divide-y divide-border overflow-hidden rounded-xl border border-border">
            {history.map((h) => (
              <HistoryRow key={h.series_id} entry={h} />
            ))}
          </div>
        )}
      </section>

      {/* Favorites */}
      <section>
        <h2 className="mb-4 text-lg font-semibold tracking-tight">Favorit</h2>
        {!favorites?.length ? (
          <EmptyState
            title="Belum ada favorit"
            description="Tambahkan donghua ke favorit dari halaman detailnya."
          />
        ) : (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6">
            {favorites.map((f) => (
              <FavoriteRow key={f.id} entry={f} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
