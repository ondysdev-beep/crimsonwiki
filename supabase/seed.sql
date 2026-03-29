-- =============================================
-- CrimsonWiki seed / migration (safe re-run)
-- Source: crimsondb.gg/items for item categories
-- =============================================

-- ─────────────────────────────────────────────
-- 0. Clean up old / duplicate categories
--    Keep ONLY the canonical slugs listed below.
--    Articles assigned to deleted categories
--    have their category_id set to NULL first.
-- ─────────────────────────────────────────────
DO $$
DECLARE
  valid_slugs text[] := ARRAY[
    'quests', 'bosses', 'items', 'locations', 'classes', 'crafting', 'tips', 'lore',
    'characters', 'mounts', 'collectibles', 'walkthrough', 'factions', 'activities', 'camp',
    'items-weapons', 'items-armor', 'items-shields', 'items-accessories',
    'items-mount-gear', 'items-consumables', 'items-materials', 'items-tools',
    'items-ammunition', 'items-abyss-gears', 'items-misc'
  ];
BEGIN
  -- Detach articles from categories that will be deleted
  UPDATE public.articles
  SET category_id = NULL
  WHERE category_id IN (
    SELECT id FROM public.categories WHERE slug != ALL(valid_slugs)
  );

  -- Remove self-references (parent_id pointing to rows about to be deleted)
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public' AND table_name = 'categories' AND column_name = 'parent_id'
  ) THEN
    UPDATE public.categories SET parent_id = NULL
    WHERE parent_id IN (
      SELECT id FROM public.categories WHERE slug != ALL(valid_slugs)
    );
  END IF;

  -- Delete all categories not in the valid set
  DELETE FROM public.categories WHERE slug != ALL(valid_slugs);
END;
$$;

-- ─────────────────────────────────────────────
-- 1. Add parent_id support to categories table
-- ─────────────────────────────────────────────
ALTER TABLE public.categories ADD COLUMN IF NOT EXISTS parent_id integer REFERENCES public.categories(id) ON DELETE SET NULL;

-- ─────────────────────────────────────────────
-- 2. Top-level categories (parent_id = NULL)
-- ─────────────────────────────────────────────
INSERT INTO public.categories (name, slug, icon, description, color)
SELECT v.name, v.slug, v.icon, v.description, v.color
FROM (VALUES
  ('Quests',        'quests',      'Q', 'Main story, side quests, and hidden quests',              '#c9a227'),
  ('Bosses',        'bosses',      'B', 'World bosses, dungeon bosses, and field bosses',          '#cc3333'),
  ('Items',         'items',       'I', 'Weapons, armor, consumables, and all collectibles',       '#4a9eff'),
  ('Locations',     'locations',   'L', 'Regions, dungeons, towns, and points of interest',        '#33cc77'),
  ('Classes',       'classes',     'C', 'Playable classes, skills, and builds',                    '#9b59b6'),
  ('Crafting',      'crafting',    'R', 'Recipes, materials, and crafting guides',                 '#e67e22'),
  ('Tips & Tricks', 'tips',        'T', 'Community tips, hidden mechanics, and beginner guides',   '#1abc9c'),
  ('Lore',          'lore',        'H', 'Story, world lore, characters, and factions',             '#95a5a6'),
  ('Characters',    'characters',  'N', 'Story characters, NPCs, companions, and factions',        '#e74c3c'),
  ('Mounts',        'mounts',      'M', 'Horses, camels, mounts, and mount equipment',             '#8e44ad'),
  ('Collectibles',  'collectibles','X', 'Hidden collectibles, journal entries, and discoveries',   '#f39c12'),
  ('Walkthrough',   'walkthrough', 'W', 'Main story walkthrough, chapter guides, and endings',     '#27ae60'),
  ('Factions',      'factions',    'F', 'Greymanes, kingdoms, guilds, and rival factions',         '#2c3e50'),
  ('Activities',    'activities',  'A', 'Fishing, hunting, minigames, and side activities',        '#16a085'),
  ('Camp',          'camp',        'K', 'Camp building, management, upgrades, and resources',      '#d35400')
) AS v(name, slug, icon, description, color)
WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = v.slug);

