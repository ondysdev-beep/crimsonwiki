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

  return [
    {
      url: SITE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${SITE_URL}/search`,
      changeFrequency: 'weekly',
      priority: 0.5,
    },
    {
      url: `${SITE_URL}/contribute`,
      changeFrequency: 'monthly',
      priority: 0.4,
    },
    {
      url: `${SITE_URL}/privacy`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    {
      url: `${SITE_URL}/terms`,
      changeFrequency: 'yearly',
      priority: 0.2,
    },
    ...categoryEntries,
    ...articleEntries,
  ];
}
