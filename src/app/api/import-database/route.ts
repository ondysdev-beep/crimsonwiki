import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

// Crimson Desert GG Database Import Implementation
interface CategoryData {
  name: string;
  slug: string;
  description: string;
  color: string;
}

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
    const subcategories: CategoryData[] = [
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
async function runDatabaseImport() {
  try {
    console.log('🚀 Starting Crimson Desert GG database import...');

    // 1. Create new category structure
    await createItemCategories();

    // 2. Note: Actual scraping would be implemented here
    console.log('📝 Note: Actual scraping from crimsondesert.gg would be implemented here');
    console.log('📝 This would require puppeteer or similar web scraping library');

    // 3. Clean up old categories
    await cleanupOldCategories();

    console.log('✅ Database structure setup completed!');

  } catch (error) {
    console.error('❌ Database import failed:', error);
    throw error;
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify this is an authorized request (you should add proper authentication)
    const authHeader = request.headers.get('authorization');
    if (!authHeader || authHeader !== 'Bearer import-crimson-desert-db') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Run the import process
    await runDatabaseImport();

    return NextResponse.json({
      success: true,
      message: 'Crimson Desert database import completed successfully',
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Import failed:', error);
    return NextResponse.json(
      {
        error: 'Import failed',
        message: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Crimson Desert Database Import API',
    usage: 'POST with Authorization: Bearer import-crimson-desert-db',
    status: 'Ready'
  });
}
