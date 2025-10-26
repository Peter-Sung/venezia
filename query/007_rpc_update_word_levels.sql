-- 007_rpc_update_word_levels.sql
-- Create a function to update the levels of a specific word.

create or replace function update_word_levels(word_id bigint, new_min_level int, new_max_level int)
returns void as $$
begin
  update public.words
  set min_level = new_min_level, max_level = new_max_level
  where id = word_id;
end;
$$ language plpgsql;