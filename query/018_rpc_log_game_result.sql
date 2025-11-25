-- 018_rpc_log_game_result.sql
-- RPC to insert a game log securely.

create or replace function public.log_game_result(p_player_id bigint, p_score int, p_play_at text)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.game_logs (player_id, score, play_at)
  values (p_player_id, p_score, p_play_at);
end;
$$;

revoke all on function public.log_game_result(bigint, int, text) from public;
grant execute on function public.log_game_result(bigint, int, text) to anon;
grant execute on function public.log_game_result(bigint, int, text) to authenticated;
grant execute on function public.log_game_result(bigint, int, text) to service_role;
