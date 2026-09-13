// ============================================================
// app/genres/page.tsx — Daftar genre (Server)
// Link → /genre/<slug> (slug kita, bukan URL upstream)
// ============================================================
import Link from "next/link";
import { getGenres } from "@/lib/shinigami/adapter";
import { EmptyState, ErrorState } from "@/components/states";
import type { Genre } from "@/types";

export const revalidate = 3600;

export const metadata = {
  title: "Genres",
  description: "Jelajahi manga, manhwa, dan manhua berdasarkan genre di HyuuHub.",
};

function chip(i: number) {
  const tones = [
    "hover:border-violet-400/50 hover:text-violet-300",
    "hover:border-sky-400/50 hover:text-sky-300",
    "hover:border-emerald-400/50 hover:text-emerald-300",
    "hover:border-amber-400/50 hover:text-amber-300",
    "hover:border-rose-400/50 hover:text-rose-300",
    "hover:border-cyan-400/50 hover:text-cyan-300",
  ];
  return tones[i % tones.length];
}

function GenreGrid({ genres }: { genres: Genre[] }) {
  return (
    <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {genres.map((g, i) => (
        <Link
          key={g.slug}
          href={`/genre/${encodeURIComponent(g.slug)}`}
          className={`glass glow-hover flex items-center justify-center px-3 py-5 text-sm font-semibold text-foreground/90 transition-all hover:-translate-y-0.5 ${chip(i)}`}
        >
          {g.name}
        </Link>
      ))}
    </div>
  );
}

export default async function GenresPage() {
  let genres: Genre[] | null = null;
  try {
    genres = await getGenres();
  } catch {
    genres = null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Genre</h1>
        <p className="mt-1 text-sm text-dim">
          {genres ? `${genres.length} genre tersedia.` : "Pilih genre sesuai selera."}
        </p>
      </div>

      {genres === null ? (
        <ErrorState message="Tidak bisa memuat daftar genre dari source." />
      ) : genres.length === 0 ? (
        <EmptyState title="Belum ada genre" />
      ) : (
        <GenreGrid genres={genres} />
      )}
    </div>
  );
}
