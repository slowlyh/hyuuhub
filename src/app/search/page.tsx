// ============================================================
// app/search/page.tsx — Cari judul (Server, pagination via URL)
// ============================================================
import { Suspense } from "react";
import { searchManga } from "@/lib/shinigami/adapter";
import { MangaCardView, CardGrid, CardGridSkeleton } from "@/components/manga-card";
import { Pagination } from "@/components/pagination";
import { EmptyState, ErrorState } from "@/components/states";
import { SearchBox } from "@/components/search-box";
import type { MangaCard, Paginated } from "@/types";

export const metadata = {
  title: "Cari",
  description: "Cari manga, manhwa, dan manhua favoritmu di HyuuHub.",
};

const SUGGESTIONS = [
  "Solo Leveling",
  "One Piece",
  "Nano Machine",
  "Lookism",
  "Omniscient Reader",
  "The Greatest Estate Developer",
];

async function Results({ q, page }: { q: string; page: number }) {
  let data: Paginated<MangaCard> | null = null;
  try {
    data = await searchManga(q, page);
  } catch {
    data = null;
  }

  if (!data) return <ErrorState message="Pencarian gagal — source tidak merespons." />;
  if (!data.items.length)
    return (
      <EmptyState
        title={`Tidak ada hasil untuk "${q}"`}
        description="Coba kata kunci lain — judul Inggris, Korea, atau Mandarin kadang berbeda."
      />
    );

  return (
    <>
      <p className="mb-4 text-sm text-dim">
        <span className="font-semibold text-foreground">{data.totalRecord.toLocaleString("id-ID")}</span> hasil
        untuk <span className="font-medium text-foreground">&quot;{q}&quot;</span>
      </p>
      <CardGrid>
        {data.items.map((d, i) => (
          <MangaCardView key={d.slug + i} card={d} priority={i < 6} />
        ))}
      </CardGrid>
      <Pagination
        page={data.page}
        hasNext={data.hasNextPage}
        href={(p) => `/search?q=${encodeURIComponent(q)}&page=${p}`}
      />
    </>
  );
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
        <h1 className="text-2xl font-bold tracking-tight">Cari</h1>
        <p className="mt-1 text-sm text-dim">Ketik judul manga, manhwa, atau manhua.</p>
      </div>

      <div className="mb-8 max-w-xl">
        <SearchBox initial={q} autoFocus={!q} />
      </div>

      {!q ? (
        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-[0.18em] text-faint">
            Coba judul ini
          </p>
          <div className="flex flex-wrap gap-2">
            {SUGGESTIONS.map((s) => (
              <a key={s} href={`/search?q=${encodeURIComponent(s)}`} className="pill px-3.5 py-1.5 text-sm">
                {s}
              </a>
            ))}
          </div>
        </div>
      ) : (
        <Suspense key={`${q}-${page}`} fallback={<CardGridSkeleton count={12} />}>
          <Results q={q} page={page} />
        </Suspense>
      )}
    </div>
  );
}
