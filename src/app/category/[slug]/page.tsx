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

      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link href="/">Main Page</Link>
        <span>›</span>
        <span>{category.name}</span>
      </div>

      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">{category.name}</div>
          <div className="page-hd-sub">
            <span className={`tag tag-${category.slug}`}>{category.name}</span>
            &nbsp;· {total} articles
          </div>
        </div>
        <Link href="/wiki/new" className="page-hd-edit">[ edit page ]</Link>
      </div>

      {/* CATEGORY DESCRIPTION */}
      {category.description && (
        <div className="notice">
          {category.description}
        </div>
      )}

      {/* SORT CONTROLS */}
      <div style={{ marginBottom: '10px', fontSize: '11px', color: 'var(--text-2)' }}>
        Sort by:{' '}
        {[
          { key: 'recent', label: 'Most Recent' },
          { key: 'views', label: 'Most Viewed' },
          { key: 'alpha', label: 'A–Z' },
        ].map((s, i) => (
          <span key={s.key}>
            {i > 0 && ' | '}
            <Link
              href={buildUrl(s.key)}
              style={{
                color: sort === s.key ? 'var(--amber)' : 'var(--link)',
                textDecoration: 'none'
              }}
            >
              {s.label}
            </Link>
          </span>
        ))}
      </div>

      {/* ARTICLES TABLE */}
      {articles && articles.length > 0 ? (
        <table className="article-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Last Edited</th>
              <th>Views</th>
            </tr>
          </thead>
          <tbody>
            {(articles as ArticleWithCategory[]).map((article) => {
              const authorName = (article.profiles as { username: string } | null)?.username || 'Unknown';
              return (
                <tr key={article.id}>
                  <td className="td-title">
                    <Link href={`/wiki/${article.slug}`}>{article.title}</Link>
                  </td>
                  <td className="td-meta">
                    <Link href={`/profile/${authorName}`}>{authorName}</Link> · {formatDateRelative(article.updated_at)}
                  </td>
                  <td className="td-views">{(article.view_count || 0).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)' }}>
          No articles in this category yet.
          <br />
          <Link href="/wiki/new" className="btn-login" style={{ marginTop: '8px', display: 'inline-block' }}>
            Create the first article
          </Link>
        </div>
      )}

      {/* PAGINATION */}
      {totalPages > 1 && (
        <div style={{ textAlign: 'center', marginTop: '20px', fontSize: '11px' }}>
          {currentPage > 1 && (
            <Link href={buildUrl(sort, currentPage - 1)} style={{ marginRight: '8px', color: 'var(--link)' }}>
              ← Previous
            </Link>
          )}

          {Array.from({ length: totalPages }, (_, i) => i + 1)
            .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
            .map((p, i, arr) => {
              const prev = arr[i - 1];
              const showEllipsis = prev !== undefined && p - prev > 1;
              return (
                <span key={p} style={{ margin: '0 2px' }}>
                  {showEllipsis && <span style={{ color: 'var(--text-3)' }}>...</span>}
                  <Link
                    href={buildUrl(sort, p)}
                    style={{
                      color: p === currentPage ? 'var(--amber)' : 'var(--link)',
                      textDecoration: 'none',
                      fontWeight: p === currentPage ? 'bold' : 'normal'
                    }}
                  >
                    {p}
                  </Link>
                </span>
              );
            })}

          {currentPage < totalPages && (
            <Link href={buildUrl(sort, currentPage + 1)} style={{ marginLeft: '8px', color: 'var(--link)' }}>
              Next →
            </Link>
          )}
        </div>
      )}
    </>
  );
}
