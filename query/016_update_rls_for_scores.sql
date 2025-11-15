-- 016_update_rls_for_scores.sql
-- Update the RLS policy for scores to allow authenticated users to read.

-- Drop the existing policy
drop policy if exists scores_read on public.scores;

-- Create a new policy that allows both anon and authenticated users
create policy scores_read on public.scores
  for select to anon, authenticated using (true);
