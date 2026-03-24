import Link from 'next/link';
import { BookOpen, TrendingUp, Clock, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { ArticleCard } from '@/components/articles/ArticleCard';
import { SITE_NAME, SITE_DESCRIPTION } from '@/lib/utils';
import type { ArticleWithCategory, Category } from '@/lib/types/database';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

export default async function HomePage() {
  const supabase = await createClient();

  const { data: recentData } = await supabase
    .from('articles')
    .select('*, categories(*), profiles!articles_created_by_fkey(*)')
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(8);
  const recentArticles = (recentData ?? []) as unknown as ArticleWithCategory[];

  const { data: popularData } = await supabase
    .from('articles')
    .select('*, categories(*), profiles!articles_created_by_fkey(*)')
    .eq('is_published', true)
    .order('view_count', { ascending: false })
    .limit(4);
  const popularArticles = (popularData ?? []) as unknown as ArticleWithCategory[];

  const { data: catData } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  const categories = (catData ?? []) as Category[];

  const { count: articleCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      {/* Hero */}
      <section className="text-center py-12 md:py-20">
        <h1 className="font-display text-4xl md:text-6xl font-bold text-dark-50 mb-4">
          Welcome to <span className="text-crimson-500">{SITE_NAME}</span>
        </h1>
        <p className="text-lg text-dark-300 max-w-2xl mx-auto mb-8">
          {SITE_DESCRIPTION}
        </p>
        <div className="flex flex-wrap items-center justify-center gap-4">
          <Link
            href="/search"
            className="px-6 py-3 bg-crimson-600 hover:bg-crimson-700 text-white font-medium rounded-lg transition-colors"
          >
            Explore the Wiki
          </Link>
          <Link
            href="/wiki/new"
            className="px-6 py-3 bg-dark-800 hover:bg-dark-700 text-dark-100 font-medium rounded-lg border border-dark-600 transition-colors"
          >
            Create an Article
          </Link>
        </div>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12">
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 text-center">
          <BookOpen className="w-6 h-6 text-crimson-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-dark-50">{articleCount || 0}</p>
          <p className="text-xs text-dark-400">Articles</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 text-center">
          <Users className="w-6 h-6 text-crimson-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-dark-50">{categories?.length || 0}</p>
          <p className="text-xs text-dark-400">Categories</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 text-center">
          <TrendingUp className="w-6 h-6 text-crimson-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-dark-50">Community</p>
          <p className="text-xs text-dark-400">Driven</p>
        </div>
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 text-center">
          <Clock className="w-6 h-6 text-crimson-500 mx-auto mb-2" />
          <p className="text-2xl font-bold text-dark-50">24/7</p>
          <p className="text-xs text-dark-400">Updated</p>
        </div>
      </section>

      {/* Categories */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold text-dark-50 mb-6">Browse by Category</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/category/${cat.slug}`}
              className="flex items-center gap-3 p-4 bg-dark-800/50 border border-dark-700 rounded-xl hover:border-dark-600 hover:bg-dark-800 transition-all group"
            >
              <span className="text-2xl">{cat.icon}</span>
              <div>
                <p className="font-medium text-dark-100 group-hover:text-white transition-colors">
                  {cat.name}
                </p>
                <p className="text-xs text-dark-500 line-clamp-1">{cat.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Popular Articles */}
      {popularArticles.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-dark-50">Popular Articles</h2>
            <Link href="/search" className="text-sm text-crimson-400 hover:text-crimson-300 transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {popularArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}

      {/* Recent Articles */}
      {recentArticles.length > 0 && (
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-dark-50">Recent Articles</h2>
            <Link href="/search" className="text-sm text-crimson-400 hover:text-crimson-300 transition-colors">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {recentArticles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
