-- 003_rpc_update_high_score.sql
-- RPC that updates a user's best score only. Uses SECURITY DEFINER to bypass RLS write restrictions safely.

create or replace function public.update_high_score(p_nickname text, p_play_at text, p_score int)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.scores as s (nickname, play_at, score)
  values (p_nickname, p_play_at, p_score)
  on conflict (nickname) do update
    set play_at   = excluded.play_at,
        score     = greatest(s.score, excluded.score),
        updated_at = now();
end;
$$;

revoke all on function public.update_high_score(text, text, int) from public;
grant execute on function public.update_high_score(text, text, int) to anon;

-- Optional smoke test (uncomment to run once):
-- select public.update_high_score('tester', '01:23.4', 1234);
-- select * from public.scores order by score desc limit 10;