-- 2b. Fix existing category icons (replace emojis with letters)
UPDATE public.categories SET icon = 'Q' WHERE slug = 'quests'       AND (icon IS NULL OR icon != 'Q');
UPDATE public.categories SET icon = 'B' WHERE slug = 'bosses'       AND (icon IS NULL OR icon != 'B');
UPDATE public.categories SET icon = 'I' WHERE slug = 'items'        AND (icon IS NULL OR icon != 'I');
UPDATE public.categories SET icon = 'L' WHERE slug = 'locations'    AND (icon IS NULL OR icon != 'L');
UPDATE public.categories SET icon = 'C' WHERE slug = 'classes'      AND (icon IS NULL OR icon != 'C');
UPDATE public.categories SET icon = 'R' WHERE slug = 'crafting'     AND (icon IS NULL OR icon != 'R');
UPDATE public.categories SET icon = 'T' WHERE slug = 'tips'         AND (icon IS NULL OR icon != 'T');
UPDATE public.categories SET icon = 'H' WHERE slug = 'lore'         AND (icon IS NULL OR icon != 'H');
UPDATE public.categories SET icon = 'N' WHERE slug = 'characters'   AND (icon IS NULL OR icon != 'N');
UPDATE public.categories SET icon = 'M' WHERE slug = 'mounts'       AND (icon IS NULL OR icon != 'M');
UPDATE public.categories SET icon = 'X' WHERE slug = 'collectibles' AND (icon IS NULL OR icon != 'X');
UPDATE public.categories SET icon = 'W' WHERE slug = 'walkthrough'  AND (icon IS NULL OR icon != 'W');
UPDATE public.categories SET icon = 'F' WHERE slug = 'factions'     AND (icon IS NULL OR icon != 'F');
UPDATE public.categories SET icon = 'A' WHERE slug = 'activities'   AND (icon IS NULL OR icon != 'A');
UPDATE public.categories SET icon = 'K' WHERE slug = 'camp'         AND (icon IS NULL OR icon != 'K');

-- ─────────────────────────────────────────────
-- 3. Items subcategories (source: crimsondb.gg)
--    Equipment: Weapons, Armor, Shields,
--               Accessories, Mount Gear
--    Items:     Consumables, Materials, Tools,
--               Ammunition, Abyss Gears, Misc
-- ─────────────────────────────────────────────
DO $$
DECLARE
  v_items_id integer;
BEGIN
  SELECT id INTO v_items_id FROM public.categories WHERE slug = 'items';

  IF v_items_id IS NULL THEN
    RAISE WARNING 'Items category not found, skipping subcategory insert.';
    RETURN;
  END IF;

  INSERT INTO public.categories (name, slug, icon, description, color, parent_id)
  SELECT v.name, v.slug, v.icon, v.description, v.color, v_items_id
  FROM (VALUES
    -- Equipment
    ('Weapons',      'items-weapons',      'W', 'Swords, axes, bows, firearms, and exotic arms',        '#4a9eff'),
    ('Armor',        'items-armor',        'A', 'Helms, chest armor, gloves, boots, and cloaks',        '#4a9eff'),
    ('Shields',      'items-shields',      'S', 'Shields and tower shields for defense',                '#4a9eff'),
    ('Accessories',  'items-accessories',  'X', 'Rings, necklaces, earrings, and bracelets',            '#4a9eff'),
    ('Mount Gear',   'items-mount-gear',   'M', 'Horse armor, saddles, and pet equipment',              '#4a9eff'),
    -- Items & Materials
    ('Consumables',  'items-consumables',  'P', 'Potions, food, elixirs, and usable items',             '#4a9eff'),
    ('Materials',    'items-materials',    'O', 'Ores, herbs, hides, and crafting ingredients',         '#4a9eff'),
    ('Tools',        'items-tools',        'K', 'Pickaxes, fishing rods, torches, and instruments',     '#4a9eff'),
    ('Ammunition',   'items-ammunition',   'Z', 'Arrows, bolts, bullets, and throwables',               '#4a9eff'),
    ('Abyss Gears',  'items-abyss-gears',  'Y', 'Abyss stones, fragments, and enhancement materials',  '#4a9eff'),
    ('Miscellaneous','items-misc',         'V', 'Quest items, keys, and other miscellaneous objects',   '#4a9eff')
  ) AS v(name, slug, icon, description, color)
  WHERE NOT EXISTS (SELECT 1 FROM public.categories WHERE slug = v.slug);

  -- Also fix existing subcategories that might have parent_id = NULL
  UPDATE public.categories
  SET parent_id = v_items_id
  WHERE slug IN (
    'items-weapons','items-armor','items-shields','items-accessories',
    'items-mount-gear','items-consumables','items-materials','items-tools',
    'items-ammunition','items-abyss-gears','items-misc'
  )
  AND (parent_id IS NULL OR parent_id != v_items_id);
