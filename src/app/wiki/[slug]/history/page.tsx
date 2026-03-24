import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Clock, User, GitCompare } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import type { Metadata } from 'next';

interface PageProps {
  params: { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Revision History - ${params.slug}`,
    robots: { index: false, follow: true },
  };
}

export default async function HistoryPage({ params }: PageProps) {
  const supabase = await createClient();

  const { data: artData } = await supabase
    .from('articles')
    .select('id, title, slug')
    .eq('slug', params.slug)
    .single();
  const article = artData as { id: string; title: string; slug: string } | null;

  if (!article) notFound();

  const { data: revData } = await supabase
    .from('article_revisions')
    .select('*, profiles!article_revisions_edited_by_fkey(*)')
    .eq('article_id', article.id)
    .order('created_at', { ascending: false });
  const revisions = (revData || []) as Record<string, unknown>[];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/wiki/${article.slug}`}
          className="flex items-center gap-1 text-sm text-dark-400 hover:text-dark-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to article
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-dark-50 mb-2">
        Revision History
      </h1>
      <p className="text-dark-400 mb-8">{article.title}</p>

      {revisions.length > 0 ? (
        <div className="space-y-3">
          {revisions.map((rev) => {
            const profile = rev.profiles as Record<string, unknown> | null;
            return (
              <div
                key={String(rev.id)}
                className="bg-dark-800/50 border border-dark-700 rounded-lg p-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1.5 text-sm text-dark-300">
                      <User className="w-4 h-4" />
                      {String(profile?.username ?? 'Unknown')}
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-dark-500">
                      <Clock className="w-4 h-4" />
                      {formatDate(String(rev.created_at))}
                    </div>
                  </div>
                  <Link
                    href={`/wiki/${article.slug}/history/${String(rev.id)}`}
                    className="flex items-center gap-1 px-3 py-1.5 text-xs bg-dark-800 hover:bg-dark-700 border border-dark-600 rounded-lg text-dark-300 hover:text-dark-100 transition-colors"
                  >
                    <GitCompare className="w-3 h-3" />
                    View Diff
                  </Link>
                </div>
                {rev.edit_summary ? (
                  <p className="mt-2 text-sm text-dark-400 italic">
                    {String(rev.edit_summary)}
                  </p>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : (
        <p className="text-center text-dark-500 py-12">
          No revisions yet. This article has not been edited since it was created.
        </p>
      )}
    </div>
  );
}
