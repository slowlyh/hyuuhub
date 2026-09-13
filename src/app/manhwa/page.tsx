// ============================================================
// app/manhwa/page.tsx — jelajah Manhwa (format=manhwa)
// ============================================================
import { BrowseSuspense, parsePage, parseSort } from "@/components/browse";

export const revalidate = 300;

export const metadata = {
  title: "Manhwa",
  description: "Jelajahi manhwa Korea terbaru, terpopuler, dan rating tertinggi di HyuuHub.",
};

export default async function ManhwaIndex({
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
        <h1 className="text-2xl font-bold tracking-tight">Manhwa</h1>
        <p className="mt-1 text-sm text-dim">Komik Korea — sistem level, Murim, romansa, aksi vertikal berwarna.</p>
      </div>
      <BrowseSuspense basePath="/manhwa" format="manhwa" sort={sort} page={page} />
    </div>
  );
}
