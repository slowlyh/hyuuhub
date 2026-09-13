// ============================================================
// components/favorite-button.tsx — Bookmark manga (Client)
// series_id = slug publik kita.
// ============================================================
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bookmark, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  seriesSlug: string;
  seriesTitle: string;
  seriesPoster: string | null;
}

export function FavoriteButton({ seriesSlug, seriesTitle, seriesPoster }: Props) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "saved" | "guest">("guest");
  const [booted, setBooted] = useState(false);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          if (alive) setBooted(true);
          return;
        }
        const { data } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("series_id", seriesSlug)
          .maybeSingle();
        if (alive) setState(data ? "saved" : "idle");
      } catch {
        if (alive) setState("idle");
      } finally {
        if (alive) setBooted(true);
      }
    })();
    return () => {
      alive = false;
    };
  }, [seriesSlug]);

  async function toggle() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?next=/manga/${encodeURIComponent(seriesSlug)}`);
      return;
    }

    setState("busy");
    try {
      if (state === "saved") {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("series_id", seriesSlug);
        setState("idle");
      } else {
        await supabase.from("favorites").insert({
          user_id: user.id,
          series_id: seriesSlug,
          series_title: seriesTitle,
          series_poster: seriesPoster,
        });
        setState("saved");
      }
      router.refresh();
    } catch {
      setState(state === "saved" ? "saved" : "idle");
    }
  }

  const saved = state === "saved";

  return (
    <button
      onClick={toggle}
      disabled={!booted || state === "busy"}
      aria-pressed={saved}
      className={`inline-flex items-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold backdrop-blur-xl transition-all ${
        saved
          ? "border-accent/60 bg-accent/15 text-accent-2"
          : "border-stroke bg-glass text-foreground/90 hover:bg-white/10"
      } disabled:opacity-60`}
    >
      {state === "busy" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Bookmark className={`h-4 w-4 ${saved ? "fill-current" : ""}`} />
      )}
      {saved ? "Tersimpan" : "Simpan"}
    </button>
  );
}
