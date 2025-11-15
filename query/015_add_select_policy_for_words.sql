-- 015_add_select_policy_for_words.sql
-- Add a select policy for the words table to allow both anon and authenticated users to read.

do $$
begin
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='words' and policyname='words_select'
  ) then
    create policy words_select on public.words
      for select to anon, authenticated using (true);
  end if;
end $$;
