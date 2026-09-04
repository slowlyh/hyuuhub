-- ============================================================
-- HyuuHub — Supabase schema (PostgreSQL)
-- Jalankan di Supabase SQL Editor. Idempotent.
-- RLS: user hanya bisa baca/ubah data miliknya sendiri.
-- ============================================================

-- ---------- 1. PROFILES ----------
create table if not exists public.profiles (
  id          uuid primary key references auth.users(id) on delete cascade,
  username    text unique not null,
  avatar_url  text,
  created_at  timestamptz not null default now(),
  constraint username_length check (char_length(username) between 3 and 30)
);

alter table public.profiles enable row level security;

create policy "profiles_select_own" on public.profiles
  for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles
  for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles
  for update using (auth.uid() = id);

-- ---------- 2. WATCH HISTORY ----------
-- Satu baris per user per seri (upsert) — dipakai Continue Watching.
create table if not exists public.watch_history (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.profiles(id) on delete cascade,
  series_id      text not null,          -- slug donghua dari adapter anichin
  series_title   text not null,
  series_poster  text,
  episode_id     text not null,         -- slug path episode
  episode_number int,
  episode_title  text,
  created_at     timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  unique (user_id, series_id)
);

create index if not exists watch_history_user_idx on public.watch_history(user_id, updated_at desc);

alter table public.watch_history enable row level security;

create policy "watch_history_select_own" on public.watch_history
  for select using (auth.uid() = user_id);
create policy "watch_history_upsert_own" on public.watch_history
  for insert with check (auth.uid() = user_id);
create policy "watch_history_update_own" on public.watch_history
  for update using (auth.uid() = user_id);
create policy "watch_history_delete_own" on public.watch_history
  for delete using (auth.uid() = user_id);

-- ---------- 3. FAVORITES ----------
create table if not exists public.favorites (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.profiles(id) on delete cascade,
  series_id     text not null,
  series_title  text not null,
  series_poster text,
  created_at    timestamptz not null default now(),
  unique (user_id, series_id)
);

create index if not exists favorites_user_idx on public.favorites(user_id, created_at desc);

alter table public.favorites enable row level security;

create policy "favorites_select_own" on public.favorites
  for select using (auth.uid() = user_id);
create policy "favorites_insert_own" on public.favorites
  for insert with check (auth.uid() = user_id);
create policy "favorites_delete_own" on public.favorites
  for delete using (auth.uid() = user_id);

-- ---------- 4. AUTO-CREATE PROFILE SAAT REGISTER ----------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, avatar_url)
  values (
    new.id,
    coalesce(
      new.raw_user_meta_data ->> 'username',
      new.raw_user_meta_data ->> 'name',
      split_part(new.email, '@', 1) || '_' || substr(new.id::text, 1, 6)
    ),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- 5. UPDATED_AT OTOMATIS ----------
create or replace function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists watch_history_touch on public.watch_history;
create trigger watch_history_touch
  before update on public.watch_history
  for each row execute function public.touch_updated_at();
