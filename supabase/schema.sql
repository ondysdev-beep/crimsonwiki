-- ============================================================
-- CrimsonWiki — Complete Database Schema
-- All tables, RLS policies, triggers, functions, and admin tables
-- in one authoritative file. Safe to re-run on a fresh database.
--
-- Sections:
--   1. Extensions
--   2. Profiles
--   3. Categories
--   4. Articles
--   5. Article Revisions
--   6. Comments
--   7. Triggers & Functions
--   8. Storage Bucket
--   9. Site Settings  (admin panel)
--  10. Redirects      (admin panel)
-- ============================================================


-- ─────────────────────────────────────────────────────────────
-- 1. Extensions
-- ─────────────────────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "pg_trgm";


-- ─────────────────────────────────────────────────────────────
-- 2. Profiles (extends auth.users)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.profiles (
  id                   uuid        PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  username             text        UNIQUE NOT NULL,
  avatar_url           text,
  discord_id           text,
  role                 text        NOT NULL DEFAULT 'editor'
                                   CHECK (role IN ('viewer', 'editor', 'moderator', 'admin')),
  is_founder           boolean     NOT NULL DEFAULT false,
  created_at           timestamptz NOT NULL DEFAULT now(),
  bio                  text,
  website_url          text,
  twitter_handle       text,
  discord_username     text,
  email_notifications  boolean     NOT NULL DEFAULT true,
  theme_preference     text        NOT NULL DEFAULT 'dark'
                                   CHECK (theme_preference IN ('dark', 'light')),
  language_preference  text        NOT NULL DEFAULT 'en'
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Public profiles are viewable by everyone" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile"             ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile"             ON public.profiles;

CREATE POLICY "Public profiles are viewable by everyone"
  ON public.profiles FOR SELECT USING (true);

CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);


-- ─────────────────────────────────────────────────────────────
-- 3. Categories
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.categories (
  id          serial      PRIMARY KEY,
  name        text        NOT NULL,
  slug        text        UNIQUE NOT NULL,
  icon        text,
  description text,
  color       text,
  parent_id   integer     REFERENCES public.categories(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS categories_parent_id_idx ON public.categories (parent_id);

ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Categories are viewable by everyone"    ON public.categories;
DROP POLICY IF EXISTS "Only admins can manage categories"      ON public.categories;
DROP POLICY IF EXISTS "Categories hierarchy is viewable by everyone" ON public.categories;
DROP POLICY IF EXISTS "Allow import operations"                ON public.categories;

CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Admins and mods can manage categories"
  ON public.categories FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );


-- ─────────────────────────────────────────────────────────────
-- 4. Articles
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.articles (
  id               uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  slug             text        UNIQUE NOT NULL,
  title            text        NOT NULL,
  category_id      integer     REFERENCES public.categories(id),
  content          jsonb       NOT NULL DEFAULT '{}',
  content_text     text,
  excerpt          text,
  cover_image_url  text,
  created_by       uuid        REFERENCES public.profiles(id),
  updated_by       uuid        REFERENCES public.profiles(id),
  created_at       timestamptz NOT NULL DEFAULT now(),
  updated_at       timestamptz NOT NULL DEFAULT now(),
  is_published     boolean     NOT NULL DEFAULT true,
  view_count       integer     NOT NULL DEFAULT 0,
  search_vector    tsvector    GENERATED ALWAYS AS (
    to_tsvector('english', COALESCE(title, '') || ' ' || COALESCE(content_text, ''))
  ) STORED
);

CREATE INDEX IF NOT EXISTS articles_search_idx      ON public.articles USING gin(search_vector);
CREATE INDEX IF NOT EXISTS articles_slug_idx        ON public.articles (slug);
CREATE INDEX IF NOT EXISTS articles_category_idx    ON public.articles (category_id);
CREATE INDEX IF NOT EXISTS articles_created_at_idx  ON public.articles (created_at DESC);
CREATE INDEX IF NOT EXISTS articles_title_trgm_idx  ON public.articles USING gin(title gin_trgm_ops);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Published articles are viewable by everyone"     ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can view unpublished articles" ON public.articles;
DROP POLICY IF EXISTS "Authenticated users can create articles"         ON public.articles;
DROP POLICY IF EXISTS "Authors and mods can update articles"            ON public.articles;
DROP POLICY IF EXISTS "Only admins and mods can delete articles"        ON public.articles;

CREATE POLICY "Published articles are viewable by everyone"
  ON public.articles FOR SELECT USING (is_published = true);

CREATE POLICY "Authenticated users can view unpublished articles"
  ON public.articles FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can create articles"
  ON public.articles FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
    AND EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('editor', 'moderator', 'admin')
    )
  );

