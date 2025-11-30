-- Add drop_point column to players table
ALTER TABLE public.players ADD COLUMN IF NOT EXISTS drop_point double precision NOT NULL DEFAULT 0;

-- Comment on column
COMMENT ON COLUMN public.players.drop_point IS 'User accumulated mileage (Drops)';
