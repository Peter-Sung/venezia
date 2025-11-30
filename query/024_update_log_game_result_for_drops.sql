-- 024_update_log_game_result_for_drops.sql
-- Update log_game_result to calculate and add drops to the player's profile.

create or replace function public.log_game_result(p_player_id bigint, p_score int, p_play_at text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_earned_drop double precision;
begin
  -- Calculate drops: 1 DR per 1000 score, rounded to 1 decimal place
  v_earned_drop := floor((p_score::double precision / 1000.0) * 10.0) / 10.0;

  -- Insert game log
  insert into public.game_logs (player_id, score, play_at)
  values (p_player_id, p_score, p_play_at);

  -- Update player's drop_point
  update public.players
  set drop_point = coalesce(drop_point, 0) + v_earned_drop
  where id = p_player_id;
end;
$$;

-- Grant permissions (re-applying just in case)
grant execute on function public.log_game_result(bigint, int, text) to anon;
grant execute on function public.log_game_result(bigint, int, text) to authenticated;
grant execute on function public.log_game_result(bigint, int, text) to service_role;