CREATE POLICY "Authors and mods can update articles"
  ON public.articles FOR UPDATE USING (
    auth.uid() IS NOT NULL
    AND (
      created_by = auth.uid()
      OR EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role IN ('editor', 'moderator', 'admin')
      )
    )
  );

CREATE POLICY "Only admins and mods can delete articles"
  ON public.articles FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('moderator', 'admin')
    )
  );


-- ─────────────────────────────────────────────────────────────
-- 5. Article Revisions
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.article_revisions (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id  uuid        NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  content     jsonb       NOT NULL,
  content_text text,
  edited_by   uuid        REFERENCES public.profiles(id),
  edit_summary text,
  created_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS revisions_article_idx ON public.article_revisions (article_id, created_at DESC);

ALTER TABLE public.article_revisions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Revisions are viewable by everyone"         ON public.article_revisions;
DROP POLICY IF EXISTS "Authenticated users can create revisions"   ON public.article_revisions;

CREATE POLICY "Revisions are viewable by everyone"
  ON public.article_revisions FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create revisions"
  ON public.article_revisions FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);


-- ─────────────────────────────────────────────────────────────
-- 6. Comments
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.comments (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  article_id  uuid        NOT NULL REFERENCES public.articles(id) ON DELETE CASCADE,
  user_id     uuid        REFERENCES public.profiles(id),
  content     text        NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS comments_article_idx ON public.comments (article_id, created_at DESC);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Comments are viewable by everyone"      ON public.comments;
DROP POLICY IF EXISTS "Authenticated users can create comments" ON public.comments;
DROP POLICY IF EXISTS "Users can update own comments"          ON public.comments;
DROP POLICY IF EXISTS "Admins and mods can delete comments"    ON public.comments;

CREATE POLICY "Comments are viewable by everyone"
  ON public.comments FOR SELECT USING (true);

CREATE POLICY "Authenticated users can create comments"
  ON public.comments FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can update own comments"
  ON public.comments FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins, mods and authors can delete comments"
  ON public.comments FOR DELETE USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('moderator', 'admin')
    )
  );


-- ─────────────────────────────────────────────────────────────
-- 7. Triggers & Functions
-- ─────────────────────────────────────────────────────────────

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_article_updated ON public.articles;
CREATE TRIGGER on_article_updated
  BEFORE UPDATE ON public.articles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_comment_updated ON public.comments;
CREATE TRIGGER on_comment_updated
  BEFORE UPDATE ON public.comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Auto-create profile on Discord / OAuth signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  _username text;
BEGIN
  _username := COALESCE(
    NEW.raw_user_meta_data->'custom_claims'->>'global_name',
    NEW.raw_user_meta_data->>'user_name',
    NEW.raw_user_meta_data->>'name',
    NEW.raw_user_meta_data->>'full_name',
    split_part(NEW.email, '@', 1),
    'user_' || substr(NEW.id::text, 1, 8)
  );

  _username := trim(_username);
  IF _username = '' OR _username IS NULL THEN
    _username := 'user_' || substr(NEW.id::text, 1, 8);
  END IF;

  IF EXISTS (SELECT 1 FROM public.profiles WHERE username = _username) THEN
    _username := _username || '_' || substr(md5(random()::text), 1, 4);
  END IF;

  INSERT INTO public.profiles (id, username, avatar_url, discord_id)
  VALUES (
    NEW.id,
    _username,
    NEW.raw_user_meta_data->>'avatar_url',
    NEW.raw_user_meta_data->>'provider_id'
  );

  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  RAISE WARNING 'handle_new_user failed for user %: %', NEW.id, SQLERRM;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Atomic view count increment (avoids race conditions)
