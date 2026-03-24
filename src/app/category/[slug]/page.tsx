import { notFound } from 'next/navigation';
import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { SITE_NAME, SITE_URL } from '@/lib/utils';
import type { ArticleWithCategory, Category } from '@/lib/types/database';

interface PageProps {
  params: { slug: string };
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

export default async function CategoryPage({ params }: PageProps) {
  const supabase = await createClient();

  const { data: catData } = await supabase
    .from('categories')
    .select('*')
    .eq('slug', params.slug)
    .single();
  const category = catData as Category | null;

  if (!category) notFound();

  const { data: articles } = await supabase
    .from('articles')
    .select('*, categories(*), profiles!articles_created_by_fkey(*)')
    .eq('category_id', category.id)
    .eq('is_published', true)
    .order('updated_at', { ascending: false });

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: SITE_URL },
      { '@type': 'ListItem', position: 2, name: category.name, item: `${SITE_URL}/category/${category.slug}` },
    ],
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
              {articles?.length || 0} article{(articles?.length || 0) !== 1 ? 's' : ''}
            </span>
            <Link
              href="/wiki/new"
              className="text-sm text-crimson-400 hover:text-crimson-300 transition-colors"
            >
              + Add article to this category
            </Link>
          </div>
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
      </div>
    </>
  );
}
