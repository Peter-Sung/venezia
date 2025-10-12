-- 001_stage_settings.sql
-- Create table for per-stage timings and seed initial values.

create table if not exists public.stage_settings (
  stage_level int primary key,
  fall_duration_seconds float not null, -- 단어가 화면에 존재하는 시간
  spawn_interval_seconds float not null, -- 단어 출현 속도
  clear_duration_seconds int not null default 60  -- 단계별 게임시간
);

-- Seed values (idempotent), with spawn_interval_seconds added
insert into public.stage_settings(stage_level, fall_duration_seconds, spawn_interval_seconds, clear_duration_seconds) values
(1, 28.95, 3.0, 60),
(2, 24.85, 2.5, 60),
(3, 20.71, 2.1, 60),
(4, 16.64, 1.7, 60),
(5, 13.84, 1.3, 60),
(6, 12.47, 1.0, 60),
(7, 9.71, 0.8, 60),
(8, 8.33, 0.6, 60),
(9, 6.30, 0.4, 60),
(10, 4.20, 0.3, 60)
on conflict (stage_level) do update
  set fall_duration_seconds  = excluded.fall_duration_seconds,
      spawn_interval_seconds = excluded.spawn_interval_seconds,
      clear_duration_seconds = excluded.clear_duration_seconds;

-- Optional: RLS read-only (everyone can read)
alter table public.stage_settings enable row level security;
do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='stage_settings' and policyname='stage_settings_read'
  ) then
    create policy stage_settings_read on public.stage_settings
      for select to anon using (true);
  end if;
end $$;