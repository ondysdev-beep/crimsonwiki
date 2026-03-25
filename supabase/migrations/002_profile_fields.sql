-- Add new profile fields for settings page
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS bio text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS website_url text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS twitter_handle text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS discord_username text;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email_notifications boolean DEFAULT true;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS theme_preference text DEFAULT 'dark' CHECK (theme_preference IN ('dark', 'light'));
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS language_preference text DEFAULT 'en';
