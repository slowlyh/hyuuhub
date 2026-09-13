// ============================================================
// components/hero.tsx — Banner manga pilihan (glass, scroll-x)
// Server Component — tanpa JS client.
// ============================================================
import Link from "next/link";
import { BookOpen, Star } from "lucide-react";
import type { MangaCard } from "@/types";
import { mangaHref } from "@/lib/shinigami/slug";

export function HeroCarousel({ items }: { items: MangaCard[] }) {
  if (!items.length) return null;
  return (
    <section aria-label="Pilihan hari ini">
      <div className="mb-3 flex items-center gap-2">
        <BookOpen className="h-4 w-4 text-accent" />
        <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-dim">
          Populer sekarang
        </h2>
      </div>
      <div className="scrollbar-none -mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2">
        {items.map((d, i) => (
          <Link
            key={d.slug + i}
            href={mangaHref(d.slug)}
            className="group relative w-[300px] shrink-0 snap-start overflow-hidden rounded-2xl border border-stroke bg-glass backdrop-blur-xl transition-colors hover:border-accent/40 sm:w-[460px]"
          >
            <div className="relative aspect-[16/9] bg-white/5">
              {d.cover && (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={d.cover}
                  alt={d.title}
                  loading={i === 0 ? "eager" : "lazy"}
                  referrerPolicy="no-referrer"
                  className="h-full w-full object-cover opacity-70 transition-all duration-500 group-hover:scale-105 group-hover:opacity-85"
                />
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/55 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 flex items-end gap-3 p-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                    {d.format && (
                      <span className="pill border-white/15 bg-white/10 text-white/85">{d.format}</span>
                    )}
                    {d.chapterLabel && (
                      <span className="pill border-white/15 bg-white/10 text-white/85">{d.chapterLabel}</span>
                    )}
                    {d.rating ? (
                      <span className="pill border-amber-400/25 bg-amber-400/10 text-amber-300">
                        <Star className="h-3 w-3 fill-current" />
                        {d.rating.toFixed(1)}
                      </span>
                    ) : null}
                  </div>
                  <h3 className="mt-2 line-clamp-2 text-base font-semibold text-white sm:text-lg">
                    {d.title}
                  </h3>
                </div>
                {d.latestChapterId && (
                  <span
                    role="presentation"
                    className="btn-accent hidden shrink-0 items-center gap-1.5 px-4 py-2 text-xs sm:inline-flex"
                  >
                    Baca
                  </span>
                )}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}
