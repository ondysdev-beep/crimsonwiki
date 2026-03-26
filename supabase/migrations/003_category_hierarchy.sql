-- Add parent_id support for hierarchical categories
-- This allows us to create Items -> Weapons, Armor, etc. structure

-- Add parent_id column to categories table
ALTER TABLE public.categories 
ADD COLUMN parent_id integer references public.categories(id);

-- Create index for parent_id for better performance
CREATE INDEX categories_parent_id_idx ON public.categories(parent_id);

-- Add RLS policy for parent_id
CREATE POLICY "Categories hierarchy is viewable by everyone"
  ON public.categories FOR SELECT USING (true);

-- Comment explaining the new structure
COMMENT ON COLUMN public.categories.parent_id IS 'Parent category ID for hierarchical structure (null for top-level categories)';
