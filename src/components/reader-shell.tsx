// ============================================================
// components/reader-shell.tsx — Reader vertikal (Client)
// Webtoon-style: kolom tunggal, lazy-load gambar, progress bar,
// fit-width toggle, panel daftar chapter, ← / → ganti chapter.
// ============================================================
"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ChevronLeft, ChevronRight, ListOrdered, Loader2, Maximize2, Minimize2,
  Settings2, X,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { ChapterEntry, ReaderData } from "@/types";
import { readHref } from "@/lib/shinigami/slug";

interface Props {
  reader: ReaderData;
  chapters: ChapterEntry[];
}

export function ReaderShell({ reader, chapters }: Props) {
  const router = useRouter();
  const slug = reader.slug;

  const [fitWidth, setFitWidth] = useState(true);
  const [showList, setShowList] = useState(false);
  const [progress, setProgress] = useState(0);
  const [loaded, setLoaded] = useState<Record<number, boolean>>({});
  const scroller = useRef<HTMLDivElement>(null);

  const numbers = useMemo(() => chapters.map((c) => c.number), [chapters]);
  const idx = useMemo(
    () => numbers.findIndex((n) => n === reader.chapterNumber),
    [numbers, reader.chapterNumber]
  );
  const prev = reader.navigation.prevChapter ?? (idx > 0 ? numbers[idx - 1] : null);
  const next = reader.navigation.nextChapter ?? (idx >= 0 && idx < numbers.length - 1 ? numbers[idx + 1] : null);

  const go = useCallback(
    (n: number | null) => {
      if (n == null) return;
      router.push(readHref(slug, n));
    },
    [router, slug]
  );

  // keyboard nav
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA" || t.isContentEditable)) return;
      if (e.key === "ArrowLeft") go(prev);
      if (e.key === "ArrowRight") go(next);
      if (e.key === "Escape") setShowList(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [go, prev, next]);

  // progress baca
  useEffect(() => {
    function onScroll() {
      const el = document.documentElement;
      const max = el.scrollHeight - el.clientHeight;
      setProgress(max > 0 ? Math.min(100, (el.scrollTop / max) * 100) : 0);
    }
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [reader.pages.length]);

  // simpan progres baca (upsert) bila login — fire & forget
  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase.from("watch_history").upsert(
          {
            user_id: user.id,
            series_id: slug,
            series_title: reader.title,
            series_poster: null,
            episode_id: String(reader.chapterNumber),
            episode_number: reader.chapterNumber,
            episode_title: reader.chapterTitle,
          },
          { onConflict: "user_id,series_id" }
        );
      } catch {
        /* Supabase belum setup — abaikan */
      }
    })();
  }, [slug, reader.title, reader.chapterNumber, reader.chapterTitle]);

  const firstUnloaded = reader.pages.findIndex((_, i) => !loaded[i]);

  return (
    <div ref={scroller}>
      {/* progress bar tipis di bawah navbar */}
      <div className="sticky top-14 z-40 h-0.5 w-full bg-transparent" aria-hidden>
        <div
          className="h-full bg-[linear-gradient(90deg,#8b7cf6,#38bdf8)] transition-[width] duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* header chapter */}
      <div className="mx-auto max-w-3xl px-4 pt-4">
        <div className="glass flex flex-wrap items-center justify-between gap-2 px-3 py-2.5">
          <div className="min-w-0">
            <Link
              href={`/manga/${encodeURIComponent(slug)}`}
              className="block truncate text-xs text-dim transition-colors hover:text-foreground"
            >
              {reader.title}
            </Link>
            <p className="truncate text-sm font-semibold">
              {reader.chapterTitle}
              <span className="ml-2 text-xs font-normal text-faint">
                {idx + 1}/{reader.totalChapters}
              </span>
            </p>
          </div>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setFitWidth((v) => !v)}
              aria-label="Ubah lebar halaman"
              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-stroke text-dim transition-colors hover:bg-white/10 hover:text-foreground"
            >
              {fitWidth ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
            </button>
            <button
              onClick={() => setShowList(true)}
              aria-label="Daftar chapter"
              className="inline-flex h-8 items-center gap-1.5 rounded-lg border border-stroke px-2.5 text-xs font-medium text-dim transition-colors hover:bg-white/10 hover:text-foreground"
            >
              <ListOrdered className="h-3.5 w-3.5" />
              Chapter
            </button>
          </div>
        </div>
      </div>

      {/* halaman */}
      <div className={`mx-auto mt-4 ${fitWidth ? "max-w-3xl" : "max-w-5xl"} px-0 sm:px-4`}>
        {reader.pages.length === 0 ? (
          <div className="glass mx-4 flex aspect-video flex-col items-center justify-center gap-2 text-sm text-dim">
            <Settings2 className="h-6 w-6 text-faint" />
            Halaman tidak tersedia untuk chapter ini.
          </div>
        ) : (
          <div className="flex flex-col gap-1">
            {reader.pages.map((p, i) => (
              <div key={p.url} className="relative w-full bg-white/[0.03]">
                {!loaded[i] && (
                  <div className="skeleton flex aspect-[3/4] w-full items-center justify-center">
                    {i === firstUnloaded && <Loader2 className="h-5 w-5 animate-spin text-dim" />}
                  </div>
                )}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={p.url}
                  alt={`Halaman ${i + 1}`}
                  loading={i < 2 ? "eager" : "lazy"}
                  decoding="async"
                  referrerPolicy="no-referrer"
                  onLoad={() => setLoaded((s) => ({ ...s, [i]: true }))}
                  className={`w-full select-none ${loaded[i] ? "block" : "absolute inset-0 block opacity-0"}`}
                />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* nav bawah */}
      <div className="mx-auto mt-6 flex max-w-3xl items-center justify-between gap-3 px-4">
        <button
          onClick={() => go(prev)}
          disabled={prev == null}
          className="inline-flex h-10 items-center gap-1.5 rounded-xl border border-stroke bg-glass px-4 text-sm font-medium backdrop-blur-xl transition-colors hover:bg-white/10 disabled:opacity-40"
        >
          <ChevronLeft className="h-4 w-4" />
          Prev
        </button>
        <Link
          href={`/manga/${encodeURIComponent(slug)}`}
          className="text-sm text-dim transition-colors hover:text-foreground"
        >
          Semua chapter
        </Link>
        <button
          onClick={() => go(next)}
          disabled={next == null}
          className="btn-accent inline-flex h-10 items-center gap-1.5 px-5 text-sm"
        >
          Next
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <p className="mx-auto mt-3 hidden max-w-3xl px-4 text-center text-[11px] text-faint lg:block">
        Tip: tombol ← → di keyboard untuk pindah chapter.
      </p>

      {/* panel daftar chapter */}
      {showList && (
        <div className="fixed inset-0 z-[60] flex justify-end">
          <button
            aria-label="Tutup daftar chapter"
            onClick={() => setShowList(false)}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
          />
          <div className="relative flex h-full w-full max-w-sm flex-col border-l border-stroke bg-[rgba(8,8,12,0.92)] backdrop-blur-2xl">
            <div className="flex items-center justify-between border-b border-stroke px-4 py-3">
              <h2 className="text-sm font-semibold">Daftar Chapter ({chapters.length})</h2>
              <button
                onClick={() => setShowList(false)}
                aria-label="Tutup"
                className="inline-flex h-8 w-8 items-center justify-center rounded-lg text-dim hover:bg-white/10 hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              {[...chapters].reverse().map((c) => {
                const active = c.number === reader.chapterNumber;
                return (
                  <Link
                    key={c.id}
                    href={readHref(slug, c.number)}
                    onClick={() => setShowList(false)}
                    className={`flex items-center justify-between rounded-xl px-3 py-2 text-sm transition-colors ${
                      active
                        ? "bg-accent/15 text-accent-2"
                        : "text-foreground/85 hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate pr-3">{c.title}</span>
                    {c.releaseDate && (
                      <span className="shrink-0 text-[11px] text-faint">
                        {new Date(c.releaseDate).toLocaleDateString("id-ID", {
                          day: "2-digit",
                          month: "short",
                          year: "2-digit",
                        })}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
