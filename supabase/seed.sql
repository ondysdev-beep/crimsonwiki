-- =============================================
-- CrimsonWiki seed / migration (safe re-run)
-- =============================================

-- 1. Categories seed
insert into public.categories (name, slug, icon, description, color)
select * from (values
  ('Quests',       'quests',    'Q', 'Main story, side quests, and hidden quests',           '#c9a227'),
  ('Bosses',       'bosses',    'B', 'World bosses, dungeon bosses, and field bosses',       '#cc3333'),
  ('Items',        'items',     'I', 'Weapons, armor, consumables, and collectibles',        '#4a9eff'),
  ('Locations',    'locations', 'L', 'Regions, dungeons, towns, and points of interest',     '#33cc77'),
  ('Classes',      'classes',   'C', 'Playable classes, skills, and builds',                 '#9b59b6'),
  ('Crafting',     'crafting',  'R', 'Recipes, materials, and crafting guides',              '#e67e22'),
  ('Tips & Tricks','tips',      'T', 'Community tips, hidden mechanics, and beginner guides','#1abc9c'),
  ('Lore',         'lore',      'H', 'Story, world lore, characters, and factions',         '#95a5a6')
) as v(name, slug, icon, description, color)
where not exists (select 1 from public.categories where slug = v.slug);

-- 1b. Fix existing category icons (replace emojis with letters)
UPDATE public.categories SET icon = 'Q' WHERE slug = 'quests' AND (icon IS NULL OR icon != 'Q');
UPDATE public.categories SET icon = 'B' WHERE slug = 'bosses' AND (icon IS NULL OR icon != 'B');
UPDATE public.categories SET icon = 'I' WHERE slug = 'items' AND (icon IS NULL OR icon != 'I');
UPDATE public.categories SET icon = 'L' WHERE slug = 'locations' AND (icon IS NULL OR icon != 'L');
UPDATE public.categories SET icon = 'C' WHERE slug = 'classes' AND (icon IS NULL OR icon != 'C');
UPDATE public.categories SET icon = 'R' WHERE slug = 'crafting' AND (icon IS NULL OR icon != 'R');
UPDATE public.categories SET icon = 'T' WHERE slug = 'tips' AND (icon IS NULL OR icon != 'T');
UPDATE public.categories SET icon = 'H' WHERE slug = 'lore' AND (icon IS NULL OR icon != 'H');

-- 2. Add new profile fields for settings page
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter_handle text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discord_username text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'dark' CHECK (theme_preference IN ('dark', 'light'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language_preference text DEFAULT 'en';

-- 3. Fix handle_new_user trigger
create or replace function public.handle_new_user()
returns trigger as $$
declare
  _username text;
begin
  _username := coalesce(
    new.raw_user_meta_data->'custom_claims'->>'global_name',
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1),
    'user_' || substr(new.id::text, 1, 8)
  );

  _username := trim(_username);
  if _username = '' or _username is null then
    _username := 'user_' || substr(new.id::text, 1, 8);
  end if;

  -- Remove email-like usernames
  if _username like '%@%' then
    _username := split_part(_username, '@', 1);
  end if;

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
  raise warning 'handle_new_user failed for user %: %', new.id, sqlerrm;
  return new;
end;
$$ language plpgsql security definer set search_path = public;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- 4. Fix any existing profiles that have email as username
UPDATE public.profiles
SET username = split_part(username, '@', 1)
WHERE username like '%@%';

-- 5b. Atomic view count increment function (avoids race conditions)
create or replace function public.increment_article_views(p_article_id uuid)
returns void as $$
begin
  update public.articles set view_count = view_count + 1 where id = p_article_id;
end;
$$ language plpgsql security definer set search_path = public;

-- 5. Deduplicate: if the split caused duplicates, append random suffix
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT id, username FROM public.profiles
    WHERE username IN (
      SELECT username FROM public.profiles GROUP BY username HAVING count(*) > 1
    )
    ORDER BY created_at DESC
  LOOP
    UPDATE public.profiles
    SET username = r.username || '_' || substr(md5(random()::text), 1, 4)
    WHERE id = r.id;
  END LOOP;
END;
$$;
