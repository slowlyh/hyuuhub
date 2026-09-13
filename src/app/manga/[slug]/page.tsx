// ============================================================
// app/manga/[slug]/page.tsx — Detail manga (Server)
// URL: /manga/<slug> — slug turunan judul, bukan URL upstream.
// ============================================================
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft, BookOpen, Clock, Eye, Globe2, Layers,
  Star, TrendingUp, Users,
} from "lucide-react";
import { STATUS_LABEL, UpstreamError, compactNumber, getDetail } from "@/lib/shinigami/adapter";
import { EmptyState } from "@/components/states";
import { FavoriteButton } from "@/components/favorite-button";
import { readHref } from "@/lib/shinigami/slug";
import type { MangaDetail } from "@/types";

export const revalidate = 300;

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const d = await getDetail(decodeURIComponent(slug));
    const description =
      d.synopsis?.slice(0, 160) || `Baca ${d.title} bahasa Indonesia gratis di HyuuHub.`;
    return {
      title: d.title,
      description,
      openGraph: {
        title: d.title,
        description,
        images: d.cover ? [{ url: d.cover }] : undefined,
        type: "website",
      },
    };
  } catch {
    return { title: "Judul tidak ditemukan" };
  }
}

async function load(slug: string): Promise<{ d: MangaDetail | null; nf: boolean; err: boolean }> {
  try {
    return { d: await getDetail(slug), nf: false, err: false };
  } catch (e) {
    if (e instanceof UpstreamError && e.status === 404) return { d: null, nf: true, err: false };
    return { d: null, nf: false, err: true };
  }
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="glass flex items-center gap-2.5 px-3 py-2">
      <span className="text-dim">{icon}</span>
      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-wider text-faint">{label}</p>
        <p className="truncate text-sm font-semibold tabular-nums">{value}</p>
      </div>
    </div>
  );
}

