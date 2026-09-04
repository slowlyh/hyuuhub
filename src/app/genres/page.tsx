// ============================================================
// app/genres/page.tsx — Daftar genre (Server)
// ============================================================
import Link from "next/link";
import { getHome } from "@/lib/anichin/adapter";
import { EmptyState, ErrorState } from "@/components/states";
import type { Genre } from "@/types";

export const revalidate = 3600;

export const metadata = {
  title: "Genres",
  description: "Jelajahi donghua berdasarkan genre di HyuuHub.",
};

const COLORS = [
  "bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 dark:text-blue-400",
  "bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400",
  "bg-amber-500/10 hover:bg-amber-500/20 text-amber-600 dark:text-amber-400",
  "bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400",
  "bg-violet-500/10 hover:bg-violet-500/20 text-violet-600 dark:text-violet-400",
  "bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-600 dark:text-cyan-400",
  "bg-orange-500/10 hover:bg-orange-500/20 text-orange-600 dark:text-orange-400",
  "bg-teal-500/10 hover:bg-teal-500/20 text-teal-600 dark:text-teal-400",
];

function GenreGrid({ genres }: { genres: Genre[] }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {genres.map((g, i) => (
        <Link
          key={g.id + g.title}
          href={`/search?q=${encodeURIComponent(g.title)}`}
          className={`flex items-center justify-center rounded-xl px-4 py-6 text-sm font-semibold transition-all hover:-translate-y-0.5 ${COLORS[i % COLORS.length]}`}
        >
          {g.title}
        </Link>
      ))}
    </div>
  );
}

export default async function GenresPage() {
  let genres: Genre[] | null = null;
  try {
    genres = (await getHome()).genres;
  } catch {
    genres = null;
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Genres</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Pilih genre untuk mencari donghua sesuai selera.
        </p>
      </div>

      {genres === null ? (
        <ErrorState message="Tidak bisa memuat daftar genre." />
      ) : genres.length === 0 ? (
        <EmptyState title="Belum ada genre" />
      ) : (
        <GenreGrid genres={genres} />
      )}
    </div>
  );
}
