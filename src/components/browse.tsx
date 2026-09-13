// ============================================================
// components/browse.tsx — helper halaman jelajah (format/genre)
// Dipakai /manga /manhwa /manhua dan /genre/[slug]
// ============================================================
import { Suspense } from "react";
import { getBrowse } from "@/lib/shinigami/adapter";
import { MangaCardView, CardGrid, CardGridSkeleton } from "@/components/manga-card";
import { Pagination } from "@/components/pagination";
import { EmptyState, ErrorState } from "@/components/states";
import { FormatTabs } from "@/components/format-tabs";
import type { FormatKey, MangaCard, Paginated } from "@/types";

export const SORTS = ["latest", "rank", "bookmark", "rating"] as const;
export type SortKey = (typeof SORTS)[number];

export function parseSort(v: string | undefined): SortKey {
  return (SORTS as readonly string[]).includes(v || "") ? (v as SortKey) : "latest";
}

export function parsePage(v: string | undefined): number {
  return Math.max(1, parseInt(v || "1", 10) || 1);
}

export interface BrowseProps {
  /** route tempat halaman ini berada, mis. "/manga" atau "/genre/action" */
  basePath: string;
  format: FormatKey | "";
  genre?: string;
  sort: SortKey;
  page: number;
}

function query(page: number, extra: { format?: string; genre?: string; sort?: string }) {
  const q = new URLSearchParams();
  if (extra.format) q.set("format", extra.format);
  if (extra.genre) q.set("genre", extra.genre);
  q.set("sort", extra.sort || "latest");
  q.set("page", String(page));
  return q.toString();
}

async function BrowseContent(props: BrowseProps) {
  let data: Paginated<MangaCard> | null = null;
  try {
    data = await getBrowse({
      format: props.format || undefined,
      genre: props.genre,
      sort: props.sort,
      page: props.page,
      pageSize: 24,
    });
  } catch {
    data = null;
  }

  if (!data) return <ErrorState message="Tidak bisa memuat daftar dari source. Coba lagi sebentar." />;
  if (!data.items.length)
    return <EmptyState title="Tidak ada hasil" description="Coba filter, sort, atau halaman lain." />;

  return (
    <>
      <CardGrid>
        {data.items.map((d, i) => (
          <MangaCardView key={d.slug + i} card={d} priority={i < 6} />
        ))}
      </CardGrid>
      <p className="mt-3 text-right text-xs text-faint">
        {data.totalRecord.toLocaleString("id-ID")} judul · {data.totalPage} halaman
      </p>
      <Pagination
        page={data.page}
        hasNext={data.hasNextPage}
        href={(p) => `${props.basePath}?${query(p, props)}`}
      />
    </>
  );
}

function BrowseInner(props: BrowseProps) {
  return (
    <>
      <FormatTabs
        basePath={props.basePath}
        format={props.format}
        genre={props.genre}
        sort={props.sort}
      />
      <BrowseContent {...props} />
    </>
  );
}

export function BrowseSuspense(props: BrowseProps) {
  return (
    <Suspense key={JSON.stringify(props)} fallback={<CardGridSkeleton count={18} />}>
      <BrowseInner {...props} />
    </Suspense>
  );
}
