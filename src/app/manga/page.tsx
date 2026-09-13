// ============================================================
// app/manga/page.tsx — jelajah Manga (format=manga)
// ============================================================
import { BrowseSuspense, parsePage, parseSort } from "@/components/browse";

export const revalidate = 300;

export const metadata = {
  title: "Manga",
  description: "Jelajahi manga Jepang terbaru, terpopuler, dan rating tertinggi di HyuuHub.",
};

export default async function MangaIndex({
  searchParams,
}: {
  searchParams: Promise<{ page?: string; sort?: string; format?: string }>;
}) {
  const params = await searchParams;
  const page = parsePage(params.page);
  const sort = parseSort(params.sort);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Manga</h1>
        <p className="mt-1 text-sm text-dim">Komik asal Jepang — shounen, seinen, slice of life.</p>
      </div>
      <BrowseSuspense basePath="/manga" format="manga" sort={sort} page={page} />
    </div>
  );
}
