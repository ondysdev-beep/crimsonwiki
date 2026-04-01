import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { SITE_NAME, SITE_URL } from '@/lib/utils';
import type { Category } from '@/lib/types/database';

interface PageProps {
  searchParams: { q?: string; category?: string };
}

export function generateMetadata({ searchParams }: PageProps): Metadata {
  const q = searchParams.q;
  return {
    title: q ? `Search: ${q}` : 'Search',
    description: `Search the ${SITE_NAME} wiki for Crimson Desert guides, lore, bosses, quests, and more.`,
    robots: { index: false, follow: true },
    alternates: { canonical: `${SITE_URL}/search` },
  };
}

export const dynamic = 'force-dynamic';

const CATEGORY_COLORS: Record<string, string> = {
  quests: '#c9a227', bosses: '#cc3333', items: '#4a9eff', locations: '#33cc77',
  classes: '#9b59b6', crafting: '#e67e22', tips: '#1abc9c', lore: '#95a5a6',
  characters: '#e74c3c', mounts: '#8e44ad', collectibles: '#f39c12',
  walkthrough: '#27ae60', factions: '#2c3e50', activities: '#16a085', camp: '#d35400',
};

export default async function SearchPage({ searchParams }: PageProps) {
  const query = searchParams.q?.trim() || '';
  const categoryFilter = searchParams.category || '';
  const supabase = await createClient();

  const { data: catData } = await supabase.from('categories').select('*').order('name');
  const categories = (catData || []) as Category[];

  let results: {
    id: string;
    slug: string;
    title: string;
    excerpt: string | null;
    cover_image_url: string | null;
    category_name: string | null;
    category_slug: string | null;
    category_color: string | null;
    rank: number;
  }[] = [];

  if (query) {
    const { data } = await supabase.rpc('search_articles', {
      search_query: query,
      result_limit: 50,
    });
    if (data) results = data as typeof results;

    if (categoryFilter) {
      results = results.filter((r) => r.category_slug === categoryFilter);
    }
  }

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

  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Search</div>
          <div className="page-hd-sub">Find articles, guides, and information</div>
        </div>
      </div>

      {/* SEARCH INPUT */}
      <form action="/search" method="GET" style={{ marginBottom: '10px' }}>
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search wiki..."
          autoFocus
          style={{
            width: '100%',
            height: '28px',
            background: 'var(--bg-2)',
            border: '1px solid var(--border-2)',
            color: 'var(--text-0)',
            fontSize: '13px',
            padding: '0 8px',
            outline: 'none',
            fontFamily: 'var(--ff)',
          }}
        />
        {categoryFilter && (
          <input type="hidden" name="category" value={categoryFilter} />
        )}
      </form>

      {/* CATEGORY FILTERS */}
      <div style={{ marginBottom: '10px', fontSize: '11px', color: 'var(--text-2)' }}>
        Filter by category:{' '}
        <Link
          href={query ? `/search?q=${encodeURIComponent(query)}` : '/search'}
          style={{
            color: !categoryFilter ? 'var(--amber)' : 'var(--link)',
            textDecoration: 'none'
          }}
        >
          All
        </Link>
        {categories.map((cat, i) => (
          <span key={cat.id}>
            {', '}
            <Link
              href={query ? `/search?q=${encodeURIComponent(query)}&category=${cat.slug}` : `/search?category=${cat.slug}`}
              style={{
                color: categoryFilter === cat.slug ? 'var(--amber)' : 'var(--link)',
                textDecoration: 'none'
              }}
            >
              {cat.name}
            </Link>
          </span>
        ))}
      </div>

      {/* SEARCH RESULTS */}
      {query && (
        <>
          {results.length > 0 && (
            <div style={{ fontSize: '11px', color: 'var(--text-2)', marginBottom: '8px' }}>
              {results.length} result{results.length !== 1 ? 's' : ''} for "{query}"
              {categoryFilter && (
                <span> in <strong style={{ color: 'var(--text-0)' }}>
                  {categories.find((c) => c.slug === categoryFilter)?.name || categoryFilter}
                </strong></span>
              )}
            </div>
          )}

          <table className="article-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Type</th>
                <th>Excerpt</th>
              </tr>
            </thead>
            <tbody>
              {results.map((result) => (
                <tr key={result.id}>
                  <td className="td-title">
                    <Link href={`/wiki/${result.slug}`}>{result.title}</Link>
                  </td>
                  <td>
                    {result.category_name && (
                      <span className={`tag tag-${result.category_slug}`}>
                        {result.category_name}
                      </span>
                    )}
                  </td>
                  <td style={{ fontSize: '11px', color: 'var(--text-2)' }}>
                    {result.excerpt && (
                      result.excerpt.length > 120
                        ? result.excerpt.slice(0, 120) + '...'
                        : result.excerpt
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {results.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)' }}>
              No articles found matching your search.
              <br />
              Try different keywords or{' '}
              <Link href="/wiki/new" style={{ color: 'var(--link)' }}>create a new article</Link>.
            </div>
          )}
        </>
      )}

      {/* BROWSE BY CATEGORY (when no search) */}
      {!query && (
        <div className="wiki-box">
          <div className="wiki-box-hd">Browse by Category</div>
          <table className="wiki-table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat.id}>
                  <td>
                    <Link href={`/category/${cat.slug}`}>{cat.name}</Link>
                  </td>
                  <td style={{ fontSize: '11px', color: 'var(--text-2)' }}>
                    {cat.description || 'No description available'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
