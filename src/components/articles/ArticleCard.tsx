import Link from 'next/link';
import { formatDateRelative, truncate } from '@/lib/utils';
import type { ArticleWithCategory } from '@/lib/types/database';

export function ArticleCard({ article }: { article: ArticleWithCategory }) {
  const catColor = article.categories?.color || '#9b2020';

  return (
    <Link
      href={`/wiki/${article.slug}`}
      style={{
        display: 'block',
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 10,
        overflow: 'hidden',
        textDecoration: 'none',
        transition: 'border-color 0.2s, background 0.2s',
      }}
    >
      {article.cover_image_url && (
        <div style={{ position: 'relative', aspectRatio: '16/9', overflow: 'hidden' }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={article.cover_image_url}
            alt={article.title}
            style={{ objectFit: 'cover', width: '100%', height: '100%', display: 'block' }}
            onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      )}

      <div style={{ padding: 16 }}>
        {article.categories && (
          <span style={{
            display: 'inline-block',
            fontSize: 11,
            fontWeight: 600,
            padding: '2px 8px',
            borderRadius: 12,
            marginBottom: 8,
            background: `${catColor}20`,
            color: catColor,
          }}>
            {article.categories.name}
          </span>
        )}

        <h3 style={{
          fontSize: 16,
          fontWeight: 600,
          color: 'var(--text-bright)',
          marginBottom: 4,
          lineHeight: 1.4,
        }}>
          {article.title}
        </h3>

        {article.excerpt && (
          <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 12, lineHeight: 1.5 }}>
            {truncate(article.excerpt, 120)}
          </p>
        )}

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, fontSize: 11, color: 'var(--text-dim)' }}>
          <span>{formatDateRelative(article.updated_at)}</span>
          <span>{article.view_count.toLocaleString()} views</span>
        </div>
      </div>
    </Link>
  );
}
