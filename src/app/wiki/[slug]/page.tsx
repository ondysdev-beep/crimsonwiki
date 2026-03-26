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

  // Fetch related articles (same category, excluding current)
  let relatedArticles: { id: string; slug: string; title: string; excerpt: string | null }[] = [];
  if (a.category_id) {
    const { data: relData } = await supabase
      .from('articles')
      .select('id, slug, title, excerpt')
      .eq('category_id', a.category_id)
      .eq('is_published', true)
      .neq('id', a.id)
      .order('view_count', { ascending: false })
      .limit(4);
    if (relData) relatedArticles = relData as typeof relatedArticles;
  }

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

      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link href="/">Main Page</Link>
        <span>›</span>
        {a.categories && (
          <>
            <Link href={`/category/${a.categories.slug}`}>{a.categories.name}</Link>
            <span>›</span>
          </>
        )}
        <span style={{ color: 'var(--text-1)' }}>{a.title}</span>
      </div>

      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">{a.title}</div>
          <div className="page-hd-sub">
            <span className={`tag tag-${a.categories?.slug}`}>{a.categories?.name}</span>
            &nbsp;· Last edited by <Link href={`/profile/${a.profiles?.username}`}>{a.profiles?.username}</Link> · {formatDate(a.updated_at)} · <Link href={`/wiki/${a.slug}/history`}>{/* revision count placeholder */}23 revisions</Link>
          </div>
        </div>
        <Link href={`/wiki/${a.slug}/edit`} className="page-hd-edit">[ edit page ]</Link>
      </div>

      {/* CONTENT GRID */}
      <div className="content-grid">
        <div>
          {/* INFOBOX */}
          <div className="infobox">
            <div className="infobox-title">{a.title}</div>
            {a.cover_image_url && (
              <div className="infobox-img">
                <Image
                  src={a.cover_image_url}
                  alt={a.title}
                  fill
                  style={{ objectFit: 'cover', width: '100%', height: '100%' }}
                  priority
                />
              </div>
            )}
            {[
              ['Type', a.categories?.name || 'Article'],
              ['Category', a.categories?.name || 'None'],
              ['Last Updated', formatDate(a.updated_at)],
              ['Views', a.view_count.toLocaleString()],
              ['Author', a.profiles?.username || 'Unknown'],
            ].map(([key, value]) => (
              <div key={key} className="infobox-row">
                <span className="infobox-key">{key}</span>
                <span className="infobox-val">{value}</span>
              </div>
            ))}
          </div>

          {/* TABLE OF CONTENTS */}
          <TableOfContents content={a.content} />

          {/* ARTICLE BODY */}
          <div className="article-body">
            <ArticleContentRenderer content={a.content} />
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          {/* ARTICLE STATS */}
          <div className="wiki-box">
            <div className="wiki-box-hd">Article Stats</div>
            <div>
              {[
                ['Views', a.view_count.toLocaleString()],
                ['Revisions', '23'],
                ['Authors', '1'],
              ].map(([label, value]) => (
                <div key={label} className="contrib-row" style={{ justifyContent: 'space-between' }}>
                  <span style={{ color: 'var(--text-1)' }}>{label}</span>
                  <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '12px', color: 'var(--amber)' }}>
                    {value}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* RELATED ARTICLES */}
          {relatedArticles.length > 0 && (
            <div className="wiki-box">
              <div className="wiki-box-hd">Related Articles</div>
              <div>
                {relatedArticles.map((ra) => (
                  <Link
                    key={ra.id}
                    href={`/wiki/${ra.slug}`}
                    className="sidebar-link"
                    style={{ fontSize: '12px' }}
                  >
                    {ra.title}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* CATEGORIES */}
          {a.categories && (
            <div className="wiki-box">
              <div className="wiki-box-hd">Categories</div>
              <div className="wiki-box-body" style={{ fontSize: '12px' }}>
                <Link href={`/category/${a.categories.slug}`} style={{ marginRight: '8px' }}>
                  {a.categories.name}
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* COMMENTS SECTION */}
      <div className="comments-section">
        <CommentSection articleId={a.id} />
      </div>
    </>
  );
}
