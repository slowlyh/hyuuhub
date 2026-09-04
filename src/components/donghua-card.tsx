// ============================================================
// components/donghua-card.tsx — Kartu donghua minimalis (Server)
// ============================================================
import Link from "next/link";
import type { DonghuaCard as DonghuaCardType } from "@/types";

export function DonghuaCard({ donghua, priority = false }: { donghua: DonghuaCardType; priority?: boolean }) {
  return (
    <Link
      href={`/donghua/${encodeURIComponent(donghua.id)}`}
      className="group block overflow-hidden rounded-lg border border-border bg-card transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-muted">
        {donghua.poster ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={donghua.poster}
            alt={donghua.title}
            loading={priority ? "eager" : "lazy"}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-muted-foreground">
            {donghua.title[0]}
          </div>
        )}
        {donghua.episodeLabel && (
          <span className="absolute bottom-2 left-2 rounded-md bg-background/90 px-1.5 py-0.5 text-[11px] font-semibold text-foreground backdrop-blur-sm">
            {donghua.episodeLabel}
          </span>
        )}
        {donghua.type && (
          <span className="absolute right-2 top-2 rounded-md bg-accent/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase text-accent-foreground">
            {donghua.type}
          </span>
        )}
      </div>
      <div className="p-2.5">
        <h3 className="line-clamp-2 text-[13px] font-medium leading-snug transition-colors group-hover:text-accent">
          {donghua.title}
        </h3>
      </div>
    </Link>
  );
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-lg border border-border">
      <div className="skeleton aspect-[2/3]" />
      <div className="space-y-2 p-2.5">
        <div className="skeleton h-3.5 w-full" />
        <div className="skeleton h-3.5 w-2/3" />
      </div>
    </div>
  );
}

export function CardGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 md:gap-4">
      {children}
    </div>
  );
}
