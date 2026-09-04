// ============================================================
// app/page.tsx — HOME (Server Component)
// Hero, Popular, Latest, Recommended, Leaderboard,
// Continue Watching (jika login)
// ============================================================
import { Suspense } from "react";
import { getHome } from "@/lib/anichin/adapter";
import { DonghuaCard, CardGrid } from "@/components/donghua-card";
import {
  SectionSkeleton, EmptyState, ErrorState, SectionTitle,
} from "@/components/states";
import { ContinueWatchingRow } from "@/components/continue-watching";
import { LeaderboardSection } from "@/components/leaderboard";
import { HeroCarousel } from "@/components/hero";
import type { DonghuaCard as DonghuaCardType } from "@/types";

export const revalidate = 300; // 5 menit

async function HomeContent() {
  try {
    const data = await getHome();
    const hasAny =
      data.popularToday.length > 0 || data.latest.length > 0;

    if (!hasAny) {
      return <EmptyState title="Belum ada data" description="Source donghua sedang tidak mengembalikan konten. Coba lagi nanti." />;
    }

    return (
      <div className="space-y-12">
        {/* Hero */}
        {data.hero.length > 0 && <HeroCarousel items={data.hero} />}

        {/* Popular Today */}
        {data.popularToday.length > 0 && (
          <section>
            <SectionTitle title="Popular Today" href="/latest" />
            <CardGrid>
              {data.popularToday.slice(0, 12).map((d, i) => (
                <DonghuaCard key={d.id + i} donghua={d} priority={i < 6} />
              ))}
            </CardGrid>
          </section>
        )}

        {/* Latest */}
        {data.latest.length > 0 && (
          <section>
            <SectionTitle title="Latest Releases" href="/latest" />
            <CardGrid>
              {data.latest.slice(0, 12).map((d, i) => (
                <DonghuaCard key={d.id + i} donghua={d} />
              ))}
            </CardGrid>
          </section>
        )}

        {/* Recommended */}
        {data.recommended.length > 0 && (
          <section>
            <SectionTitle title="Recommended" />
            <CardGrid>
              {data.recommended.slice(0, 12).map((d, i) => (
                <DonghuaCard key={d.id + i} donghua={d} />
              ))}
            </CardGrid>
          </section>
        )}

        {/* Leaderboard */}
        <LeaderboardSection data={data.leaderboard} />
      </div>
    );
  } catch {
    return (
      <ErrorState
        message="Tidak bisa terhubung ke source donghua (anichin.cafe). Mungkin sedang down atau diblokir."
        retry={undefined}
      />
    );
  }
}

async function ContinueWatchingSection() {
  return <ContinueWatchingRow />;
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={null}>
        <ContinueWatchingSection />
      </Suspense>
      <Suspense fallback={<SectionSkeleton count={12} />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
