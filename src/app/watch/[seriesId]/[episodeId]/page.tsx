// ============================================================
// app/watch/[seriesId]/[episodeId]/page.tsx — Watch page (Server)
// Fetch data → render shell; player interaktif = Client Component.
// ============================================================
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { getWatch, getDetail } from "@/lib/anichin/adapter";
import { UpstreamError } from "@/lib/anichin/scrape";
import { EmptyState } from "@/components/states";
import { PlayerShell } from "@/components/player-shell";

export const revalidate = 120; // episode baru → 2 menit

interface Props {
  params: Promise<{ seriesId: string; episodeId: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { episodeId } = await params;
  try {
    const w = await getWatch(decodeURIComponent(episodeId));
    const title = `${w.seriesTitle} — Episode ${w.episodeNumber ?? "?"}`;
    return {
      title,
      description: `Watch ${w.seriesTitle} Episode ${w.episodeNumber ?? ""} donghua online for free on HyuuHub.`,
    };
  } catch {
    return { title: "Watch" };
  }
}

export default async function WatchPage({ params }: Props) {
  const { seriesId, episodeId } = await params;
  const epId = decodeURIComponent(episodeId);
  const seriesSlug = decodeURIComponent(seriesId);

  let watch = null;
  let episodes: Awaited<ReturnType<typeof getDetail>>["episodes"] = [];
  let failed = false;
  let notFoundFlag = false;

  try {
    const [w, detail] = await Promise.all([
      getWatch(epId),
      getDetail(seriesSlug).catch(() => null),
    ]);
    watch = w;
    episodes = detail?.episodes || [];
  } catch (err) {
    if (err instanceof UpstreamError && err.status === 404) {
      notFoundFlag = true;
    } else {
      failed = true;
    }
  }

  if (notFoundFlag) notFound();

  if (failed || !watch) {
    return (
      <div className="mx-auto max-w-5xl px-4 py-16">
        <EmptyState
          title="Gagal memuat episode"
          description="Source anichin.cafe sedang tidak bisa diakses. Coba lagi nanti."
        />
        <div className="mt-4 text-center">
          <Link href="/" className="text-sm text-accent hover:underline">
            ← Kembali ke Home
          </Link>
        </div>
      </div>
    );
  }

  const currentIndex = episodes.findIndex((e) => e.id === epId);
  const prev = currentIndex > 0 ? episodes[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < episodes.length - 1
      ? episodes[currentIndex + 1]
      : null;

  return (
    <div className="mx-auto max-w-5xl px-4 py-6">
      {/* Breadcrumb */}
      <nav className="mb-4 flex items-center gap-2 text-sm text-muted-foreground">
        <Link
          href={`/donghua/${encodeURIComponent(seriesSlug)}`}
          className="inline-flex items-center gap-1 transition-colors hover:text-foreground"
        >
          <ChevronLeft className="h-4 w-4" />
          {watch.seriesTitle}
        </Link>
        <span>/</span>
        <span className="text-foreground">
          Episode {watch.episodeNumber ?? currentIndex + 1}
        </span>
      </nav>

      <PlayerShell
        watch={watch}
        seriesSlug={seriesSlug}
        episodes={episodes}
        currentEpisodeId={epId}
        prevId={prev?.id || watch.navigation.prevId}
        nextId={next?.id || watch.navigation.nextId}
      />
    </div>
  );
}
