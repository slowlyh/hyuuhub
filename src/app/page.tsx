// ============================================================
// app/page.tsx — HOME (Server Component)
// ============================================================
import { Suspense } from "react";
import Link from "next/link";
import { Compass, Flame, Sparkles } from "lucide-react";
import { getHome } from "@/lib/shinigami/adapter";
import { MangaCardView, CardGrid, CardGridSkeleton } from "@/components/manga-card";
import { HeroCarousel } from "@/components/hero";
import { RankingSections } from "@/components/ranking";
import { ContinueReadingRow } from "@/components/continue-reading";
import { EmptyState, ErrorState, SectionTitle } from "@/components/states";
import type { HomeData } from "@/types";

export const revalidate = 300; // 5 menit

const FORMAT_CARDS = [
  { href: "/manga", title: "Manga", desc: "Jepang · hitam putih" },
  { href: "/manhwa", title: "Manhwa", desc: "Korea · vertikal berwarna" },
  { href: "/manhua", title: "Manhua", desc: "China · kultivasi" },
];

async function HomeContent() {
  let data: HomeData | null = null;
  try {
    data = await getHome();
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <ErrorState message="Tidak bisa terhubung ke source komik. Source sedang down atau diblokir — coba lagi sebentar." />
    );
  }

  const hasAny = data.latest.length > 0 || data.trending.length > 0;
  if (!hasAny) {
    return (
      <EmptyState
        title="Belum ada data"
        description="Source sedang tidak mengembalikan konten. Coba lagi nanti."
      />
    );
  }

  return (
    <div className="space-y-12">
      {data.hero.length > 0 && <HeroCarousel items={data.hero} />}

      {/* pintu format */}
      <section className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {FORMAT_CARDS.map((f) => (
          <Link
            key={f.href}
            href={f.href}
            className="glass glow-hover flex items-center justify-between px-4 py-4"
          >
            <div>
              <p className="text-sm font-semibold">{f.title}</p>
              <p className="mt-0.5 text-xs text-faint">{f.desc}</p>
            </div>
            <Compass className="h-4 w-4 text-dim" />
          </Link>
        ))}
      </section>

      {data.latest.length > 0 && (
        <section>
          <SectionTitle title="Rilis Terbaru" href="/latest" sub="Chapter yang paling baru keluar" />
          <CardGrid>
            {data.latest.slice(0, 12).map((d, i) => (
              <MangaCardView key={d.slug + i} card={d} priority={i < 6} />
            ))}
          </CardGrid>
        </section>
      )}

      <RankingSections hot={data.hot} topRated={data.topRated} />

      {data.recommended.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-accent" />
            <h2 className="text-lg font-semibold tracking-tight">Rekomendasi</h2>
          </div>
          <CardGrid>
            {data.recommended.map((d, i) => (
              <MangaCardView key={d.slug + i} card={d} />
            ))}
          </CardGrid>
        </section>
      )}

      {data.trending.length > 0 && (
        <section>
          <div className="mb-4 flex items-center gap-2">
            <Flame className="h-4 w-4 text-orange-400" />
            <h2 className="text-lg font-semibold tracking-tight">Sedang Dibaca Orang</h2>
          </div>
          <CardGrid>
            {data.trending.slice(0, 12).map((d, i) => (
              <MangaCardView key={d.slug + i} card={d} />
            ))}
          </CardGrid>
        </section>
      )}

      {data.genres.length > 0 && (
        <section>
          <SectionTitle title="Genre" href="/genres" />
          <div className="flex flex-wrap gap-2">
            {data.genres.map((g) => (
              <Link key={g.slug} href={`/genre/${encodeURIComponent(g.slug)}`} className="pill">
                {g.name}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-6">
      <Suspense fallback={null}>
        <ContinueReadingRow />
      </Suspense>
      <Suspense fallback={<CardGridSkeleton count={12} />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
