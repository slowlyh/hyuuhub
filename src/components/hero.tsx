// ============================================================
// components/hero.tsx — Banner donghua pilihan (scroll-x mobile)
// Server Component — sederhana, tanpa JS client
// ============================================================
import Link from "next/link";
import type { DonghuaCard } from "@/types";

export function HeroCarousel({ items }: { items: DonghuaCard[] }) {
  return (
    <section aria-label="Featured donghua">
      <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
        {items.map((d, i) => (
          <Link
            key={d.id + i}
            href={`/donghua/${encodeURIComponent(d.id)}`}
            className="group relative w-[280px] shrink-0 snap-start overflow-hidden rounded-xl border border-border sm:w-[420px]"
          >
            <div className="relative aspect-[16/9] bg-muted">
              {d.poster && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d.poster}
                  alt={d.title}
                  loading={i === 0 ? "eager" : "lazy"}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-background via-background/40 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <h2 className="line-clamp-1 text-base font-semibold text-foreground sm:text-lg">
                  {d.title}
                </h2>
                <div className="mt-1 flex items-center gap-2 text-xs text-muted-foreground">
                  {d.type && <span>{d.type}</span>}
                  {d.episodeLabel && (
                    <>
                      <span>·</span>
                      <span>{d.episodeLabel}</span>
                    </>
                  )}
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
      <p className="mt-2 text-right text-[11px] text-muted-foreground/60 sm:hidden">
        Geser untuk lihat lainnya →
      </p>
    </section>
  );
}
