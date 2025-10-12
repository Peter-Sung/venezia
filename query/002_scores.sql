-- 002_scores.sql
-- Create table for high scores (nickname as PK keeps the best per nickname).

create table if not exists public.scores (
  nickname text primary key,
  play_at  text,              -- "MM:SS.s"
  score    int not null,
  updated_at timestamptz default now()
);

create index if not exists scores_score_desc on public.scores (score desc);

-- RLS: allow public read; block direct writes from the client (use RPC)
alter table public.scores enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='scores' and policyname='scores_read'
  ) then
    create policy scores_read on public.scores
      for select to anon using (true);
  end if;
end $$;

-- (No insert/update policies on purpose)  All writes must go through the RPC function with SECURITY DEFINER.
