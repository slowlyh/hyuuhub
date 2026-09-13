// ============================================================
// components/format-tabs.tsx — Tab format + sort (server-render)
// Semua href menunjuk route slug kita sendiri:
//   Semua → /latest · Manga → /manga · Manhwa → /manhwa · Manhua → /manhua
//   (di halaman genre, tab tetap di /genre/<slug>?format=…&sort=…)
// ============================================================
import Link from "next/link";
import type { FormatKey } from "@/types";

const FORMATS: { key: FormatKey | ""; label: string }[] = [
  { key: "", label: "Semua" },
  { key: "manga", label: "Manga" },
  { key: "manhwa", label: "Manhwa" },
  { key: "manhua", label: "Manhua" },
];

const SORTS: { key: string; label: string }[] = [
  { key: "latest", label: "Terbaru" },
  { key: "rank", label: "Populer" },
  { key: "bookmark", label: "Favorit" },
  { key: "rating", label: "Rating" },
];

interface Props {
  /** route aktif tempat tab dirender, mis. "/manga" atau "/genre/action" */
  basePath: string;
  /** format aktif sekarang ("" = semua) */
  format?: FormatKey | "";
  sort?: string;
  genre?: string;
}

export function FormatTabs({ basePath, format = "", sort = "latest", genre }: Props) {
  const isGenre = basePath.startsWith("/genre/");

  const build = (f: string, s: string) => {
    const p = new URLSearchParams();
    if (genre) p.set("genre", genre);
    p.set("sort", s);
    if (isGenre) {
      if (f) p.set("format", f);
      else p.delete("format");
      return `${basePath}?${p.toString()}`;
    }
    if (!f) return `/latest?${p.toString()}`;
    return `/${f}?${p.toString()}`;
  };

  return (
    <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
      <div className="glass inline-flex items-center gap-0.5 p-1">
        {FORMATS.map((f) => {
          const isOn = format === f.key;
          return (
            <Link
              key={f.key || "all"}
              href={build(f.key, sort)}
              className={`rounded-xl px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                isOn ? "btn-accent" : "text-dim hover:bg-white/5 hover:text-foreground"
              }`}
            >
              {f.label}
            </Link>
          );
        })}
      </div>

      <div className="inline-flex items-center gap-0.5">
        {SORTS.map((s) => (
          <Link
            key={s.key}
            href={build(format, s.key)}
            className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-colors ${
              sort === s.key ? "text-foreground" : "text-faint hover:text-dim"
            }`}
          >
            {s.label}
          </Link>
        ))}
      </div>
    </div>
  );
}
