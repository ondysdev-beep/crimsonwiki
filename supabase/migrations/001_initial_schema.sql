-- ============================================================
-- CrimsonWiki - Initial Database Schema
-- ============================================================

-- Enable required extensions
create extension if not exists "pg_trgm";

-- ============================================================
-- PROFILES (extended from auth.users)
-- ============================================================
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  avatar_url text,
  discord_id text,
  role text default 'editor' check (role in ('viewer', 'editor', 'moderator', 'admin')),
  is_founder boolean default false,
  created_at timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Public profiles are viewable by everyone"
  on public.profiles for select using (true);

create policy "Users can update own profile"
  on public.profiles for update using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert with check (auth.uid() = id);

-- ============================================================
-- CATEGORIES
-- ============================================================
create table public.categories (
  id serial primary key,
  name text not null,
  slug text unique not null,
  icon text,
  description text,
  color text
);

alter table public.categories enable row level security;

create policy "Categories are viewable by everyone"
  on public.categories for select using (true);

create policy "Only admins can manage categories"
  on public.categories for all using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- ============================================================
-- ARTICLES
-- ============================================================
create table public.articles (
  id uuid default gen_random_uuid() primary key,
  slug text unique not null,
  title text not null,
  category_id integer references public.categories(id),
  content jsonb not null default '{}',
  content_text text,
  excerpt text,
  cover_image_url text,
  created_by uuid references public.profiles(id),
  updated_by uuid references public.profiles(id),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  is_published boolean default true,
  view_count integer default 0,
  search_vector tsvector generated always as (
    to_tsvector('english', coalesce(title, '') || ' ' || coalesce(content_text, ''))
  ) stored
);

alter table public.articles enable row level security;

-- GIN index for full-text search
create index articles_search_idx on public.articles using gin(search_vector);
create index articles_slug_idx on public.articles (slug);
create index articles_category_idx on public.articles (category_id);
create index articles_created_at_idx on public.articles (created_at desc);

-- Trigram index for fuzzy search
create index articles_title_trgm_idx on public.articles using gin(title gin_trgm_ops);

-- RLS policies for articles
create policy "Published articles are viewable by everyone"
  on public.articles for select using (is_published = true);

create policy "Authenticated users can view unpublished articles"
  on public.articles for select using (
    auth.uid() is not null
  );

create policy "Authenticated users can create articles"
  on public.articles for insert with check (
    auth.uid() is not null
    and exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('editor', 'moderator', 'admin')
    )
  );

create policy "Authors and mods can update articles"
  on public.articles for update using (
    auth.uid() is not null
    and (
      created_by = auth.uid()
      or exists (
        select 1 from public.profiles
        where id = auth.uid() and role in ('editor', 'moderator', 'admin')
      )
    )
  );

create policy "Only admins and mods can delete articles"
  on public.articles for delete using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('moderator', 'admin')
    )
  );

-- ============================================================
-- ARTICLE REVISIONS
-- ============================================================
create table public.article_revisions (
  id uuid default gen_random_uuid() primary key,
  article_id uuid references public.articles(id) on delete cascade,
  content jsonb not null,
  content_text text,
  edited_by uuid references public.profiles(id),
  edit_summary text,
  created_at timestamptz default now()
);

alter table public.article_revisions enable row level security;

create index revisions_article_idx on public.article_revisions (article_id, created_at desc);

create policy "Revisions are viewable by everyone"
  on public.article_revisions for select using (true);

create policy "Authenticated users can create revisions"
  on public.article_revisions for insert with check (
    auth.uid() is not null
  );

