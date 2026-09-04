// ============================================================
// app/search/page.tsx — Search (Server, pagination via URL)
// ============================================================
import { Suspense } from "react";
import Link from "next/link";
import { ChevronLeft, ChevronRight, SearchX } from "lucide-react";
import { searchDonghua } from "@/lib/anichin/adapter";
import { DonghuaCard, CardGrid } from "@/components/donghua-card";
import { SectionSkeleton, EmptyState, ErrorState } from "@/components/states";
import type { Paginated, DonghuaCard as DonghuaCardType } from "@/types";

export const metadata = {
  title: "Search",
  description: "Cari donghua favoritmu di HyuuHub.",
};

const SUGGESTIONS = [
  "Perfect World",
  "Soul Land",
  "Battle Through The Heavens",
  "Throne of Seal",
  "Renegade Immortal",
  "Martial Universe",
];

function ResultsContent({ data, q, page }: { data: Paginated<DonghuaCardType>; q: string; page: number }) {
  if (!data.items.length) {
    return (
      <EmptyState
        title={`Tidak ada hasil untuk "${q}"`}
        description="Coba kata kunci lain — judul Indonesia atau Inggris kadang berbeda."
      />
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted-foreground">
        Hasil untuk <span className="font-medium text-foreground">&quot;{q}&quot;</span>
      </p>
      <CardGrid>
        {data.items.map((d, i) => (
          <DonghuaCard key={d.id + i} donghua={d} priority={i < 6} />
        ))}
      </CardGrid>

      <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
        {page > 1 && (
          <Link
            href={`/search?q=${encodeURIComponent(q)}&page=${page - 1}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            <ChevronLeft className="h-4 w-4" />
            Sebelumnya
          </Link>
        )}
        <span className="rounded-lg bg-muted px-3 py-2 text-sm font-medium">{page}</span>
        {data.hasNextPage && (
          <Link
            href={`/search?q=${encodeURIComponent(q)}&page=${page + 1}`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-muted"
          >
            Selanjutnya
            <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </nav>
    </>
  );
}

async function SearchResults({ q, page }: { q: string; page: number }) {
  let data: Paginated<DonghuaCardType> | null = null;
  try {
    data = await searchDonghua(q, page);
  } catch {
    data = null;
  }

  if (!data) {
    return <ErrorState message="Pencarian gagal — source anichin.cafe tidak merespons." />;
  }

  return <ResultsContent data={data} q={q} page={page} />;
}

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const params = await searchParams;
  const q = (params.q || "").trim();
  const page = Math.max(1, parseInt(params.page || "1", 10) || 1);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Search</h1>
        <p className="mt-1 text-sm text-muted-foreground">Cari donghua berdasarkan judul.</p>
      </div>

      {!q ? (
        <div className="rounded-xl border border-dashed border-border px-4 py-16 text-center">
          <SearchX className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
          <h3 className="text-sm font-semibold">Mulai mencari</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Gunakan ikon kaca pembesaring di navbar, atau coba saran berikut:
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            {SUGGESTIONS.map((s) => (
              <Link
                key={s}
                href={`/search?q=${encodeURIComponent(s)}`}
                className="rounded-full border border-border px-4 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                {s}
              </Link>
            ))}
          </div>
        </div>
      ) : (
        <Suspense key={`${q}-${page}`} fallback={<SectionSkeleton count={12} />}>
          <SearchResults q={q} page={page} />
        </Suspense>
      )}
    </div>
  );
}
