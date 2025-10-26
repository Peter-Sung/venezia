-- 006_rpc_add_words.sql
-- Create a function to add multiple words at once.

create or replace function add_words(new_words jsonb)
returns void as $$
begin
  insert into public.words (text, min_level, max_level)
  select
    (w->>'text')::text,
    (w->>'min_level')::int,
    (w->>'max_level')::int
  from jsonb_array_elements(new_words) as w
  on conflict (text) do nothing;
end;
$$ language plpgsql;