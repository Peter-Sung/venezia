-- 014_update_rls_for_stage_settings.sql
-- Update the RLS policy for stage_settings to allow authenticated users to read.

-- Drop the existing policy
drop policy if exists stage_settings_read on public.stage_settings;

-- Create a new policy that allows both anon and authenticated users
create policy stage_settings_read on public.stage_settings
  for select to anon, authenticated using (true);
