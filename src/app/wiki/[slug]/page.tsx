import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import type { Metadata } from 'next';
import { Clock, Eye, Edit, History, User } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate, SITE_NAME, SITE_URL } from '@/lib/utils';
import { CommentSection } from '@/components/articles/CommentSection';
import { ArticleContentRenderer } from '@/components/articles/ArticleContentRenderer';
import { TableOfContents } from '@/components/articles/TableOfContents';
import type { ArticleWithCategory } from '@/lib/types/database';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const supabase = await createClient();
  const { data: metaData } = await supabase
    .from('articles')
    .select('*, categories(*)')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (!metaData) return { title: 'Article Not Found' };

  const a = metaData as unknown as ArticleWithCategory;
  return {
    title: a.title,
    description: a.excerpt || `Read about ${a.title} on ${SITE_NAME}`,
    openGraph: {
      title: `${a.title} | ${SITE_NAME}`,
      description: a.excerpt || `Read about ${a.title} on ${SITE_NAME}`,
      url: `${SITE_URL}/wiki/${a.slug}`,
      images: a.cover_image_url ? [{ url: a.cover_image_url }] : [{ url: '/og-image.png' }],
      type: 'article',
      publishedTime: a.created_at,
      modifiedTime: a.updated_at,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${a.title} | ${SITE_NAME}`,
      description: a.excerpt || `Read about ${a.title} on ${SITE_NAME}`,
    },
    alternates: {
      canonical: `${SITE_URL}/wiki/${a.slug}`,
    },
  };
}

export default async function ArticlePage({ params }: PageProps) {
  const supabase = await createClient();

  const { data: articleData } = await supabase
    .from('articles')
    .select('*, categories(*), profiles!articles_created_by_fkey(*)')
    .eq('slug', params.slug)
    .eq('is_published', true)
    .single();

  if (!articleData) notFound();

  const a = articleData as unknown as ArticleWithCategory;

  // Increment view count (fire and forget)
  supabase
    .from('articles')
    .update({ view_count: a.view_count + 1 } as never)
    .eq('id', a.id)
    .then();

  // JSON-LD Article structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.excerpt,
    image: a.cover_image_url,
    datePublished: a.created_at,
    dateModified: a.updated_at,
    author: {
      '@type': 'Person',
      name: a.profiles?.username || 'CrimsonWiki Contributor',
    },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${SITE_URL}/wiki/${a.slug}`,
    },
  };

  // Schema.org BreadcrumbList
  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: SITE_URL,
      },
      ...(a.categories
        ? [
          {
            '@type': 'ListItem',
            position: 2,
            name: a.categories.name,
            item: `${SITE_URL}/category/${a.categories.slug}`,
          },
          {
            '@type': 'ListItem',
            position: 3,
            name: a.title,
            item: `${SITE_URL}/wiki/${a.slug}`,
          },
        ]
        : [
          {
            '@type': 'ListItem',
            position: 2,
            name: a.title,
            item: `${SITE_URL}/wiki/${a.slug}`,
          },
        ]),
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
      />

      <article className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-dark-500 mb-6" aria-label="Breadcrumb">
          <Link href="/" className="hover:text-dark-300 transition-colors">Home</Link>
          <span>/</span>
          {a.categories && (
            <>
              <Link
                href={`/category/${a.categories.slug}`}
                className="hover:text-dark-300 transition-colors"
              >
                {a.categories.name}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="text-dark-300">{a.title}</span>
        </nav>

        {/* Header */}
        <header className="mb-8">
          {a.categories && (
            <span
              className="inline-block text-xs font-semibold px-2.5 py-1 rounded-full mb-3"
              style={{
                backgroundColor: `${a.categories.color}20`,
                color: a.categories.color || '#dc2626',
              }}
            >
              {a.categories.icon} {a.categories.name}
            </span>
          )}

          <h1 className="text-3xl md:text-4xl font-bold text-dark-50 mb-4">
            {a.title}
          </h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-dark-400">
            {a.profiles && (
              <span className="flex items-center gap-1.5">
                <User className="w-4 h-4" />
                {a.profiles.username}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {formatDate(a.updated_at)}
            </span>
            <span className="flex items-center gap-1.5">
              <Eye className="w-4 h-4" />
              {a.view_count.toLocaleString()} views
            </span>
            <div className="flex items-center gap-2 ml-auto">
              <Link
                href={`/wiki/${a.slug}/edit`}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg transition-colors"
              >
                <Edit className="w-3 h-3" />
                Edit
              </Link>
              <Link
                href={`/wiki/${a.slug}/history`}
                className="flex items-center gap-1 px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg transition-colors"
              >
                <History className="w-3 h-3" />
                History
              </Link>
            </div>
          </div>
        </header>

        {/* Cover Image */}
        {a.cover_image_url && (
          <div className="relative aspect-video rounded-xl overflow-hidden mb-8">
            <Image
              src={a.cover_image_url}
              alt={a.title}
              fill
              className="object-cover"
              priority
            />
          </div>
        )}

        {/* Table of Contents */}
        <TableOfContents content={a.content} />

        {/* Content */}
        <div className="wiki-content">
          <ArticleContentRenderer content={a.content} />
        </div>

        {/* Comments */}
        <CommentSection articleId={a.id} />
      </article>
    </>
  );
}
