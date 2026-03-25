import Link from 'next/link';
import { Search } from 'lucide-react';
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

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-dark-50 mb-6">Search the Wiki</h1>

      <form action="/search" method="GET" className="mb-6">
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-dark-400" />
          <input
            type="text"
            name="q"
            defaultValue={query}
            placeholder="Search articles, guides, bosses, items..."
            className="w-full pl-12 pr-4 py-3 bg-dark-800 border border-dark-600 rounded-xl text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-crimson-500/50 focus:border-crimson-500 text-lg"
            autoFocus
          />
          {categoryFilter && (
            <input type="hidden" name="category" value={categoryFilter} />
          )}
        </div>
      </form>

      {/* Category Filters */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        <span className="text-xs text-dark-500">Filter:</span>
        <Link
          href={query ? `/search?q=${encodeURIComponent(query)}` : '/search'}
          className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${!categoryFilter
              ? 'bg-crimson-600/20 border-crimson-600/40 text-crimson-400'
              : 'bg-dark-800 border-dark-600 text-dark-400 hover:text-dark-200'
            }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={query ? `/search?q=${encodeURIComponent(query)}&category=${cat.slug}` : `/search?category=${cat.slug}`}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${categoryFilter === cat.slug
                ? 'bg-crimson-600/20 border-crimson-600/40 text-crimson-400'
                : 'bg-dark-800 border-dark-600 text-dark-400 hover:text-dark-200'
              }`}
          >
            {cat.icon} {cat.name}
          </Link>
        ))}
      </div>

      {query && (
        <p className="text-sm text-dark-400 mb-6">
          {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;
          {categoryFilter && (
            <span> in <strong>{categories.find((c) => c.slug === categoryFilter)?.name || categoryFilter}</strong></span>
          )}
        </p>
      )}

      <div className="space-y-3">
        {results.map((result) => (
          <Link
            key={result.id}
            href={`/wiki/${result.slug}`}
            className="block bg-dark-800/50 border border-dark-700 rounded-lg p-4 hover:border-dark-600 hover:bg-dark-800 transition-all"
          >
            <div className="flex items-center gap-2 mb-1">
              {result.category_name && (
                <span
                  className="text-xs font-semibold px-2 py-0.5 rounded-full"
                  style={{
                    backgroundColor: `${result.category_color}20`,
                    color: result.category_color || '#dc2626',
                  }}
                >
                  {result.category_name}
                </span>
              )}
            </div>
            <h3 className="text-lg font-medium text-dark-100 hover:text-crimson-400 transition-colors">
              {result.title}
            </h3>
            {result.excerpt && (
              <p className="text-sm text-dark-400 mt-1 line-clamp-2">{result.excerpt}</p>
            )}
          </Link>
        ))}
      </div>

      {query && results.length === 0 && (
        <div className="text-center py-16">
          <p className="text-dark-400 mb-2">No articles found matching your search.</p>
          <p className="text-sm text-dark-500">
            Try different keywords or{' '}
            <Link href="/wiki/new" className="text-crimson-400 hover:text-crimson-300">
              create a new article
            </Link>
            .
          </p>
        </div>
      )}

      {!query && (
        <div className="text-center py-16">
          <p className="text-dark-500">
            Type a search query to find articles in the wiki.
          </p>
        </div>
      )}
    </div>
  );
}
