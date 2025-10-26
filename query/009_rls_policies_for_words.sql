-- 009_rls_policies_for_words.sql
-- Add insert, update and delete policies for the words table to allow admin operations.

do $$
begin
  -- Insert Policy
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='words' and policyname='words_insert'
  ) then
    create policy words_insert on public.words
      for insert to anon with check (true);
  end if;

  -- Update Policy
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='words' and policyname='words_update'
  ) then
    create policy words_update on public.words
      for update to anon using (true);
  end if;

  -- Delete Policy
  if not exists (
    select 1 from pg_policies where schemaname='public' and tablename='words' and policyname='words_delete'
  ) then
    create policy words_delete on public.words
      for delete to anon using (true);
  end if;
end $$;