-- Temporary override for database import
-- This allows the import script to create categories without authentication
-- This should be disabled after import is complete

-- Drop the restrictive policy temporarily
DROP POLICY IF EXISTS "Only admins can manage categories" ON public.categories;

-- Create a permissive policy for import (temporary)
CREATE POLICY "Allow import operations" ON public.categories
  FOR ALL USING (true)
  WITH CHECK (true);

-- Note: After import is complete, run the cleanup script to restore proper security
