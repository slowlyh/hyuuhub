// ============================================================
// app/page.tsx — HOME (Server Component)
// ============================================================
import { Suspense } from "react";
import { getHome } from "@/lib/anichin/adapter";
import { DonghuaCard, CardGrid } from "@/components/donghua-card";
import { SectionSkeleton, EmptyState, ErrorState, SectionTitle } from "@/components/states";
import { ContinueWatchingRow } from "@/components/continue-watching";
import { LeaderboardSection } from "@/components/leaderboard";
import { HeroCarousel } from "@/components/hero";
import type { HomeData } from "@/types";

export const revalidate = 300; // 5 menit

async function HomeContent() {
  let data: HomeData | null = null;
  try {
    data = await getHome();
  } catch {
    data = null;
  }

  if (!data) {
    return (
      <ErrorState message="Tidak bisa terhubung ke source donghua (anichin.cafe). Mungkin sedang down atau diblokir." />
    );
  }

  const hasAny = data.popularToday.length > 0 || data.latest.length > 0;
  if (!hasAny) {
    return (
      <EmptyState
        title="Belum ada data"
        description="Source donghua sedang tidak mengembalikan konten. Coba lagi nanti."
      />
    );
  }

  return (
    <div className="space-y-12">
      {data.hero.length > 0 && <HeroCarousel items={data.hero} />}

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

      <LeaderboardSection data={data.leaderboard} />
    </div>
  );
}

export default function HomePage() {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <Suspense fallback={null}>
        <ContinueWatchingRow />
      </Suspense>
      <Suspense fallback={<SectionSkeleton count={12} />}>
        <HomeContent />
      </Suspense>
    </div>
  );
}
