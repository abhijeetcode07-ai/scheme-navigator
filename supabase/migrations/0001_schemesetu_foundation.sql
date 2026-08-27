-- SchemeSetu foundation schema
-- Run this migration in the Supabase SQL editor or through the Supabase CLI.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text,
  avatar_url text,
  preferred_language text not null default 'English',
  onboarding_complete boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.schemes (
  id uuid primary key default gen_random_uuid(),
  source_serial_no integer,
  slug text not null unique,
  name text not null,
  ministry_department text,
  category_tags text[] not null default '{}',
  education_level text,
  family_income_ceiling text,
  eligibility_official text,
  eligibility_plain text,
  benefits text,
  documents_required text[] not null default '{}',
  application_mode text,
  official_apply_url text,
  verification_source_url text,
  application_window text,
  last_verified_date date,
  researcher_name text,
  notes_flags text,
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.scheme_translations (
  id uuid primary key default gen_random_uuid(),
  scheme_id uuid not null references public.schemes(id) on delete cascade,
  language_code text not null,
  name text,
  ministry_department text,
  eligibility_plain text,
  benefits text,
  documents_required text[] not null default '{}',
  source text not null default 'reviewed' check (source in ('reviewed', 'ai_draft')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (scheme_id, language_code)
);

create table if not exists public.feed_items (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  summary text,
  source_name text not null,
  source_url text not null unique,
  source_type text not null check (source_type in ('official', 'ministry', 'reputable_news')),
  published_at timestamptz,
  fetched_at timestamptz not null default now(),
  image_url text,
  tags text[] not null default '{}',
  status text not null default 'published' check (status in ('draft', 'published', 'archived')),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feed_item_translations (
  id uuid primary key default gen_random_uuid(),
  feed_item_id uuid not null references public.feed_items(id) on delete cascade,
  language_code text not null,
  title text not null,
  summary text,
  source text not null default 'ai_draft' check (source in ('reviewed', 'ai_draft')),
  reviewed_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (feed_item_id, language_code)
);

create table if not exists public.chat_threads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  title text not null default 'SetuSathi conversation',
  language_code text not null default 'English',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id uuid primary key default gen_random_uuid(),
  thread_id uuid not null references public.chat_threads(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null check (role in ('user', 'assistant', 'system')),
  content text not null,
  created_at timestamptz not null default now()
);

create index if not exists schemes_status_idx on public.schemes(status);
create index if not exists schemes_category_tags_idx on public.schemes using gin(category_tags);
create index if not exists feed_items_status_published_idx on public.feed_items(status, published_at desc);
create index if not exists chat_threads_user_updated_idx on public.chat_threads(user_id, updated_at desc);
create index if not exists chat_messages_thread_created_idx on public.chat_messages(thread_id, created_at);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, display_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
    new.raw_user_meta_data ->> 'avatar_url'
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
after insert on auth.users
for each row execute procedure public.handle_new_user();

alter table public.profiles enable row level security;
alter table public.schemes enable row level security;
alter table public.scheme_translations enable row level security;
alter table public.feed_items enable row level security;
alter table public.feed_item_translations enable row level security;
alter table public.chat_threads enable row level security;
alter table public.chat_messages enable row level security;

revoke all on table public.profiles, public.schemes, public.scheme_translations,
  public.feed_items, public.feed_item_translations, public.chat_threads,
  public.chat_messages from anon, authenticated;

grant select on table public.schemes, public.scheme_translations, public.feed_items,
  public.feed_item_translations to anon, authenticated;
grant select, insert, update on table public.profiles to authenticated;
grant select, insert, update, delete on table public.chat_threads, public.chat_messages to authenticated;

create policy "Published schemes are publicly readable"
on public.schemes for select to anon, authenticated
using (status = 'published');

create policy "Published translations are publicly readable"
on public.scheme_translations for select to anon, authenticated
using (exists (select 1 from public.schemes s where s.id = scheme_id and s.status = 'published'));

create policy "Published feed items are publicly readable"
on public.feed_items for select to anon, authenticated
using (status = 'published');

create policy "Published feed translations are publicly readable"
on public.feed_item_translations for select to anon, authenticated
using (exists (select 1 from public.feed_items f where f.id = feed_item_id and f.status = 'published'));

create policy "Users can view their own profile"
on public.profiles for select to authenticated
using ((select auth.uid()) = id);

create policy "Users can create their own profile"
on public.profiles for insert to authenticated
with check ((select auth.uid()) = id);

create policy "Users can update their own profile"
on public.profiles for update to authenticated
using ((select auth.uid()) = id)
with check ((select auth.uid()) = id);

create policy "Users can manage their own chat threads"
on public.chat_threads for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

create policy "Users can manage their own chat messages"
on public.chat_messages for all to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);
