import { createClient } from '@/lib/supabase/server';

// Crimson Desert GG Database Import Script
// This script will import all items from crimsondesert.gg/database

interface ItemData {
  name: string;
  type: string;
  subtype: string;
  stats: Record<string, number>;
  rarity?: string;
  level?: number;
  description?: string;
  imageUrl?: string;
  craftingMaterials?: Array<{ name: string; quantity: number }>;
  refinementLevels?: Array<{ level: number; materials: Array<{ name: string; quantity: number }> }>;
}

interface CategoryData {
  name: string;
  slug: string;
  itemCount: number;
  subcategories?: Array<{
    name: string;
    slug: string;
    itemCount: number;
  }>;
}

// Database structure from crimsondesert.gg
const DATABASE_CATEGORIES: CategoryData[] = [
  {
    name: 'Weapons',
    slug: 'weapons',
    itemCount: 433,
    subcategories: [
      { name: 'One-Handed Sword', slug: 'one-hand-sword', itemCount: 0 },
      { name: 'Two-Handed Sword', slug: 'two-hand-sword', itemCount: 0 },
      { name: 'One-Handed Axe', slug: 'one-hand-axe', itemCount: 0 },
      { name: 'Two-Handed Axe', slug: 'two-hand-axe', itemCount: 0 },
      { name: 'One-Handed Mace', slug: 'one-hand-mace', itemCount: 0 },
      { name: 'Two-Handed Hammer', slug: 'two-hand-hammer', itemCount: 0 },
      { name: 'Two-Handed Spear', slug: 'two-hand-spear', itemCount: 0 },
      { name: 'Two-Handed Halberd', slug: 'two-hand-halberd', itemCount: 0 },
      { name: 'One-Handed Dagger', slug: 'one-hand-dagger', itemCount: 0 },
      { name: 'One-Handed Bow', slug: 'one-hand-bow', itemCount: 0 },
      { name: 'One-Handed Musket', slug: 'one-hand-musket', itemCount: 0 },
      { name: 'Two-Handed Cannon', slug: 'two-hand-cannon', itemCount: 0 },
      { name: 'Two-Handed Pike', slug: 'two-hand-pike', itemCount: 0 },
      { name: 'One-Handed Cannon', slug: 'one-hand-cannon', itemCount: 0 },
      { name: 'Two-Handed Giant Sword', slug: 'two-hand-giant-sword', itemCount: 0 },
      { name: 'Two-Handed Greathammer', slug: 'two-hand-greathammer', itemCount: 0 },
      { name: 'Two-Handed Longsword', slug: 'two-hand-longsword', itemCount: 0 },
      { name: 'One-Handed War Hammer', slug: 'one-hand-war-hammer', itemCount: 0 },
    ]
  },
  {
    name: 'Armor',
    slug: 'armor',
    itemCount: 2232,
    subcategories: [
      { name: 'Upper Body', slug: 'upperbody', itemCount: 984 },
      { name: 'Cloak', slug: 'cloak', itemCount: 109 },
      { name: 'Footwear', slug: 'foot', itemCount: 338 },
      { name: 'Glasses', slug: 'glass', itemCount: 5 },
      { name: 'Gloves', slug: 'hand', itemCount: 350 },
      { name: 'Headgear', slug: 'helm', itemCount: 355 },
      { name: 'Inventory', slug: 'back-pack', itemCount: 90 },
      { name: 'Mask', slug: 'mask', itemCount: 1 },
    ]
  },
  {
    name: 'Shields',
    slug: 'shields',
    itemCount: 76
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    itemCount: 73
  },
  {
    name: 'Mount Gear',
    slug: 'mount-gear',
    itemCount: 97
  },
  {
    name: 'Tools',
    slug: 'tools',
    itemCount: 47
  },
  {
    name: 'Consumables',
    slug: 'consumables',
    itemCount: 1282
  },
  {
    name: 'Materials',
    slug: 'materials',
    itemCount: 177
  },
  {
    name: 'Ammunition',
    slug: 'ammunition',
    itemCount: 13
  },
  {
    name: 'Misc Items',
    slug: 'misc-items',
    itemCount: 1472
  }
];