export default async function MangaDetailPage({ params }: Props) {
  const { slug } = await params;
  const id = decodeURIComponent(slug);
  const { d, nf, err } = await load(id);

  if (nf) notFound();

  if (err || !d) {
    return (
      <div className="mx-auto max-w-6xl px-4 py-16">
        <EmptyState
          title="Gagal memuat detail"
          description="Source sedang tidak bisa diakses. Coba lagi sebentar."
        />
      </div>
    );
  }

  const first = d.chapters[0];
  const latest = d.latestChapter;

  return (
    <div className="pb-10">
      {/* banner */}
      <div className="relative">
        <div className="absolute inset-0 overflow-hidden" aria-hidden>
          {d.banner && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={d.banner}
              alt=""
              referrerPolicy="no-referrer"
              className="h-full w-full scale-110 object-cover opacity-15 blur-2xl"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/60 to-black" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 pb-6 pt-6">
          <Link
            href="/"
            className="mb-6 inline-flex items-center gap-1 text-sm text-dim transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Kembali
          </Link>

          <div className="flex flex-col gap-6 md:flex-row">
            {/* cover */}
            <div className="mx-auto w-40 shrink-0 sm:w-48 md:mx-0 md:w-56">
              <div className="overflow-hidden rounded-2xl border border-stroke bg-white/5 shadow-2xl">
                {d.cover ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={d.cover}
                    alt={d.title}
                    referrerPolicy="no-referrer"
                    className="aspect-[2/3] w-full object-cover"
                  />
                ) : (
                  <div className="flex aspect-[2/3] items-center justify-center text-4xl font-bold text-faint">
                    {d.title[0]}
                  </div>
                )}
              </div>
            </div>

            {/* info */}
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                {d.format && <span className="pill border-white/15 bg-white/10 text-white/85">{d.format}</span>}
                <span
                  className={`pill border-white/15 text-white/85 ${
                    d.status === "ongoing"
                      ? "bg-emerald-400/15 text-emerald-300"
                      : d.status === "completed"
                        ? "bg-sky-400/15 text-sky-300"
                        : "bg-amber-400/15 text-amber-300"
                  }`}
                >
                  {STATUS_LABEL[d.status]}
                </span>
                {d.year && <span className="pill border-white/15 bg-white/10 text-white/85">{d.year}</span>}
              </div>

              <h1 className="mt-3 text-2xl font-bold leading-tight tracking-tight md:text-3xl">{d.title}</h1>
              {d.alternativeTitle && (
                <p className="mt-1.5 line-clamp-2 text-xs italic text-faint">{d.alternativeTitle}</p>
              )}

              <div className="mt-5 grid max-w-lg grid-cols-2 gap-2 sm:grid-cols-4">
                <Stat icon={<Star className="h-4 w-4" />} label="Rating" value={d.rating ? d.rating.toFixed(1) : "—"} />
                <Stat icon={<Eye className="h-4 w-4" />} label="Views" value={compactNumber(d.views) ?? "—"} />
                <Stat icon={<Users className="h-4 w-4" />} label="Bookmark" value={compactNumber(d.bookmarks) ?? "—"} />
                <Stat icon={<Layers className="h-4 w-4" />} label="Chapter" value={String(d.totalChapters || "—")} />
              </div>

              {d.genres.length > 0 && (
                <div className="mt-5 flex flex-wrap gap-2">
                  {d.genres.map((g) => (
                    <Link key={g.slug} href={`/genre/${encodeURIComponent(g.slug)}`} className="pill">
                      {g.name}
                    </Link>
                  ))}
                </div>
              )}

              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-1 text-xs text-faint">
                {d.authors.length > 0 && <span>Penulis: <span className="text-foreground/85">{d.authors.join(", ")}</span></span>}
                {d.artists.length > 0 && <span>Penggambar: <span className="text-foreground/85">{d.artists.join(", ")}</span></span>}
                {d.country && <span className="inline-flex items-center gap-1"><Globe2 className="h-3 w-3" /> {d.country}</span>}
              </div>

              <div className="mt-7 flex flex-wrap items-center gap-3">
                {latest && (
                  <Link
                    href={readHref(d.slug, latest.number)}
                    className="btn-accent inline-flex items-center gap-2 px-5 py-2.5 text-sm"
                  >
                    <BookOpen className="h-4 w-4" />
                    Baca Ch. {latest.number}
                  </Link>
                )}
                {first && first.number !== latest?.number && (
                  <Link
                    href={readHref(d.slug, first.number)}
                    className="inline-flex items-center gap-2 rounded-xl border border-stroke bg-glass px-4 py-2.5 text-sm font-semibold backdrop-blur-xl transition-colors hover:bg-white/10"
                  >
                    <TrendingUp className="h-4 w-4" />
                    Dari awal
                  </Link>
                )}
                <FavoriteButton seriesSlug={d.slug} seriesTitle={d.title} seriesPoster={d.cover} />
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-6 max-w-6xl px-4">
        {/* sinopsis */}
        <section className="mb-10">
          <h2 className="mb-3 text-lg font-semibold tracking-tight">Sinopsis</h2>
          <p className="max-w-4xl whitespace-pre-line text-sm leading-relaxed text-dim">
            {d.synopsis || "Belum ada sinopsis untuk judul ini."}
          </p>
        </section>

        {/* daftar chapter */}
        <section>
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-lg font-semibold tracking-tight">
              Chapter <span className="text-dim">({d.chapters.length})</span>
            </h2>
            <p className="text-xs text-faint">Klik untuk baca · urut dari terbaru</p>
          </div>

          {d.chapters.length === 0 ? (
            <EmptyState title="Belum ada chapter" description="Chapter akan muncul setelah dirilis." />
          ) : (
            <div className="glass hairline-top divide-y divide-white/5 overflow-hidden">
              <div className="scrollbar-none max-h-[560px] overflow-y-auto">
                {[...d.chapters].reverse().map((c) => (
                  <Link
                    key={c.id}
                    href={readHref(d.slug, c.number)}
                    className="group flex items-center justify-between gap-3 px-4 py-3 transition-colors hover:bg-white/5"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium group-hover:text-accent-2">{c.title}</p>
                      {c.releaseDate && (
                        <p className="mt-0.5 flex items-center gap-1 text-[11px] text-faint">
                          <Clock className="h-3 w-3" />
                          {new Date(c.releaseDate).toLocaleDateString("id-ID", {
                            day: "numeric", month: "short", year: "numeric",
                          })}
                        </p>
                      )}
                    </div>
                    <span className="shrink-0 rounded-lg border border-stroke px-2 py-1 text-[11px] font-semibold tabular-nums text-dim group-hover:border-accent/40 group-hover:text-accent-2">
                      Ch. {c.number}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
