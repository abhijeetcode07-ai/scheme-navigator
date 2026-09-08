-- SchemeSetu Live Feed performance & source indexing
-- Additive, idempotent indexes for filtered and ordered live feed queries.

create index if not exists feed_items_source_type_idx on public.feed_items(source_type, published_at desc nulls last);
create index if not exists feed_items_published_nullslast_idx on public.feed_items(published_at desc nulls last);
