// ============================================================
// components/remove-favorite.tsx (Client) — hapus favorit
// ============================================================
"use client";

import { useRouter } from "next/navigation";
import { X } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

export function RemoveFavorite({ seriesId }: { seriesId: string }) {
  const router = useRouter();

  async function remove() {
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    await supabase
      .from("favorites")
      .delete()
      .eq("user_id", user.id)
      .eq("series_id", seriesId);
    router.refresh();
  }

  return (
    <button
      onClick={remove}
      aria-label="Hapus dari favorit"
      className="absolute right-1.5 top-1.5 rounded-md bg-background/80 p-1 opacity-0 backdrop-blur-sm transition-opacity hover:text-destructive focus:opacity-100 group-hover:opacity-100"
    >
      <X className="h-3.5 w-3.5" />
    </button>
  );
}
