// ============================================================
// components/favorite-button.tsx — Bookmark donghua (Client)
// Bila belum login → arahkan ke /login.
// ============================================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Heart, Loader2 } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  seriesId: string;
  seriesTitle: string;
  seriesPoster: string | null;
}

export function FavoriteButton({ seriesId, seriesTitle, seriesPoster }: Props) {
  const router = useRouter();
  const [state, setState] = useState<"idle" | "busy" | "faved" | "guest">("guest");
  const [booted, setBooted] = useState(false);

  // cek status favorit saat mount
  useState(() => {
    (async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
          setBooted(true);
          return;
        }
        const { data } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("series_id", seriesId)
          .maybeSingle();
        setState(data ? "faved" : "idle");
      } catch {
        setState("idle");
      } finally {
        setBooted(true);
      }
    })();
  });

  async function toggle() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      router.push(`/login?next=/donghua/${encodeURIComponent(seriesId)}`);
      return;
    }

    setState("busy");
    try {
      if (state === "faved") {
        await supabase
          .from("favorites")
          .delete()
          .eq("user_id", user.id)
          .eq("series_id", seriesId);
        setState("idle");
      } else {
        await supabase.from("favorites").insert({
          user_id: user.id,
          series_id: seriesId,
          series_title: seriesTitle,
          series_poster: seriesPoster,
        });
        setState("faved");
      }
      router.refresh();
    } catch {
      setState(state === "faved" ? "faved" : "idle");
    }
  }

  const faved = state === "faved";

  return (
    <button
      onClick={toggle}
      disabled={!booted || state === "busy"}
      aria-pressed={faved}
      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold transition-all ${
        faved
          ? "border-rose-500 bg-rose-500/10 text-rose-600 dark:text-rose-400"
          : "border-border hover:bg-muted"
      } disabled:opacity-60`}
    >
      {state === "busy" ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Heart className={`h-4 w-4 ${faved ? "fill-current" : ""}`} />
      )}
      {faved ? "Favorit" : "Tambah Favorit"}
    </button>
  );
}
