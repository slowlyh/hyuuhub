// ============================================================
// components/search-box.tsx — form pencarian (Client minimal)
// ============================================================
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Search } from "lucide-react";

export function SearchBox({ initial = "", autoFocus = false }: { initial?: string; autoFocus?: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState(initial);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const t = q.trim();
    if (!t) return;
    router.push(`/search?q=${encodeURIComponent(t)}`);
  }

  return (
    <form onSubmit={submit} className="relative">
      <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-faint" />
      <input
        value={q}
        onChange={(e) => setQ(e.target.value)}
        autoFocus={autoFocus}
        type="search"
        placeholder="Cari judul manga, manhwa, manhua…"
        aria-label="Cari"
        className="w-full rounded-xl border border-stroke bg-glass py-2.5 pl-10 pr-4 text-sm text-foreground outline-none backdrop-blur-xl transition-colors placeholder:text-faint focus:border-accent/60"
      />
    </form>
  );
}
