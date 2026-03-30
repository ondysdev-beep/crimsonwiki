import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { SITE_NAME, SITE_URL } from '@/lib/utils';
import type { Category } from '@/lib/types/database';

export const metadata: Metadata = {
  title: 'All Categories',
  description: `Browse all categories on ${SITE_NAME} — items, bosses, quests, locations, and more.`,
  alternates: { canonical: `${SITE_URL}/categories` },
};

const CATEGORY_COLORS: Record<string, string> = {
  quests: '#c9a227', bosses: '#cc3333', items: '#4a9eff',
  locations: '#33cc77', classes: '#9b59b6', crafting: '#e67e22',
  tips: '#1abc9c', lore: '#95a5a6',
  characters: '#e74c3c', mounts: '#8e44ad', collectibles: '#f39c12',
  walkthrough: '#27ae60', factions: '#2c3e50', activities: '#16a085', camp: '#d35400',
};

export default async function CategoriesPage() {
  const supabase = await createClient();

  const [{ data: catData }, { data: subData }] = await Promise.all([
    supabase.from('categories').select('*, articles(count)').is('parent_id', null).eq('articles.is_published', true).order('name'),
    supabase.from('categories').select('*').not('parent_id', 'is', null).order('name'),
  ]);

  const topLevel = ((catData || []) as (Category & { articles: { count: number }[] })[]);
  const subCategories = ((subData || []) as Category[]);

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: 'All Categories', item: `${SITE_URL}/categories` },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <div className="breadcrumb">
        <Link href="/">Main Page</Link>
        <span>›</span>
        <span>All Categories</span>
      </div>

      <div className="page-hd">
        <div>
          <div className="page-hd-title">All Categories</div>
          <div className="page-hd-sub">{topLevel.length} categories · {subCategories.length} subcategories</div>
        </div>
      </div>

      {topLevel.map((cat) => {
        const color = CATEGORY_COLORS[cat.slug] || cat.color || '#9b2020';
        const subs = subCategories.filter(s => s.parent_id === cat.id);
        const articleCount = cat.articles?.[0]?.count ?? 0;

        return (
          <div key={cat.id} className="wiki-box" style={{ marginBottom: '12px' }}>
            {/* Category header */}
            <div className="wiki-box-hd" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{
                width: 24, height: 24, background: color, display: 'inline-flex',
                alignItems: 'center', justifyContent: 'center',
                fontSize: '12px', fontWeight: '700', color: '#fff', flexShrink: 0,
              }}>
                {cat.icon || cat.name.charAt(0)}
              </span>
              <Link href={`/category/${cat.slug}`} style={{ color: 'var(--text-0)', textDecoration: 'none' }}>
                {cat.name}
              </Link>
              <span style={{ marginLeft: 'auto', fontSize: '11px', color: 'var(--text-2)', fontWeight: 400 }}>
                {articleCount} {articleCount === 1 ? 'article' : 'articles'}
              </span>
            </div>

            <div className="wiki-box-body">
              {cat.description && (
                <p style={{ fontSize: '12px', color: 'var(--text-2)', marginBottom: subs.length ? '10px' : 0 }}>
                  {cat.description}
                </p>
              )}

              {/* Subcategories */}
              {subs.length > 0 && (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
                  gap: '1px',
                  background: 'var(--border)',
                  border: '1px solid var(--border)',
                }}>
                  {subs.map(sub => (
                    <Link
                      key={sub.id}
                      href={`/category/${sub.slug}`}
                      className="subcat-item"
                    >
                      <span
                        className="subcat-icon"
                        style={{ background: sub.color || color }}
                      >
                        {sub.icon || sub.name.charAt(0)}
                      </span>
                      <span className="subcat-name">{sub.name}</span>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </>
  );
}