-- ============================================================
-- COMMENTS
-- ============================================================
create table public.comments (
  id uuid default gen_random_uuid() primary key,
  article_id uuid references public.articles(id) on delete cascade,
  user_id uuid references public.profiles(id),
  content text not null,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

alter table public.comments enable row level security;

create index comments_article_idx on public.comments (article_id, created_at desc);

create policy "Comments are viewable by everyone"
  on public.comments for select using (true);

create policy "Authenticated users can create comments"
  on public.comments for insert with check (
    auth.uid() is not null
  );

create policy "Users can update own comments"
  on public.comments for update using (
    auth.uid() = user_id
  );

create policy "Admins and mods can delete comments"
  on public.comments for delete using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role in ('moderator', 'admin')
    )
    or auth.uid() = user_id
  );

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Auto-update updated_at on articles
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger on_article_updated
  before update on public.articles
  for each row execute function public.handle_updated_at();

create trigger on_comment_updated
  before update on public.comments
  for each row execute function public.handle_updated_at();

-- Auto-create profile on new user signup
create or replace function public.handle_new_user()
returns trigger as $$
declare
  _username text;
begin
  -- Build username with safe fallbacks
  _username := coalesce(
    new.raw_user_meta_data->'custom_claims'->>'global_name',
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1),
    'user_' || substr(new.id::text, 1, 8)
  );

  -- Ensure username uniqueness
  if exists (select 1 from public.profiles where username = _username) then
    _username := _username || '_' || substr(md5(random()::text), 1, 4);
  end if;

  insert into public.profiles (id, username, avatar_url, discord_id)
  values (
    new.id,
    _username,
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'provider_id'
  );
  return new;
exception when others then
  raise warning 'handle_new_user failed for %: %', new.id, sqlerrm;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- SEED CATEGORIES
-- ============================================================
insert into public.categories (name, slug, icon, description, color) values
  ('Quests', 'quests', '📜', 'Main story, side quests, and hidden quests', '#c9a227'),
  ('Bosses', 'bosses', '⚔️', 'World bosses, dungeon bosses, and field bosses', '#cc3333'),
  ('Items', 'items', '🎒', 'Weapons, armor, consumables, and collectibles', '#4a9eff'),
  ('Locations', 'locations', '🗺️', 'Regions, dungeons, towns, and points of interest', '#33cc77'),
  ('Classes', 'classes', '🛡️', 'Playable classes, skills, and builds', '#9b59b6'),
  ('Crafting', 'crafting', '⚒️', 'Recipes, materials, and crafting guides', '#e67e22'),
  ('Tips & Tricks', 'tips', '💡', 'Community tips, hidden mechanics, and beginner guides', '#1abc9c'),
  ('Lore', 'lore', '📖', 'Story, world lore, characters, and factions', '#95a5a6');

-- ============================================================
-- STORAGE BUCKET
-- ============================================================
insert into storage.buckets (id, name, public) values ('wiki-images', 'wiki-images', true);

create policy "Anyone can view wiki images"
  on storage.objects for select
  using (bucket_id = 'wiki-images');

create policy "Authenticated users can upload wiki images"
  on storage.objects for insert
  with check (bucket_id = 'wiki-images' and auth.uid() is not null);

create policy "Users can delete own uploads"
  on storage.objects for delete
  using (bucket_id = 'wiki-images' and auth.uid() is not null);

-- ============================================================
-- FULL-TEXT SEARCH FUNCTION
-- ============================================================
create or replace function public.search_articles(search_query text, result_limit int default 20)
returns table (
  id uuid,
  slug text,
  title text,
  excerpt text,
  cover_image_url text,
  category_name text,
  category_slug text,
  category_color text,
  rank real
) as $$
begin
  return query
  select
    a.id,
    a.slug,
    a.title,
    a.excerpt,
    a.cover_image_url,
    c.name as category_name,
    c.slug as category_slug,
    c.color as category_color,
    ts_rank(a.search_vector, websearch_to_tsquery('english', search_query)) as rank
  from public.articles a
  left join public.categories c on c.id = a.category_id
  where
    a.is_published = true
    and (
      a.search_vector @@ websearch_to_tsquery('english', search_query)
      or a.title ilike '%' || search_query || '%'
    )
  order by rank desc
  limit result_limit;
end;
$$ language plpgsql;
