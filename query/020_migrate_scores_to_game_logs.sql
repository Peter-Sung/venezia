-- Migrate legacy scores to game_logs
-- This allows old high scores to appear in the 'All Time' ranking of the new system.

INSERT INTO game_logs (player_id, score, play_at, played_at)
SELECT 
    p.id as player_id,
    s.score,
    s.play_at,
    s.updated_at as played_at
FROM scores s
JOIN players p ON s.nickname = p.nickname
-- Avoid duplicates if this script is run multiple times
-- Assuming we don't have a unique constraint on game_logs that matches this exactly,
-- but we can check if a record with same player_id and score exists at the same time.
-- However, since played_at is timestamptz, exact match might be tricky if precision differs.
-- For simplicity in this migration, we'll just insert. 
-- If idempotency is strictly required, we would need a more complex query.
-- Given the context, a simple insert is likely sufficient as this is a one-time operation.
WHERE NOT EXISTS (
    SELECT 1 FROM game_logs gl 
    WHERE gl.player_id = p.id 
    AND gl.score = s.score 
    AND gl.played_at = s.updated_at
);
