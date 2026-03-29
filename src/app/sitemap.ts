import type { MetadataRoute } from 'next';
import { createClient } from '@/lib/supabase/server';
import { SITE_URL } from '@/lib/utils';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const supabase = await createClient();

  const { data: artData } = await supabase
    .from('articles')
    .select('slug, updated_at')
    .eq('is_published', true)
    .order('updated_at', { ascending: false });
  const articles = (artData || []) as { slug: string; updated_at: string }[];

  const { data: catData } = await supabase
    .from('categories')
    .select('slug');
  const categories = (catData || []) as { slug: string }[];

  const articleEntries: MetadataRoute.Sitemap = articles.map((article) => ({
    url: `${SITE_URL}/wiki/${article.slug}`,
    lastModified: new Date(article.updated_at),
    changeFrequency: 'weekly',
    priority: 0.8,
  }));

  const categoryEntries: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${SITE_URL}/category/${cat.slug}`,
    changeFrequency: 'weekly',
    priority: 0.7,
  }));

  // Static pages
  const staticPages = [
    { url: `${SITE_URL}`, changeFrequency: 'daily' as const, priority: 1 },
    { url: `${SITE_URL}/search`, changeFrequency: 'weekly' as const, priority: 0.5 },
    { url: `${SITE_URL}/contribute`, changeFrequency: 'monthly' as const, priority: 0.4 },
    { url: `${SITE_URL}/about`, changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${SITE_URL}/categories`, changeFrequency: 'weekly' as const, priority: 0.7 },
    { url: `${SITE_URL}/community`, changeFrequency: 'weekly' as const, priority: 0.4 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'yearly' as const, priority: 0.2 },
    { url: `${SITE_URL}/discord`, changeFrequency: 'monthly' as const, priority: 0.3 },
    { url: `${SITE_URL}/help/editing`, changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${SITE_URL}/help/style`, changeFrequency: 'yearly' as const, priority: 0.3 },
    { url: `${SITE_URL}/walkthrough`, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${SITE_URL}/characters`, changeFrequency: 'monthly' as const, priority: 0.6 },
    { url: `${SITE_URL}/statistics`, changeFrequency: 'weekly' as const, priority: 0.4 },
    { url: `${SITE_URL}/special/allpages`, changeFrequency: 'daily' as const, priority: 0.5 },
    { url: `${SITE_URL}/special/recentchanges`, changeFrequency: 'hourly' as const, priority: 0.6 },
    { url: `${SITE_URL}/special/newpages`, changeFrequency: 'daily' as const, priority: 0.5 },
    { url: `${SITE_URL}/privacy`, changeFrequency: 'yearly' as const, priority: 0.2 },
    { url: `${SITE_URL}/terms`, changeFrequency: 'yearly' as const, priority: 0.2 },
  ];

  return [
    ...staticPages.map(page => ({ ...page, lastModified: new Date() })),
    ...categoryEntries,
    ...articleEntries,
  ];
}
