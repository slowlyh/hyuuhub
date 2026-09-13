// ============================================================
// components/manga-card.tsx — Kartu manga glass (Server)
// href selalu /manga/<slug> — bukan URL upstream.
// ============================================================
import Link from "next/link";
import type { MangaCard } from "@/types";
import { mangaHref } from "@/lib/shinigami/slug";
import { compactNumber } from "@/lib/shinigami/adapter";

export function MangaCardView({ card, priority = false }: { card: MangaCard; priority?: boolean }) {
  const views = compactNumber(card.views);
  return (
    <Link
      href={mangaHref(card.slug)}
      className="group block overflow-hidden rounded-2xl border border-stroke bg-glass backdrop-blur-xl transition-all duration-200 hover:-translate-y-0.5 hover:border-accent/40 hover:bg-white/[0.07]"
    >
      <div className="relative aspect-[2/3] overflow-hidden bg-white/5">
        {card.cover ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.cover}
            alt={card.title}
            loading={priority ? "eager" : "lazy"}
            referrerPolicy="no-referrer"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-2xl font-bold text-faint">
            {card.title[0]}
          </div>
        )}
        <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-black/85 to-transparent" />

        {card.format && (
          <span className="absolute left-2 top-2 rounded-md border border-white/10 bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white/90 backdrop-blur-sm">
            {card.format}
          </span>
        )}
        {card.chapterLabel && (
          <span className="absolute bottom-2 left-2 rounded-md border border-white/10 bg-black/55 px-1.5 py-0.5 text-[11px] font-semibold text-white backdrop-blur-sm">
            {card.chapterLabel}
          </span>
        )}
        {card.rating ? (
          <span className="absolute right-2 top-2 rounded-md border border-white/10 bg-black/55 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300 backdrop-blur-sm">
            ★ {card.rating.toFixed(1)}
          </span>
        ) : null}
      </div>
      <div className="p-2.5">
        <h3 className="line-clamp-2 text-[13px] font-medium leading-snug text-foreground/95 transition-colors group-hover:text-accent-2">
          {card.title}
        </h3>
        {views && <p className="mt-1 text-[11px] text-faint">{views} views</p>}
      </div>
    </Link>
  );
}

export function CardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-stroke">
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

export function CardGridSkeleton({ count = 12 }: { count?: number }) {
  return (
    <CardGrid>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </CardGrid>
  );
}
