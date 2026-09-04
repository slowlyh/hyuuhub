// ============================================================
// app/latest/page.tsx — Latest Releases (Server, paginated)
// ============================================================
import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getLatest } from "@/lib/anichin/adapter";
import { DonghuaCard, CardGrid } from "@/components/donghua-card";
import { SectionSkeleton, EmptyState, ErrorState } from "@/components/states";
import type { Paginated, DonghuaCard as DonghuaCardType } from "@/types";

export const revalidate = 300;

export const metadata = {
  title: "Latest Releases",
  description: "Episode donghua terbaru yang baru rilis di HyuuHub.",
};

async function LatestList({ page }: { page: number }) {
  let data: Paginated<DonghuaCardType> | null = null;
  try {
    data = await getLatest(page);
  } catch {
    data = null;
  }

  if (!data) {
    return <ErrorState message="Tidak bisa memuat rilis terbaru dari anichin.cafe." />;
  }

  if (!data.items.length) {
    return <EmptyState title="Tidak ada rilis" description="Belum ada episode baru di halaman ini." />;
  }

  return (
    <>
      <CardGrid>
        {data.items.map((d, i) => (
          <DonghuaCard key={d.id + i} donghua={d} priority={i < 6} />
        ))}
      </CardGrid>

      <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
        {page > 1 ? (
          <Link
            href={`/latest?page=${page - 1}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </Link>
        ) : (
          <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground/40 opacity-50">
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </span>
        )}
        <span className="rounded-lg bg-muted px-3 py-2 text-sm font-medium">{page}</span>
        {data.hasNextPage ? (
          <Link
            href={`/latest?page=${page + 1}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4" />
          </Link>
        ) : (
          <span className="inline-flex cursor-not-allowed items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm text-muted-foreground/40 opacity-50">
            Selanjutnya
            <ChevronRight className="h-4 w-4" />
          </span>
        )}
      </nav>
    </>
  );
}

export default async function LatestPage({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  const params = await searchParams;
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Latest Releases</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Episode donghua terbaru, diperbarui berkala.
        </p>
      </div>
      <Suspense key={page} fallback={<SectionSkeleton count={18} />}>
        <LatestList page={page} />
      </Suspense>
    </div>
  );
}
