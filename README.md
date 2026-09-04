# HyuuHub — Your Donghua Hub.

Platform streaming donghua — Next.js 16 (App Router, Server Components) + TypeScript + Supabase + Tailwind CSS.

Data donghua real-time dari [anichin.cafe](https://anichin.cafe) melalui adapter/scraper server-side (lihat `src/lib/anichin/`).

## Fitur

- **Home** — hero, popular today, latest, recommended, leaderboard (weekly/monthly/all-time), continue watching
- **Latest** — rilis terbaru + pagination
- **Search** — pencarian + pagination (SSR via URL)
- **Schedule** — jadwal Senin–Minggu
- **Genres** — daftar genre
- **Detail** — poster, sinopsis, rating, metadata, episode list, favorite
- **Watch** — player multi-server, download per kualitas, prev/next, episode grid, keyboard shortcut
- **User** — login/register (Supabase Auth), watch history, favorites, continue watching

## Setup

```bash
npm install
cp .env.example .env.local   # isi Supabase URL + anon key
npm run dev
```

## Database

Jalankan `supabase/schema.sql` di Supabase SQL Editor — membuat tabel `profiles`, `watch_history`, `favorites` + RLS (user hanya bisa akses datanya sendiri) + trigger auto-create profile.

## Arsitektur

```
src/
  app/            # routes (Server Components by default)
  components/     # UI components (beberapa "use client" bila perlu interaksi)
  lib/
    anichin/      # scraper + adapter/normalizer (server-only)
    supabase/     # client browser / server / middleware
  types/          # tipe domain — kontrak UI ↔ adapter
```

## Catatan

- Service-role key TIDAK pernah dipakai client — hanya anon key.
- Halaman di-cache (revalidate 120–3600s) sesuai frekuensi perubahan data.
