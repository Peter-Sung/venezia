-- 005_rpc_get_words_paginated.sql
-- Create a function to fetch words with pagination.

create or replace function get_words_paginated(page_number int, page_size int, search_term text default '')
returns table (id bigint, text text, min_level int, max_level int, total_count bigint)
as $$
begin
  return query
    select w.id, w.text, w.min_level, w.max_level, count(*) over() as total_count
    from public.words w
    where w.text like '%' || search_term || '%'
    order by w.id desc
    limit page_size
    offset (page_number - 1) * page_size;
end;
$$ language plpgsql;