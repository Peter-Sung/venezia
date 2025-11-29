-- 022_rpc_get_score_rank.sql
-- RPC to calculate the rank of a specific score against everyone's best scores in a given period.
-- This is used to determine the rank of the current game's score, even if it's not the user's personal best.

create or replace function public.get_score_rank(p_period text, p_score int)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start_date timestamptz;
begin
  -- Determine the start date based on the period
  if p_period = 'weekly' then
    v_start_date := now() - interval '7 days';
  elsif p_period = 'monthly' then
    v_start_date := now() - interval '30 days';
  else
    v_start_date := '1970-01-01'::timestamptz;
  end if;

  -- Calculate rank: 1 + count of players whose best score in the period is greater than p_score
  return (
    with ranked_scores as (
      select
        gl.player_id,
        gl.score,
        -- Rank scores for each player to find their best score in the period
        row_number() over (partition by gl.player_id order by gl.score desc, gl.played_at desc) as rn
      from
        public.game_logs gl
      where
        gl.played_at >= v_start_date
    ),
    best_scores as (
      select
        rs.score
      from
        ranked_scores rs
      where
        rs.rn = 1
    )
    select
      count(*) + 1
    from
      best_scores bs
    where
      bs.score > p_score
  );
end;
$$;

grant execute on function public.get_score_rank(text, int) to anon;
grant execute on function public.get_score_rank(text, int) to authenticated;
grant execute on function public.get_score_rank(text, int) to service_role;
