-- =============================================
-- CrimsonWiki admin features migration
-- Run once in Supabase SQL editor
-- =============================================

-- ─────────────────────────────────────────────
-- 1. site_settings table
--    Key/value store for admin-configurable
--    settings (notice banner, links, etc.)
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  key        TEXT PRIMARY KEY,
  value      TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS: anyone can read, only admin/moderator can write
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_read_all"   ON public.site_settings;
DROP POLICY IF EXISTS "settings_write_admin" ON public.site_settings;

CREATE POLICY "settings_read_all" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "settings_write_admin" ON public.site_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'moderator')
    )
  );

-- Default settings
INSERT INTO public.site_settings (key, value) VALUES
  ('site_notice_enabled', 'true'),
  ('site_notice_text',    'CrimsonWiki is currently in early development. Many pages are stubs — help us expand them!'),
  ('discord_url',         'https://discord.gg/crimsondesert'),
  ('stats_min_articles',  '50'),
  ('stub_threshold',      '300'),
  ('footer_tagline',      'The community-driven encyclopedia for Crimson Desert.')
ON CONFLICT (key) DO NOTHING;

-- ─────────────────────────────────────────────
-- 2. redirects table
--    Stores slug-to-slug 301 redirects for
--    renamed or moved wiki pages.
-- ─────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.redirects (
  id         SERIAL PRIMARY KEY,
  from_slug  TEXT UNIQUE NOT NULL,
  to_slug    TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- RLS
ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "redirects_read_all"   ON public.redirects;
DROP POLICY IF EXISTS "redirects_write_admin" ON public.redirects;

CREATE POLICY "redirects_read_all" ON public.redirects
  FOR SELECT USING (true);

CREATE POLICY "redirects_write_admin" ON public.redirects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid()
        AND role IN ('admin', 'moderator')
    )
  );
