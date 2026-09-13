// ============================================================
// app/manhua/page.tsx — jelajah Manhua (format=manhua)
// ============================================================
import { BrowseSuspense, parsePage, parseSort } from "@/components/browse";

export const revalidate = 300;

export const metadata = {
  title: "Manhua",
  description: "Jelajahi manhua China terbaru, terpopuler, dan rating tertinggi di HyuuHub.",
};

export default async function ManhuaIndex({
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
        <h1 className="text-2xl font-bold tracking-tight">Manhua</h1>
        <p className="mt-1 text-sm text-dim">Komik China — kultivasi, reinkarnasi, dunia immortal.</p>
      </div>
      <BrowseSuspense basePath="/manhua" format="manhua" sort={sort} page={page} />
    </div>
  );
}
