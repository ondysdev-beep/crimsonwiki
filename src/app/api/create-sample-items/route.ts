import { NextRequest, NextResponse } from 'next/server';
import { createClient as createServiceClient } from '@supabase/supabase-js';

// Create sample items to demonstrate the structure
export async function POST(request: NextRequest) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
    const supabase = createServiceClient(supabaseUrl, supabaseServiceKey);

    // Get category IDs
    const { data: weaponsCat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'weapons')
      .single();

    const { data: armorCat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'armor')
      .single();

    const { data: materialsCat } = await supabase
      .from('categories')
      .select('id')
      .eq('slug', 'materials')
      .single();

    // Sample items
    const sampleItems = [
      {
        title: 'Aeserion Sword',
        slug: 'aeserion-sword',
        category_id: weaponsCat?.id,
        content: JSON.stringify({
          type: 'Weapon',
          subtype: 'One-Handed Sword',
          stats: { attack: 34, criticalRate: 5 },
          rarity: 'Epic',
          level: 1,
          description: 'A legendary sword forged in the fires of Mount Aeserion.',
          imageUrl: 'https://crimsondesert.gg/images/items/aeserion-sword.png',
          source: 'crimsondesert.gg'
        }),
        excerpt: 'Epic One-Handed Sword with 34 Attack',
        is_published: true
      },
      {
        title: 'Iron Ore',
        slug: 'iron-ore',
        category_id: materialsCat?.id,
        content: JSON.stringify({
          type: 'Material',
          subtype: 'Mining',
          stats: {},
          rarity: 'Common',
          description: 'Basic iron ore used for crafting weapons and armor.',
          imageUrl: 'https://crimsondesert.gg/images/items/iron-ore.png',
          source: 'crimsondesert.gg'
        }),
        excerpt: 'Common crafting material',
        is_published: true
      },
      {
        title: 'Aeserion Plate Armor',
        slug: 'aeserion-plate-armor',
        category_id: armorCat?.id,
        content: JSON.stringify({
          type: 'Armor',
          subtype: 'Upper Body',
          stats: { defense: 45, magicResistance: 20 },
          rarity: 'Epic',
          level: 15,
          description: 'Heavy plate armor forged with Aeserion scales.',
          imageUrl: 'https://crimsondesert.gg/images/items/aeserion-plate-armor.png',
          source: 'crimsondesert.gg'
        }),
        excerpt: 'Epic Upper Body Armor with 45 Defense',
        is_published: true
      }
    ];

    // Insert sample items
    for (const item of sampleItems) {
      // Check if item already exists
      const { data: existing } = await supabase
        .from('articles')
        .select('id')
        .eq('slug', item.slug)
        .single();

      if (!existing) {
        await supabase.from('articles').insert(item);
        console.log(`✅ Created sample item: ${item.title}`);
      } else {
        console.log(`⚠️ Item already exists: ${item.title}`);
      }
    }

    return NextResponse.json({
      success: true,
      message: 'Sample items created successfully',
      items: sampleItems.map(item => item.title)
    });

  } catch (error) {
    console.error('Error creating sample items:', error);
    return NextResponse.json(
      { error: 'Failed to create sample items', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
