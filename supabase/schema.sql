-- Chaal-Kaata Supabase schema (v2: everything behind accounts).
-- Run once in the Supabase SQL editor (dashboard → SQL → New query).
-- Auth: enable Email provider in Authentication → Providers. Magic-link
-- sign-in is used, so no passwords. Set the Site URL to the production
-- domain under Authentication → URL Configuration.

create table if not exists ck_results (
  id bigint generated always as identity primary key,
  user_id uuid references auth.users(id) on delete cascade,
  game_id text not null,
  mode text not null check (mode in ('ai', '2p')),
  winner text check (winner in ('A', 'B', 'draw')),
  moves integer not null default 0,
  duration_sec integer not null default 0,
  created_at timestamptz not null default now()
);
create index if not exists ck_results_game_idx on ck_results (game_id, created_at desc);
create index if not exists ck_results_user_idx on ck_results (user_id);

create table if not exists ck_saves (
  user_id uuid references auth.users(id) on delete cascade,
  game_id text not null,
  state jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, game_id)
);

alter table ck_results enable row level security;
alter table ck_saves enable row level security;

-- Results: public read (leaderboard); only the signed-in owner can insert.
drop policy if exists "public read results" on ck_results;
create policy "public read results" on ck_results
  for select to anon, authenticated using (true);
drop policy if exists "owner insert results" on ck_results;
create policy "owner insert results" on ck_results
  for insert to authenticated with check (auth.uid() = user_id);

-- Saves: owner only.
drop policy if exists "owner all saves" on ck_saves;
create policy "owner all saves" on ck_saves
  for all to authenticated
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Leaderboard: games played and AI-mode wins per user per game.
-- (In AI mode the signed-in player is always Side A.)
create or replace view ck_leaderboard as
  select
    game_id,
    user_id,
    count(*) as games,
    count(*) filter (where mode = 'ai' and winner = 'A') as ai_wins
  from ck_results
  where user_id is not null
  group by game_id, user_id;
