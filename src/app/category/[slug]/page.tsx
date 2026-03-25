import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { SITE_NAME, SITE_URL } from '@/lib/utils';
import type { ArticleWithCategory, Category } from '@/lib/types/database';

const PAGE_SIZE = 20;

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

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-dark-500 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-dark-300 transition-colors">Home</Link>
          <span>/</span>
          <span className="text-dark-300">{category.name}</span>
        </nav>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-3xl">{category.icon}</span>
            <h1 className="text-3xl font-bold text-dark-50">{category.name}</h1>
          </div>
          {category.description && (
            <p className="text-dark-400 max-w-2xl">{category.description}</p>
          )}
          <div className="mt-4 flex items-center gap-4">
            <span className="text-sm text-dark-500">
              {total} article{total !== 1 ? 's' : ''}
            </span>
            <Link
              href="/wiki/new"
              className="text-sm text-crimson-400 hover:text-crimson-300 transition-colors"
            >
              + Add article to this category
            </Link>
          </div>
        </div>

        {/* Sort Options */}
        <div className="flex items-center gap-2 mb-6">
          <span className="text-xs text-dark-500">Sort by:</span>
          {[
            { key: 'recent', label: 'Most Recent' },
            { key: 'views', label: 'Most Viewed' },
            { key: 'alpha', label: 'Alphabetical' },
          ].map((s) => (
            <Link
              key={s.key}
              href={buildUrl(s.key)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-colors ${sort === s.key
                  ? 'bg-crimson-600/20 border-crimson-600/40 text-crimson-400'
                  : 'bg-dark-800 border-dark-600 text-dark-400 hover:text-dark-200'
                }`}
            >
              {s.label}
            </Link>
          ))}
        </div>

        {/* Articles Grid */}
        {articles && articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {(articles as ArticleWithCategory[]).map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <p className="text-dark-400 mb-4">No articles in this category yet.</p>
            <Link
              href="/wiki/new"
              className="inline-block px-6 py-2.5 bg-crimson-600 hover:bg-crimson-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              Create the first article
            </Link>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 mt-8">
            {currentPage > 1 && (
              <Link
                href={buildUrl(sort, currentPage - 1)}
                className="px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-lg text-dark-300 hover:text-dark-100 transition-colors"
              >
                Previous
              </Link>
            )}
            {Array.from({ length: totalPages }, (_, i) => i + 1)
              .filter((p) => p === 1 || p === totalPages || Math.abs(p - currentPage) <= 2)
              .map((p, i, arr) => {
                const prev = arr[i - 1];
                const showEllipsis = prev !== undefined && p - prev > 1;
                return (
                  <span key={p} className="flex items-center gap-1">
                    {showEllipsis && <span className="text-dark-500 px-1">...</span>}
                    <Link
                      href={buildUrl(sort, p)}
                      className={`px-3 py-2 text-sm rounded-lg border transition-colors ${p === currentPage
                          ? 'bg-crimson-600/20 border-crimson-600/40 text-crimson-400'
                          : 'bg-dark-800 border-dark-600 text-dark-400 hover:text-dark-200'
                        }`}
                    >
                      {p}
                    </Link>
                  </span>
                );
              })}
            {currentPage < totalPages && (
              <Link
                href={buildUrl(sort, currentPage + 1)}
                className="px-3 py-2 text-sm bg-dark-800 border border-dark-600 rounded-lg text-dark-300 hover:text-dark-100 transition-colors"
              >
                Next
              </Link>
            )}
          </div>
        )}
      </div>
    </>
  );
}
