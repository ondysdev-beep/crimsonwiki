import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { SITE_NAME, SITE_URL, formatDateRelative } from '@/lib/utils';
import type { ArticleWithCategory, Category } from '@/lib/types/database';

const PAGE_SIZE = 20;

const CATEGORY_COLORS: Record<string, string> = {
  quests: '#c9a227', bosses: '#cc3333', items: '#4a9eff', locations: '#33cc77',
  classes: '#9b59b6', crafting: '#e67e22', tips: '#1abc9c', lore: '#95a5a6',
};

interface PageProps {
  params: { slug: string };
  searchParams: { sort?: string; page?: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single();
  const category = data as Category | null;

  if (!category) return { title: 'Category Not Found' };

  return {
    title: `${category.name} - Crimson Desert Wiki`,
    description: category.description || `Browse all ${category.name} articles on ${SITE_NAME}`,
    openGraph: {
      title: `${category.name} | ${SITE_NAME}`,
      description: category.description || `Browse all ${category.name} articles on ${SITE_NAME}`,
      url: `${SITE_URL}/category/${category.slug}`,
    },
    alternates: {
      canonical: `${SITE_URL}/category/${category.slug}`,
    },
  };
}

export default async function CategoryPage({ params, searchParams }: PageProps) {
  const supabase = await createClient();
  const sort = searchParams.sort || 'recent';
  const currentPage = Math.max(1, parseInt(searchParams.page || '1', 10));
  const offset = (currentPage - 1) * PAGE_SIZE;

  const { data: catData } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single();
  const category = catData as Category | null;

  if (!category) notFound();

  let query = supabase
    .from('articles')
    .select('*, categories(*), profiles!articles_created_by_fkey(*)', { count: 'exact' })
    .eq('category_id', category.id)
    .eq('is_published', true);

  if (sort === 'views') {
    query = query.order('view_count', { ascending: false });
  } else if (sort === 'alpha') {
    query = query.order('title', { ascending: true });
  } else {
    query = query.order('updated_at', { ascending: false });
  }

  const { data: articles, count: totalCount } = await query
    .range(offset, offset + PAGE_SIZE - 1);

  const total = totalCount ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: category.name, item: `${SITE_URL}/category/${category.slug}` },
    ],
  };

  const sortLinkBase = `/category/${category.slug}`;
  const buildUrl = (s: string, p?: number) => {
    const params = new URLSearchParams();
    if (s !== 'recent') params.set('sort', s);
    if (p && p > 1) params.set('page', String(p));
    const qs = params.toString();
    return qs ? `${sortLinkBase}?${qs}` : sortLinkBase;
  };

  const catColor = CATEGORY_COLORS[category.slug] || category.color || '#9b2020';

  const pillBase: React.CSSProperties = {
    display: 'inline-block',
    padding: '5px 14px',
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 8,
    border: '1px solid var(--border)',
    background: 'var(--surface)',
    color: 'var(--text-muted)',
    textDecoration: 'none',
    transition: 'border-color 0.2s, color 0.2s',
  };
  const pillActive: React.CSSProperties = {
    ...pillBase,
    background: 'rgba(155,32,32,0.12)',
    borderColor: 'rgba(155,32,32,0.4)',
    color: 'var(--crimson-bright)',
  };

  const getBadgeClass = (slug: string) => {
    const map: Record<string, string> = {
      quests: 'badge-quest', bosses: 'badge-boss', items: 'badge-item',
      locations: 'badge-location', classes: 'badge-class', crafting: 'badge-crafting',
      tips: 'badge-tip', lore: 'badge-lore',
    };
    return map[slug] || 'badge-quest';
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <div className="page-enter" style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 16px' }}>
        {/* Breadcrumb */}
        <nav aria-label="Breadcrumb" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: 'var(--text-dim)', marginBottom: 24 }}>
          <Link href="/" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Home</Link>
          <span>/</span>
          <span style={{ color: 'var(--text-primary)' }}>{category.name}</span>
        </nav>

        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 28,
            fontWeight: 700,
            color: catColor,
            marginBottom: 8,
          }}>
            {category.name}
          </h1>
          {category.description && (
            <div style={{ fontSize: 14, color: 'var(--text-muted)', maxWidth: 600, lineHeight: 1.6 }}>
              {category.description}
            </div>
          )}
          <div style={{ marginTop: 16, display: 'flex', alignItems: 'center', gap: 16, fontSize: 13 }}>
            <span style={{ color: 'var(--text-dim)' }}>
              {total} article{total !== 1 ? 's' : ''}
            </span>
            <Link href="/wiki/new" style={{ color: 'var(--crimson-bright)', textDecoration: 'none' }}>
              + Add article to this category
            </Link>
          </div>
        </div>

        {/* Sort Options */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
          <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Sort by:</span>
          {[
            { key: 'recent', label: 'Most Recent' },
            { key: 'views', label: 'Most Viewed' },
            { key: 'alpha', label: 'Alphabetical' },
          ].map((s) => (
            <Link key={s.key} href={buildUrl(s.key)} style={sort === s.key ? pillActive : pillBase}>
              {s.label}
            </Link>
          ))}
        </div>

        {/* Articles List */}
        {articles && articles.length > 0 ? (
          <div className="article-list">
            {(articles as ArticleWithCategory[]).map((article) => {
              const authorName = (article.profiles as { username: string } | null)?.username || 'Unknown';
              return (
                <Link
                  key={article.id}
                  href={`/wiki/${article.slug}`}
                  className="article-item"
                  style={{ '--cat-color': catColor } as React.CSSProperties}
                >
                  <div className="article-item-cat" />
                  <div className="article-item-body">
                    <div className="article-item-title">{article.title}</div>
                    <div className="article-item-meta">
                      by <span>{authorName}</span> · {formatDateRelative(article.updated_at)} · <span>{(article.view_count || 0).toLocaleString()} views</span>
                    </div>
                  </div>
                  <span className={`badge ${getBadgeClass(category.slug)}`}>{category.name}</span>
                </Link>
              );
            })}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '60px 0' }}>
            <div style={{ color: 'var(--text-muted)', marginBottom: 16 }}>No articles in this category yet.</div>
            <Link href="/wiki/new" className="btn-login" style={{ display: 'inline-block' }}>
              Create the first article
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 32 }}>
            {currentPage > 1 && (
              <Link href={buildUrl(sort, currentPage - 1)} style={pillBase}>Previous</Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .map((p, i, arr) => {
                const prev = arr[i - 1];
                const showEllipsis = prev !== undefined && p - prev > 1;
                return (
                  <span key={p} style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                    {showEllipsis && <span style={{ color: 'var(--text-dim)', padding: '0 4px' }}>...</span>}
                    <Link href={buildUrl(sort, p)} style={p === currentPage ? pillActive : pillBase}>
                      {p}
                    </Link>
                  </span>
                );
              })}
            {currentPage < totalPages && (
              <Link href={buildUrl(sort, currentPage + 1)} style={pillBase}>Next</Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