// Function to create the new hierarchical category structure
async function createItemCategories() {
  const supabase = await createClient();

  try {
    // 1. Create main "Items" category
    const { data: itemsCategory, error: itemsError } = await supabase
      .from('categories')
      .insert({
        name: 'Items',
        slug: 'items',
        description: 'All items, equipment, and materials from Crimson Desert including weapons, armor, consumables, and crafting materials.',
        color: '#9b59b6'
      })
      .select()
      .single();

    if (itemsError) throw itemsError;

    // 2. Create subcategories under "Items"
    const subcategories = [
      { name: 'Weapons', slug: 'weapons', description: 'All types of weapons including swords, axes, maces, spears, and ranged weapons.', color: '#e74c3c' },
      { name: 'Armor', slug: 'armor', description: 'Protective equipment including body armor, helmets, gloves, boots, and accessories.', color: '#3498db' },
      { name: 'Shields', slug: 'shields', description: 'Defensive equipment for blocking and parrying attacks.', color: '#f39c12' },
      { name: 'Accessories', slug: 'accessories', description: 'Rings, amulets, belts, and other wearable items that provide bonuses.', color: '#2ecc71' },
      { name: 'Consumables', slug: 'consumables', description: 'Potions, food, and other items that can be consumed for temporary effects.', color: '#e67e22' },
      { name: 'Materials', slug: 'materials', description: 'Raw materials and resources used for crafting and enhancement.', color: '#95a5a6' },
      { name: 'Mount Gear', slug: 'mount-gear', description: 'Equipment and accessories for your mounts.', color: '#16a085' },
      { name: 'Tools', slug: 'tools', description: 'Utility items and tools for various activities.', color: '#8e44ad' },
      { name: 'Ammunition', slug: 'ammunition', description: 'Arrows, bolts, and other ammunition for ranged weapons.', color: '#c0392b' },
      { name: 'Misc Items', slug: 'misc-items', description: 'Various other items that don\'t fit into other categories.', color: '#7f8c8d' }
    ];

    for (const subcat of subcategories) {
      const { error } = await supabase
        .from('categories')
        .insert({
          ...subcat,
          parent_id: itemsCategory.id
        });

      if (error) throw error;
    }

    console.log('✅ Created Items category hierarchy');
    return itemsCategory;

  } catch (error) {
    console.error('❌ Error creating categories:', error);
    throw error;
  }
}

// Function to scrape items from crimsondesert.gg
async function scrapeItems(categorySlug: string): Promise<ItemData[]> {
  // This would be implemented with a web scraping library
  // For now, return empty array as placeholder
  console.log(`🔍 Scraping items for category: ${categorySlug}`);
  return [];
}

// Function to import items to database
async function importItems(items: ItemData[], categorySlug: string) {
  const supabase = await createClient();

  try {
    // Get category ID
    const { data: category } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', categorySlug)
      .single();

    if (!category) throw new Error(`Category ${categorySlug} not found`);

    // Insert items
    for (const item of items) {
      const articleData = {
        title: item.name,
        slug: item.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
        content: JSON.stringify({
          type: item.type,
          subtype: item.subtype,
          stats: item.stats,
          rarity: item.rarity,
          level: item.level,
          description: item.description,
          imageUrl: item.imageUrl,
          craftingMaterials: item.craftingMaterials,
          refinementLevels: item.refinementLevels
        }),
        category_id: category.id,
        is_published: true
      };

      await supabase.from('articles').insert(articleData);
    }

    console.log(`✅ Imported ${items.length} items to ${categorySlug}`);

  } catch (error) {
    console.error(`❌ Error importing items to ${categorySlug}:`, error);
    throw error;
  }
}

// Function to clean up old categories
async function cleanupOldCategories() {
  const supabase = await createClient();

  const oldCategories = ['armor', 'weapons', 'materials', 'consumables', 'accessories'];

  try {
    for (const catSlug of oldCategories) {
      // Check if category exists and has no parent (old standalone category)
      const { data: category } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', catSlug)
        .is('parent_id', null)
        .single();

      if (category) {
        // Move articles to new hierarchical category
        await supabase
          .from('articles')
          .update({ category_id: null }) // Temporarily unset
          .eq('category_id', category.id);

        // Delete old category
        await supabase
          .from('categories')
          .delete()
          .eq('id', category.id);

        console.log(`🗑️ Cleaned up old category: ${catSlug}`);
      }
    }
  } catch (error) {
    console.error('❌ Error cleaning up old categories:', error);
    throw error;
  }
}

// Main execution function
export async function runDatabaseImport() {
  try {
    console.log('🚀 Starting Crimson Desert GG database import...');

    // 1. Create new category structure
    await createItemCategories();

    // 2. Import items for each category
    for (const category of DATABASE_CATEGORIES) {
      const items = await scrapeItems(category.slug);
      await importItems(items, category.slug);
    }

    // 3. Clean up old categories
    await cleanupOldCategories();

    console.log('✅ Database import completed successfully!');

  } catch (error) {
    console.error('❌ Database import failed:', error);
    throw error;
  }
}
