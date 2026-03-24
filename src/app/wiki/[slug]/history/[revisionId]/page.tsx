import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { formatDate } from '@/lib/utils';
import { DiffViewer } from '@/components/articles/DiffViewer';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: { slug: string; revisionId: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  return {
    title: `Revision Diff - ${params.slug}`,
    robots: { index: false, follow: false },
  };
}

export default async function RevisionDiffPage({ params }: PageProps) {
  const supabase = await createClient();

  const { data: article } = await supabase
    .from('articles')
    .select('id, title, slug, content_text')
    .eq('slug', params.slug)
    .single();

  if (!article) notFound();

  const typedArticle = article as { id: string; title: string; slug: string; content_text: string | null };

  const { data: revision } = await supabase
    .from('article_revisions')
    .select('*, profiles!article_revisions_edited_by_fkey(*)')
    .eq('id', params.revisionId)
    .single();

  if (!revision) notFound();

  const rev = revision as Record<string, unknown>;
  const profile = rev.profiles as Record<string, unknown> | null;
  const oldText = (rev.content_text as string) || '';
  const newText = typedArticle.content_text || '';

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/wiki/${typedArticle.slug}/history`}
          className="flex items-center gap-1 text-sm text-dark-400 hover:text-dark-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to history
        </Link>
      </div>

      <h1 className="text-2xl font-bold text-dark-50 mb-2">Revision Diff</h1>
      <p className="text-dark-400 mb-1">{typedArticle.title}</p>
      <div className="flex items-center gap-3 text-sm text-dark-500 mb-6">
        <span>By {String(profile?.username ?? 'Unknown')}</span>
        <span>•</span>
        <span>{formatDate(String(rev.created_at))}</span>
        {rev.edit_summary ? (
          <>
            <span>•</span>
            <span className="italic">{String(rev.edit_summary)}</span>
          </>
        ) : null}
      </div>

      <div className="flex items-center gap-4 mb-4 text-xs text-dark-400">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-red-500/30 border border-red-500/50" />
          <span>Removed (old revision)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded bg-green-500/30 border border-green-500/50" />
          <span>Added (current)</span>
        </div>
      </div>

      <DiffViewer oldText={oldText} newText={newText} />
    </div>
  );
}
