-- Drop the existing function first to change return type
DROP FUNCTION IF EXISTS public.log_game_result(uuid, integer, timestamp with time zone);

-- Re-create the function with return type double precision (the new drop point)
CREATE OR REPLACE FUNCTION public.log_game_result(
    p_player_id uuid,
    p_score integer,
    p_play_at timestamp with time zone
)
RETURNS double precision
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_earned_drop double precision;
    v_new_drop_point double precision;
BEGIN
    -- 1. Calculate Drop (1000 points = 1 DR, rounded to 1 decimal)
    v_earned_drop := floor((p_score::numeric / 1000.0) * 10.0) / 10.0;

    -- 2. Insert into scores table
    INSERT INTO public.scores (player_id, score, play_at)
    VALUES (p_player_id, p_score, p_play_at);

    -- 3. Update player's drop_point and get the new value
    UPDATE public.players
    SET drop_point = COALESCE(drop_point, 0) + v_earned_drop
    WHERE id = p_player_id
    RETURNING drop_point INTO v_new_drop_point;

    -- 4. Return the new drop point
    RETURN v_new_drop_point;
END;
$$;
