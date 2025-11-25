-- 017_create_game_logs.sql
-- Create game_logs table to store every game session history.

create table if not exists public.game_logs (
  id bigint generated always as identity primary key,
  player_id bigint not null references public.players(id) on delete cascade,
  score int not null,
  play_at text not null, -- "MM:SS" or similar duration string
  played_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists game_logs_player_id_idx on public.game_logs(player_id);
create index if not exists game_logs_played_at_idx on public.game_logs(played_at);
create index if not exists game_logs_score_idx on public.game_logs(score desc);

-- RLS
alter table public.game_logs enable row level security;

create policy "Game logs are viewable by everyone"
  on public.game_logs for select
  using (true);

-- We don't allow direct inserts from client, will use RPC.
