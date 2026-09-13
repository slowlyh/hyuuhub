// ============================================================
// components/pagination.tsx — Prev/Next berbasis URL (server)
// ============================================================
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Props {
  page: number;
  hasNext: boolean;
  /** pembangun href untuk halaman target */
  href: (page: number) => string;
}

export function Pagination({ page, hasNext, href }: Props) {
  const btn =
    "inline-flex items-center gap-1.5 rounded-xl border border-stroke bg-glass px-4 py-2 text-sm font-medium text-foreground/90 backdrop-blur-xl transition-colors hover:bg-white/10";
  const off =
    "inline-flex cursor-not-allowed items-center gap-1.5 rounded-xl border border-stroke px-4 py-2 text-sm text-faint opacity-50";

  if (page <= 1 && !hasNext) return null;

  return (
    <nav className="mt-8 flex items-center justify-center gap-3" aria-label="Pagination">
      {page > 1 ? (
        <Link href={href(page - 1)} className={btn}>
          <ChevronLeft className="h-4 w-4" />
          Sebelumnya
        </Link>
      ) : (
        <span className={off} aria-hidden>
          <ChevronLeft className="h-4 w-4" />
          Sebelumnya
        </span>
      )}
      <span className="glass px-3 py-2 text-sm font-medium tabular-nums">
        {page}
      </span>
      {hasNext ? (
        <Link href={href(page + 1)} className={btn}>
          Selanjutnya
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={off} aria-hidden>
          Selanjutnya
          <ChevronRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}
