-- 021_rpc_get_user_rank.sql
-- RPC to get a specific user's rank, nickname, score, and played_at for a given period.

create or replace function public.get_user_rank(p_period text, p_player_id bigint)
returns table (
  rank bigint,
  nickname text,
  score int,
  played_at timestamptz
)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_start_date timestamptz;
  v_my_best_score int;
  v_my_played_at timestamptz;
  v_my_nickname text;
begin
  -- Determine the start date based on the period
  if p_period = 'weekly' then
    v_start_date := now() - interval '7 days';
  elsif p_period = 'monthly' then
    v_start_date := now() - interval '30 days';
  else
    v_start_date := '1970-01-01'::timestamptz;
  end if;

  -- 1. Get the target player's best score in the period
  select
    gl.score,
    gl.played_at,
    p.nickname
  into
    v_my_best_score,
    v_my_played_at,
    v_my_nickname
  from
    public.game_logs gl
    join public.players p on p.id = gl.player_id
  where
    gl.player_id = p_player_id
    and gl.played_at >= v_start_date
  order by
    gl.score desc,
    gl.played_at desc
  limit 1;

  -- If no record found, return nothing
  if v_my_best_score is null then
    return;
  end if;

  -- 2. Calculate rank
  -- Rank = 1 + count of players who have a better best score
  return query
  with ranked_scores as (
    select
      gl.player_id,
      gl.score,
      gl.played_at,
      -- Rank scores for each player to find their best score in the period
      row_number() over (partition by gl.player_id order by gl.score desc, gl.played_at desc) as rn
    from
      public.game_logs gl
    where
      gl.played_at >= v_start_date
  ),
  best_scores as (
    select
      rs.player_id,
      rs.score,
      rs.played_at
    from
      ranked_scores rs
    where
      rs.rn = 1
  )
  select
    (count(*) + 1)::bigint as rank,
    v_my_nickname,
    v_my_best_score,
    v_my_played_at
  from
    best_scores bs
  where
    (bs.score > v_my_best_score)
    or (bs.score = v_my_best_score and bs.played_at > v_my_played_at);
end;
$$;

grant execute on function public.get_user_rank(text, bigint) to anon;
grant execute on function public.get_user_rank(text, bigint) to authenticated;
grant execute on function public.get_user_rank(text, bigint) to service_role;
