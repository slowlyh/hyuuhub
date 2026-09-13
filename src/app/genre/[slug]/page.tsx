// ============================================================
// app/genre/[slug]/page.tsx — daftar manga per genre
// URL: /genre/action (bukan URL upstream)
// ============================================================
import type { Metadata } from "next";
import { getGenres } from "@/lib/shinigami/adapter";
import { BrowseSuspense, parsePage, parseSort } from "@/components/browse";

export const revalidate = 600;

interface Props {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string; sort?: string; format?: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const genre = decodeURIComponent(slug);
  const name = genre.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
  return {
    title: `Genre ${name}`,
    description: `Daftar manga, manhwa, dan manhua dengan genre ${name} di HyuuHub.`,
  };
}

export default async function GenrePage({ params, searchParams }: Props) {
  const [{ slug }, sp] = await Promise.all([params, searchParams]);
  const genre = decodeURIComponent(slug).toLowerCase().trim();
  const name = genre.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  // validasi genre terhadap daftar upstream (cache 1 jam).
  // Bila source sedang error → jangan klaim "tidak dikenal"; render
  // dan biar BrowseContent yang menampilkan error state.
  let known: boolean | null = null;
  try {
    const genres = await getGenres();
    known = genres.some((g) => g.slug === genre);
  } catch {
    known = null;
  }

  if (known === false) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16 text-center">
        <h1 className="text-xl font-semibold">Genre “{name}” tidak tersedia</h1>
        <p className="mt-2 text-sm text-dim">
          Belum ada judul dengan genre itu, atau genre tidak dikenal.{" "}
          <a href="/genres" className="text-accent-2 hover:underline">
            Lihat semua genre
          </a>
        </p>
      </div>
    );
  }

  const page = parsePage(sp.page);
  const format = (["manga", "manhwa", "manhua"].includes(sp.format || "") ? sp.format : "") as
    | "manga"
    | "manhwa"
    | "manhua"
    | "";
  const sort = parseSort(sp.sort);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.18em] text-faint">Genre</p>
        <h1 className="mt-1 text-2xl font-bold tracking-tight">{name}</h1>
      </div>
      <BrowseSuspense basePath={`/genre/${encodeURIComponent(genre)}`} format={format} genre={genre} sort={sort} page={page} />
    </div>
  );
}