CREATE OR REPLACE FUNCTION public.increment_article_views(p_article_id uuid)
RETURNS void AS $$
BEGIN
  UPDATE public.articles
  SET view_count = view_count + 1
  WHERE id = p_article_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Full-text + fuzzy article search
CREATE OR REPLACE FUNCTION public.search_articles(search_query text, result_limit int DEFAULT 20)
RETURNS TABLE (
  id               uuid,
  slug             text,
  title            text,
  excerpt          text,
  cover_image_url  text,
  category_name    text,
  category_slug    text,
  category_color   text,
  rank             real
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.slug,
    a.title,
    a.excerpt,
    a.cover_image_url,
    c.name  AS category_name,
    c.slug  AS category_slug,
    c.color AS category_color,
    ts_rank(a.search_vector, websearch_to_tsquery('english', search_query)) AS rank
  FROM public.articles a
  LEFT JOIN public.categories c ON c.id = a.category_id
  WHERE
    a.is_published = true
    AND (
      a.search_vector @@ websearch_to_tsquery('english', search_query)
      OR a.title ILIKE '%' || search_query || '%'
    )
  ORDER BY rank DESC
  LIMIT result_limit;
END;
$$ LANGUAGE plpgsql;


-- ─────────────────────────────────────────────────────────────
-- 8. Storage Bucket (article images)
-- ─────────────────────────────────────────────────────────────
INSERT INTO storage.buckets (id, name, public)
VALUES ('article-images', 'article-images', true)
ON CONFLICT (id) DO NOTHING;

DROP POLICY IF EXISTS "Anyone can view article images"              ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload article images" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own uploads"               ON storage.objects;

CREATE POLICY "Anyone can view article images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'article-images');

CREATE POLICY "Authenticated users can upload article images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'article-images' AND auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete own uploads"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'article-images' AND auth.uid() IS NOT NULL);


-- ─────────────────────────────────────────────────────────────
-- 9. Site Settings (admin panel)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.site_settings (
  key        text        PRIMARY KEY,
  value      text        NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "settings_read_all"    ON public.site_settings;
DROP POLICY IF EXISTS "settings_write_admin" ON public.site_settings;

CREATE POLICY "settings_read_all" ON public.site_settings
  FOR SELECT USING (true);

CREATE POLICY "settings_write_admin" ON public.site_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );

INSERT INTO public.site_settings (key, value) VALUES
  ('site_notice_enabled', 'true'),
  ('site_notice_text',    'CrimsonWiki is currently in early development. Many pages are stubs — help us expand them!'),
  ('discord_url',         'https://discord.gg/crimsondesert'),
  ('stats_min_articles',  '50'),
  ('stub_threshold',      '300'),
  ('footer_tagline',      'The community-driven encyclopedia for Crimson Desert.')
ON CONFLICT (key) DO NOTHING;


-- ─────────────────────────────────────────────────────────────
-- 10. Redirects (admin panel)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.redirects (
  id         serial      PRIMARY KEY,
  from_slug  text        UNIQUE NOT NULL,
  to_slug    text        NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.redirects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "redirects_read_all"    ON public.redirects;
DROP POLICY IF EXISTS "redirects_write_admin" ON public.redirects;

CREATE POLICY "redirects_read_all" ON public.redirects
  FOR SELECT USING (true);

CREATE POLICY "redirects_write_admin" ON public.redirects
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role IN ('admin', 'moderator')
    )
  );