END;
$$;

-- ─────────────────────────────────────────────
-- 4. Delete sample / placeholder articles
-- ─────────────────────────────────────────────
DELETE FROM public.articles
WHERE slug IN ('iron-ore', 'aeserion-plate-armor', 'aeserion-sword')
   OR title IN ('Iron Ore', 'Aeserion Plate Armor', 'Aeserion Sword');

-- ─────────────────────────────────────────────
-- 5. Profile fields for settings page
-- ─────────────────────────────────────────────
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio                  text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url          text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter_handle       text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discord_username     text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_notifications  boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_preference     text    DEFAULT 'dark' CHECK (theme_preference IN ('dark', 'light'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language_preference  text    DEFAULT 'en';

-- ─────────────────────────────────────────────
-- 6. Fix handle_new_user trigger
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _username text;
BEGIN
  _username := COALESCE(
    new.raw_user_meta_data->'custom_claims'->>'global_name',
    new.raw_user_meta_data->>'user_name',
    new.raw_user_meta_data->>'name',
    new.raw_user_meta_data->>'full_name',
    split_part(new.email, '@', 1),
    'user_' || substr(new.id::text, 1, 8)
  );

  _username := trim(_username);
  IF _username = '' OR _username IS NULL THEN
    _username := 'user_' || substr(new.id::text, 1, 8);
  END IF;

  IF _username LIKE '%@%' THEN
    _username := split_part(_username, '@', 1);
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = _username) THEN
    _username := _username || '_' || substr(md5(random()::text), 1, 4);
  END IF;

  INSERT INTO public.profiles (id, username, avatar_url, discord_id)
  VALUES (
    new.id,
    _username,
    new.raw_user_meta_data->>'avatar_url',
    new.raw_user_meta_data->>'provider_id'
  );

  RETURN new;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed for user %: %', new.id, SQLERRM;
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ─────────────────────────────────────────────
-- 7. Fix profiles with email as username
-- ─────────────────────────────────────────────
UPDATE public.profiles
SET username = split_part(username, '@', 1)
WHERE username LIKE '%@%';

-- ─────────────────────────────────────────────
-- 8. Deduplicate usernames
-- ─────────────────────────────────────────────
DO $$
DECLARE
  r RECORD;
BEGIN
  FOR r IN
    SELECT id, username FROM public.profiles
    WHERE username IN (
      SELECT username FROM public.profiles GROUP BY username HAVING COUNT(*) > 1
    )
    ORDER BY created_at DESC
  LOOP
    UPDATE public.profiles
    SET username = r.username || '_' || substr(md5(random()::text), 1, 4)
    WHERE id = r.id;
  END LOOP;
END;
$$;

-- ─────────────────────────────────────────────
-- 9. Atomic view count increment function
-- ─────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.increment_article_views(p_article_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.articles SET view_count = view_count + 1 WHERE id = p_article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;
