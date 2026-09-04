// ============================================================
// app/donghua/[slug]/page.tsx — Detail donghua (Server)
// Dynamic metadata + OG, episode list, Watch Now
// ============================================================
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Play, Star, Clock, Calendar, Layers, ChevronLeft } from "lucide-react";
import { getDetail } from "@/lib/anichin/adapter";
import { UpstreamError } from "@/lib/anichin/scrape";
import { EmptyState } from "@/components/states";
import { FavoriteButton } from "@/components/favorite-button";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const d = await getDetail(decodeURIComponent(slug));
    const description =
      d.synopsis?.slice(0, 160) ||
      `Watch ${d.title} donghua online for free on HyuuHub.`;
    return {
      title: d.title,
      description,
      openGraph: {
        title: d.title,
        description,
        images: d.poster ? [{ url: d.poster }] : undefined,
        type: "video.tv_show",
      },
    };
  } catch {
    return { title: "Donghua tidak ditemukan" };
  }
}

export default async function DonghuaDetailPage({ params }: Props) {
  const { slug } = await params;
  const id = decodeURIComponent(slug);

  let detail = null;
  try {
    detail = await getDetail(id);
  } catch (err) {
    if (err instanceof UpstreamError && err.status === 404) notFound();
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <EmptyState
          title="Gagal memuat detail"
          description="Source anichin.cafe sedang tidak bisa diakses. Coba lagi nanti."
        />
      </div>
    );
  }

  const d = detail;
  const latestEp = d.episodes[d.episodes.length - 1];

  return (
    <div className="pb-8">
      {/* Banner blur */}
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden">
          {d.poster && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={d.poster}
              alt=""
              className="h-full w-full scale-110 object-cover opacity-20 blur-xl"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-background/40 to-background" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-8 pt-8 md:pt-12">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ChevronLeft className="h-4 w-4" />
            Kembali
          </Link>

          <div className="flex flex-col gap-6 md:flex-row">
            {/* Poster */}
            <div className="mx-auto w-40 shrink-0 sm:w-48 md:mx-0 md:w-56">
              <div className="overflow-hidden rounded-xl border border-border bg-muted shadow-sm">
                {d.poster ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.poster}
                    alt={d.title}
                    className="aspect-[2/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[2/3] items-center justify-center text-4xl font-bold text-muted-foreground">
                    {d.title[0]}
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <h1 className="text-2xl font-bold tracking-tight md:text-3xl">{d.title}</h1>
              {d.alternativeTitle && (
                <p className="mt-1 text-sm italic text-muted-foreground">{d.alternativeTitle}</p>
              )}

              {/* Meta */}
              <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                {d.rating && (
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-4 w-4 text-amber-500" />
                    {d.rating}
                  </span>
                )}
                {d.status && (
                  <span className="inline-flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    {d.status}
                  </span>
                )}
                {d.type && (
                  <span className="rounded-md bg-muted px-2 py-0.5 text-xs font-medium">
                    {d.type}
                  </span>
                )}
                {d.year && (
                  <span className="inline-flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    {d.year}
                  </span>
                )}
                {d.totalEpisodes > 0 && (
                  <span className="inline-flex items-center gap-1">
                    <Layers className="h-4 w-4" />
                    {d.totalEpisodes} eps
                  </span>
                )}
              </div>

              {/* Genre */}
              {d.genres.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {d.genres.map((g) => (
                    <Link
                      key={g}
                      href={`/search?q=${encodeURIComponent(g)}`}
                      className="rounded-full border border-border px-3 py-1 text-xs font-medium text-muted-foreground transition-colors hover:border-accent hover:text-accent"
                    >
                      {g}
                    </Link>
                  ))}
                </div>
              )}

              {/* Extra info */}
              <div className="mt-4 flex flex-wrap gap-x-6 gap-y-1 text-xs text-muted-foreground">
                {d.studio && <span>Studio: <span className="text-foreground">{d.studio}</span></span>}
                {d.network && <span>Network: <span className="text-foreground">{d.network}</span></span>}
                {d.season && <span>Season: <span className="text-foreground">{d.season}</span></span>}
                {d.duration && <span>Duration: <span className="text-foreground">{d.duration}</span></span>}
              </div>

              {/* Actions */}
              <div className="mt-6 flex flex-wrap items-center gap-3">
                {latestEp && (
                  <Link
                    href={`/watch/${encodeURIComponent(d.id)}/${encodeURIComponent(latestEp.id)}`}
                    className="inline-flex items-center gap-2 rounded-lg bg-accent px-5 py-2.5 text-sm font-semibold text-accent-foreground shadow-sm transition-all hover:opacity-90"
                  >
                    <Play className="h-4 w-4 fill-current" />
                    Watch Now
                  </Link>
                )}
                <FavoriteButton
                  seriesId={d.id}
                  seriesTitle={d.title}
                  seriesPoster={d.poster}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Synopsis */}
      <div className="mx-auto max-w-6xl px-4">
        {d.synopsis && (
          <section className="mb-8">
            <h2 className="mb-3 text-lg font-semibold tracking-tight">Synopsis</h2>
            <p className="max-w-4xl text-sm leading-relaxed text-muted-foreground">
              {d.synopsis}
            </p>
          </section>
        )}

        {/* Episodes */}
        <section>
          <h2 className="mb-4 text-lg font-semibold tracking-tight">
            Episodes ({d.totalEpisodes})
          </h2>
          {d.episodes.length === 0 ? (
            <EmptyState title="Belum ada episode" description="Episode akan muncul setelah dirilis." />
          ) : (
            <div className="grid grid-cols-5 gap-2 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
              {d.episodes.map((ep, i) => (
                <Link
                  key={ep.id}
                  href={`/watch/${encodeURIComponent(d.id)}/${encodeURIComponent(ep.id)}`}
                  className={`flex items-center justify-center rounded-lg border px-1 py-2.5 text-center text-xs font-semibold transition-all hover:-translate-y-0.5 sm:text-sm ${
                    ep.id === latestEp?.id
                      ? "border-accent bg-accent/10 text-accent"
                      : "border-border bg-card hover:border-accent hover:text-accent"
                  }`}
                  title={ep.title}
                >
                  {ep.number || i + 1}
                </Link>
              ))}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
