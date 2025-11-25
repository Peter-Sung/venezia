-- 019_rpc_get_rankings_by_period.sql
-- RPC to fetch top 10 rankings by period (weekly, monthly, all_time).
-- Returns the highest score per player within the period.

create or replace function public.get_rankings_by_period(p_period text)
returns table (
  nickname text,
  score int,
  play_at text,
  played_at timestamptz
)
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
    -- For 'all_time' or any other value, use a very old date
    v_start_date := '1970-01-01'::timestamptz;
  end if;

  return query
  with ranked_scores as (
    select
      gl.player_id,
      gl.score,
      gl.play_at,
      gl.played_at,
      -- Rank scores for each player to find their best score in the period
      row_number() over (partition by gl.player_id order by gl.score desc, gl.played_at desc) as rn
    from
      public.game_logs gl
    where
      gl.played_at >= v_start_date
  )
  select
    p.nickname,
    rs.score,
    rs.play_at,
    rs.played_at
  from
    ranked_scores rs
    join public.players p on p.id = rs.player_id
  where
    rs.rn = 1 -- Select only the best score per player
  order by
    rs.score desc,
    rs.played_at desc
  limit 10;
end;
$$;

grant execute on function public.get_rankings_by_period(text) to anon;
grant execute on function public.get_rankings_by_period(text) to authenticated;
grant execute on function public.get_rankings_by_period(text) to service_role;
