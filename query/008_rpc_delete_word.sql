-- 008_rpc_delete_word.sql
-- Create a function to delete a word.

create or replace function delete_word(word_id bigint)
returns void as $$
begin
  delete from public.words
  where id = word_id;
end;
$$ language plpgsql;