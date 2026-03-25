-- Categories seed (safe re-run)
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
