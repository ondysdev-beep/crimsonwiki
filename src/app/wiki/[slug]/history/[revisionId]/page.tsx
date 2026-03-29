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
    <>
      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link href="/">Main Page</Link>
        <span>›</span>
        <Link href={`/wiki/${typedArticle.slug}`}>{typedArticle.title}</Link>
        <span>›</span>
        <Link href={`/wiki/${typedArticle.slug}/history`}>History</Link>
        <span>›</span>
        <span>Diff</span>
      </div>

      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Revision Diff</div>
          <div className="page-hd-sub">{typedArticle.title}</div>
        </div>
        <Link href={`/wiki/${typedArticle.slug}/history`} style={{ color: 'var(--link)', fontSize: '12px' }}>← Back to history</Link>
      </div>

      {/* META */}
      <div className="notice" style={{ marginBottom: '12px' }}>
        <span style={{ color: 'var(--text-1)' }}>By </span>
        <strong style={{ color: 'var(--text-0)' }}>{String(profile?.username ?? 'Unknown')}</strong>
        <span style={{ color: 'var(--text-2)', margin: '0 6px' }}>·</span>
        <span style={{ color: 'var(--text-2)' }}>{formatDate(String(rev.created_at))}</span>
        {rev.edit_summary ? (
          <>
            <span style={{ color: 'var(--text-2)', margin: '0 6px' }}>·</span>
            <em style={{ color: 'var(--text-1)' }}>{String(rev.edit_summary)}</em>
          </>
        ) : null}
      </div>

      {/* LEGEND */}
      <div style={{ display: 'flex', gap: '16px', marginBottom: '8px', fontSize: '11px', color: 'var(--text-2)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'rgba(192,64,64,0.2)', border: '1px solid rgba(192,64,64,0.4)' }} />
          Removed (old revision)
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ display: 'inline-block', width: 12, height: 12, background: 'rgba(51,160,96,0.2)', border: '1px solid rgba(51,160,96,0.4)' }} />
          Added (current)
        </div>
      </div>

      <DiffViewer oldText={oldText} newText={newText} />
    </>
  );
}
