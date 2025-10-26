-- 011_add_unique_constraint_to_words.sql
-- Add a unique constraint to the text column of the words table.

alter table public.words
add constraint words_text_key unique (text);
