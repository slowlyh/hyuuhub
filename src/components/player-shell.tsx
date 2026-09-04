// ============================================================
// components/player-shell.tsx — Player + server selector + nav
// (Client Component — satu-satunya bagian interaktif di watch page)
// ============================================================
"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ChevronLeft, ChevronRight, Grid3x3, Server, Download,
  ExternalLink, Loader2, AlertCircle, ListVideo,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import type { WatchData, EpisodeEntry } from "@/types";

interface Props {
  watch: WatchData;
  seriesSlug: string;
  episodes: EpisodeEntry[];
  currentEpisodeId: string;
  prevId: string | null;
  nextId: string | null;
}

export function PlayerShell({
  watch, seriesSlug, episodes, currentEpisodeId, prevId, nextId,
}: Props) {
  const router = useRouter();
  const initial = watch.servers.find((s) => s.embedUrl)?.embedUrl || watch.defaultStream || "";
  const [activeServer, setActiveServer] = useState(initial);
  const [showList, setShowList] = useState(false);
  const [showDownloads, setShowDownloads] = useState(false);

  const watchUrl = (epId: string) =>
    `/watch/${encodeURIComponent(seriesSlug)}/${encodeURIComponent(epId)}`;

  // Auto next: bila iframe dimuat dan user "menonton" ≥ X detik tidak kita
  // deteksi (cross-origin). Alternatif aman: tombol Next menonjol + shortcut.
  // Keyboard shortcut ← →
  const goPrev = useCallback(() => prevId && router.push(watchUrl(prevId)), [prevId, router, seriesSlug]);
  const goNext = useCallback(() => nextId && router.push(watchUrl(nextId)), [nextId, router, seriesSlug]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;
      if (e.key === "ArrowLeft") goPrev();
      if (e.key === "ArrowRight") goNext();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [goPrev, goNext]);

  // Simpan watch history (upsert) bila login — fire & forget
  useEffect(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        await supabase
          .from("watch_history")
          .upsert(
            {
              user_id: user.id,
              series_id: seriesSlug,
              series_title: watch.seriesTitle,
              series_poster: null,
              episode_id: currentEpisodeId,
              episode_number: watch.episodeNumber,
              episode_title: watch.title,
            },
            { onConflict: "user_id,series_id" }
          );
      } catch {
        // offline/belum setup — abaikan
      }
    })();
  }, [currentEpisodeId, seriesSlug, watch.episodeNumber, watch.seriesTitle, watch.title]);

  const downloadQualities = Object.keys(watch.downloads);

  return (
    <>
      {/* Player */}
      <div className="overflow-hidden rounded-xl border border-border bg-black shadow-sm">
        {activeServer ? (
          <div className="relative aspect-video">
            <iframe
              key={activeServer} // reload penuh saat ganti server
              src={activeServer}
              title={watch.title}
              className="h-full w-full"
              allowFullScreen
              allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
            />
          </div>
        ) : (
          <div className="flex aspect-video flex-col items-center justify-center gap-3 text-center">
            <AlertCircle className="h-10 w-10 text-muted-foreground" />
            <p className="text-sm text-muted-foreground">
              Tidak ada server yang tersedia untuk episode ini.
            </p>
          </div>
        )}
      </div>

      {/* Server selector */}
      {watch.servers.length > 0 && (
        <div className="mt-3 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-3">
          <span className="inline-flex items-center gap-1 text-xs font-semibold text-muted-foreground">
            <Server className="h-3.5 w-3.5" />
            Server:
          </span>
          {watch.servers.map((s) => (
            <button
              key={s.name}
              onClick={() => s.embedUrl && setActiveServer(s.embedUrl)}
              disabled={!s.embedUrl}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-40 ${
                s.embedUrl === activeServer
                  ? "bg-foreground text-background"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {s.name}
            </button>
          ))}
          {activeServer && (
            <a
              href={activeServer}
              target="_blank"
              rel="noopener noreferrer"
              className="ml-auto inline-flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <ExternalLink className="h-3 w-3" />
              Buka di tab baru
            </a>
          )}
        </div>
      )}

      {/* Info + nav */}
      <div className="mt-3 flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0">
          <h1 className="truncate text-base font-semibold sm:text-lg">
            {watch.seriesTitle}
          </h1>
          <p className="text-sm text-muted-foreground">
            Episode {watch.episodeNumber ?? "?"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={goPrev}
            disabled={!prevId}
            aria-label="Episode sebelumnya"
            className="inline-flex h-10 flex-1 items-center justify-center gap-1 rounded-lg border border-border px-4 text-sm font-medium transition-colors hover:bg-muted disabled:opacity-40 sm:flex-none"
          >
            <ChevronLeft className="h-4 w-4" />
            Prev
          </button>
          {episodes.length > 0 && (
            <button
              onClick={() => setShowList(!showList)}
              aria-label="Daftar episode"
              className={`inline-flex h-10 flex-1 items-center justify-center gap-1 rounded-lg border px-4 text-sm font-medium transition-colors sm:flex-none ${
                showList ? "bg-foreground text-background" : "border-border hover:bg-muted"
              }`}
            >
              <Grid3x3 className="h-4 w-4" />
              <span className="hidden sm:inline">Episodes</span>
            </button>
          )}
          <button
            onClick={goNext}
            disabled={!nextId}
            aria-label="Episode berikutnya"
            className="inline-flex h-10 flex-1 items-center justify-center gap-1 rounded-lg bg-accent px-4 text-sm font-semibold text-accent-foreground transition-opacity hover:opacity-90 disabled:opacity-40 sm:flex-none"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Downloads */}
      {downloadQualities.length > 0 && (
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-card">
          <button
            onClick={() => setShowDownloads(!showDownloads)}
            className="flex w-full items-center justify-between p-3 transition-colors hover:bg-muted/50"
          >
            <span className="inline-flex items-center gap-2 text-sm font-semibold">
              <Download className="h-4 w-4 text-accent" />
              Download ({downloadQualities.length} kualitas)
            </span>
            <ChevronRight
              className={`h-4 w-4 transition-transform ${showDownloads ? "rotate-90" : ""}`}
            />
          </button>
          {showDownloads && (
            <div className="space-y-2 border-t border-border p-3">
              {downloadQualities.map((q) => (
                <div key={q} className="flex flex-wrap items-center gap-2">
                  <span className="min-w-[52px] rounded-md bg-accent/10 px-2 py-1 text-center text-xs font-bold text-accent">
                    {q}
                  </span>
                  {watch.downloads[q].map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
                    >
                      <ExternalLink className="h-3 w-3" />
                      {link.host}
                    </a>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Episode list (mobile-friendly, scrollable) */}
      {showList && episodes.length > 0 && (
        <div className="mt-3 rounded-xl border border-border bg-card p-3">
          <p className="mb-2 inline-flex items-center gap-1.5 text-sm font-semibold">
            <ListVideo className="h-4 w-4 text-accent" />
            Semua Episode ({episodes.length})
          </p>
          <div className="scrollbar-none grid max-h-72 grid-cols-5 gap-1.5 overflow-y-auto sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12">
            {episodes.map((ep, i) => (
              <Link
                key={ep.id}
                href={watchUrl(ep.id)}
                onClick={() => setShowList(false)}
                className={`flex items-center justify-center rounded-md py-2 text-xs font-semibold transition-colors ${
                  ep.id === currentEpisodeId
                    ? "bg-accent text-accent-foreground"
                    : "bg-muted text-muted-foreground hover:text-foreground"
                }`}
              >
                {ep.number || i + 1}
              </Link>
            ))}
          </div>
        </div>
      )}

      <p className="mt-3 hidden text-xs text-muted-foreground/60 lg:block">
        Tips: gunakan tombol ← → di keyboard untuk pindah episode.
      </p>
    </>
  );
}
