import Link from 'next/link';
import Image from 'next/image';
import { Clock, Eye } from 'lucide-react';
import { formatDateRelative, truncate } from '@/lib/utils';
import type { ArticleWithCategory } from '@/lib/types/database';

export function ArticleCard({ article }: { article: ArticleWithCategory }) {
  return (
    <Link
      href={`/wiki/${article.slug}`}
      className="group block bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden hover:border-dark-600 hover:bg-dark-800 transition-all duration-200"
    >
      {article.cover_image_url && (
        <div className="relative aspect-video overflow-hidden">
          <Image
            src={article.cover_image_url}
            alt={article.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-300"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
        </div>
      )}

      <div className="p-4">
        {article.categories && (
          <span
            className="inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-2"
            style={{
              backgroundColor: `${article.categories.color}20`,
              color: article.categories.color || '#dc2626',
            }}
          >
            {article.categories.icon} {article.categories.name}
          </span>
        )}

        <h3 className="text-lg font-semibold text-dark-50 group-hover:text-crimson-400 transition-colors line-clamp-2 mb-1">
          {article.title}
        </h3>

        {article.excerpt && (
          <p className="text-sm text-dark-400 line-clamp-2 mb-3">
            {truncate(article.excerpt, 120)}
          </p>
        )}

        <div className="flex items-center gap-4 text-xs text-dark-500">
          <span className="flex items-center gap-1">
            <Clock className="w-3 h-3" />
            {formatDateRelative(article.updated_at)}
          </span>
          <span className="flex items-center gap-1">
            <Eye className="w-3 h-3" />
            {article.view_count.toLocaleString()}
          </span>
        </div>
      </div>
    </Link>
  );
}
