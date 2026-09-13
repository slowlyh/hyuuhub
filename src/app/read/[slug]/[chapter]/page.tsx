// ============================================================
// app/read/[slug]/[chapter]/page.tsx — Reader halaman
// URL: /read/<slug>/<chapter>  (chapter = angka / "latest")
// Data reader diambil server-side, lalu dirender ReaderShell.
// ============================================================
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { EmptyState } from "@/components/states";
import { ReaderShell } from "@/components/reader-shell";
import { UpstreamError, getChapterIndex, getReader } from "@/lib/shinigami/adapter";

export const revalidate = 120;

interface Props {
  params: Promise<{ slug: string; chapter: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug, chapter } = await params;
  try {
    const r = await getReader(decodeURIComponent(slug), decodeURIComponent(chapter));
    const title = `${r.title} Chapter ${r.chapterNumber}`;
    return {
      title,
      description: `Baca ${r.title} chapter ${r.chapterNumber} bahasa Indonesia di HyuuHub.`,
      openGraph: { title, description: `Baca ${r.title} chapter ${r.chapterNumber}.` },
    };
  } catch {
    return { title: "Baca" };
  }
}

export default async function ReadPage({ params }: Props) {
  const { slug, chapter } = await params;
  const s = decodeURIComponent(slug);
  const c = decodeURIComponent(chapter);

  let reader = null;
  let chapters: Awaited<ReturnType<typeof getChapterIndex>> = [];
  let nf = false;
  let err = false;

  try {
    reader = await getReader(s, c);
    chapters = await getChapterIndex(s).catch(() => []);
  } catch (e) {
    if (e instanceof UpstreamError && e.status === 404) nf = true;
    else err = true;
  }

  if (nf) notFound();

  if (err || !reader) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-16">
        <EmptyState
          title="Gagal memuat chapter"
          description="Source sedang tidak bisa diakses atau chapter ini belum tersedia. Coba chapter lain."
        />
      </div>
    );
  }

  return <ReaderShell reader={reader} chapters={chapters} />;
}
