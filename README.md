# HyuuHub — Baca Manga, Manhwa & Manhua

Website baca komik (manga / manhwa / manhua) — Next.js 16 (App Router, Server Components) + TypeScript + Tailwind CSS v4 + Supabase. UI glassmorphism di atas gradient hitam, minimalis dan responsif.

Data real-time dari **Shinigami** (`api.shngm.io`) melalui adapter server-side (`src/lib/shinigami/`) — konversi dari scraper snippet `shinigami.js` karya **ShanMolvyr** (attribution dipertahankan di header file).

## URL berbasis slug

Semua URL memakai slug turunan judul — bukan URL/UUID upstream:

```
/manga/<slug>                  → detail  (mis. /manga/solo-leveling)
/read/<slug>/<chapter>         → reader  (mis. /read/solo-leveling/1, atau /latest)
/genre/<slug>                  → daftar per genre (mis. /genre/action)
/manga|/manhwa|/manhua         → browse per format (tab atas)
/latest                        → rilis terbaru (semua format)
/search?q=…                    → pencarian
/genres                        → semua genre
```

Resolusi `slug → uuid` dilakukan server-side lewat upstream search lalu dicocokkan exact-slug (`resolveManga` di adapter).

## Fitur

- **Home** — hero populer, rilis terbaru, ranking views & rating, rekomendasi, genre chips, lanjut baca
- **Browse** — tab format (Semua/Manga/Manhwa/Manhua) + sort (Terbaru/Populer/Favorit/Rating) + pagination
- **Genre** — 50 genre, filter format/sort per genre
- **Search** — SSR via URL, paginated
- **Detail** — cover, sinopsis, rating/views/bookmark, status, author/artist, list chapter (scroll)
- **Reader** — vertikal webtoon-style: lazy-load, progress bar, fit-width toggle, panel daftar chapter, keyboard ←/→ ganti chapter
- **User** (opsional, Supabase) — login/register, favorit, riwayat & lanjut baca; RLS per user

## Design

Glassmorphism di atas gradient hitam: surface `rgba` transparan + `backdrop-blur` + hairline border putih tipis, glow radial violet/sky samar (`globals.css` → `.bg-stage`, `.glass`, `.glass-bar`). Font Geist. Mobile-first: grid 2 kolom di HP, drawer nav, reader full-width.

## Setup

```bash
npm install
npm run dev
```

Supabase opsional — tanpa env, site tetap jalan penuh (tombol auth mengarah ke login yang error sendiri). Untuk fitur user:

```bash
cp .env.example .env.local   # NEXT_PUBLIC_SUPABASE_URL + ANON_KEY
# jalankan supabase/schema.sql di SQL Editor
```

## Arsitektur

```
src/
  app/
    page.tsx                 # home
    latest/  manga/  manhwa/  manhua/  genre/[slug]/
    manga/[slug]/            # detail (slug)
    read/[slug]/[chapter]/   # reader (slug + nomor chapter)
    search/  genres/  login/  profile/
  components/                # UI (glass) — manga-card, hero, ranking,
                             # reader-shell, browse, format-tabs, dll.
  lib/
    shinigami/
      client.ts              # fetch API shngm.io (server-only)
      adapter.ts             # normalisasi → tipe domain + resolve slug
      slug.ts                # slugify judul & builder href
    supabase/                # client browser / server / proxy session
  types/                     # kontrak UI ↔ adapter
```

Cache: `revalidate` per route (300s home/browse, 120s reader, 3600s genre list). Gambar upstream di-hotlink langsung (`referrerPolicy="no-referrer"`).

## Credit

- Source data & API: g.shinigami.asia — adapter dasar: `shinigami.js` oleh ShanMolvyr.
- HyuuHub hanya antarmuka baca; semua materi milik kreator/penerbit aslinya.
