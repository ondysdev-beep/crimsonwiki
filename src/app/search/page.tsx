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
    const { data } = await supabase.rpc('search_articles' as never, {
      search_query: query,
      result_limit: 50,
    } as never);
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
    <div className="page-enter" style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>
      <div className="section-title" style={{ marginBottom: 20 }}>Search the Wiki</div>

      <form action="/search" method="GET" style={{ marginBottom: 24 }}>
        <input
          type="text"
          name="q"
          defaultValue={query}
          placeholder="Search articles, guides, bosses, items..."
          autoFocus
          style={{
            width: '100%',
            padding: '12px 16px',
            background: 'var(--surface)',
            border: '1px solid var(--border)',
            borderRadius: 10,
            color: 'var(--text-primary)',
            fontSize: 15,
            outline: 'none',
            fontFamily: 'inherit',
          }}
        />
        {categoryFilter && (
          <input type="hidden" name="category" value={categoryFilter} />
        )}
      </form>

      {/* Category Filters */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 24 }}>
        <span style={{ fontSize: 11, color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>Filter:</span>
        <Link
          href={query ? `/search?q=${encodeURIComponent(query)}` : '/search'}
          style={!categoryFilter ? pillActive : pillBase}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={query ? `/search?q=${encodeURIComponent(query)}&category=${cat.slug}` : `/search?category=${cat.slug}`}
            style={categoryFilter === cat.slug ? pillActive : pillBase}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {query && (
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 20 }}>
          {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          {categoryFilter && (
            <span> in <strong style={{ color: 'var(--text-primary)' }}>{categories.find((c) => c.slug === categoryFilter)?.name || categoryFilter}</strong></span>
          )}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {results.map((result) => (
          <Link
            key={result.id}
            href={`/wiki/${result.slug}`}
            className="article-item"
            style={{ textDecoration: 'none', '--cat-color': result.category_color || '#9b2020' } as React.CSSProperties}
          >
            <div className="article-item-cat" />
            <div className="article-item-body">
              <div className="article-item-title">{result.title}</div>
              {result.excerpt && (
                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 2, lineHeight: 1.5 }}>
                  {result.excerpt.length > 160 ? result.excerpt.slice(0, 160) + '...' : result.excerpt}
                </div>
              )}
            </div>
            {result.category_name && (
              <span className={`badge badge-${result.category_slug === 'quests' ? 'quest' : result.category_slug === 'bosses' ? 'boss' : result.category_slug === 'items' ? 'item' : result.category_slug === 'locations' ? 'location' : result.category_slug === 'classes' ? 'class' : result.category_slug === 'crafting' ? 'crafting' : result.category_slug === 'tips' ? 'tip' : result.category_slug === 'lore' ? 'lore' : 'quest'}`}>
                {result.category_name}
              </span>
            )}
          </Link>
        ))}
      </div>

      {query && results.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 0' }}>
          <div style={{ color: 'var(--text-muted)', marginBottom: 8 }}>No articles found matching your search.</div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)' }}>
            Try different keywords or{' '}
            <Link href="/wiki/new" style={{ color: 'var(--crimson-bright)' }}>create a new article</Link>.
          </div>
        </div>
      )}

      {!query && (
        <div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
            Browse by Category
          </div>
          {categories.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
              {categories.map((cat) => {
                const color = CATEGORY_COLORS[cat.slug] || cat.color || '#9b2020';
                return (
                  <Link
                    key={cat.id}
                    href={`/category/${cat.slug}`}
                    className="cat-card"
                    style={{ '--cat-color': color, '--cat-glow': `${color}1f`, textDecoration: 'none' } as React.CSSProperties}
                  >
                    <span className="cat-icon">{cat.name.charAt(0)}</span>
                    <div className="cat-name">{cat.name}</div>
                    {cat.description && (
                      <div className="cat-desc">{cat.description}</div>
                    )}
                  </Link>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: '40px 0', textAlign: 'center', color: 'var(--text-dim)' }}>
              No categories found. Type a search query above to find articles.
            </div>
          )}
        </div>
      )}
    </div>
  );
}
