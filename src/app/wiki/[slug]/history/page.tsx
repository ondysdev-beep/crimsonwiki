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
    <>
      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link href="/">Main Page</Link>
        <span>›</span>
        <Link href={`/wiki/${article.slug}`}>{article.title}</Link>
        <span>›</span>
        <span>Revision History</span>
      </div>

      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Revision History</div>
          <div className="page-hd-sub">{article.title}</div>
        </div>
        <Link href={`/wiki/${article.slug}`} style={{ color: 'var(--link)', fontSize: '12px' }}>← Back to article</Link>
      </div>

      {revisions.length > 0 ? (
        <div className="wiki-box">
          <div className="wiki-box-hd">Revisions ({revisions.length})</div>
          <table className="article-table">
            <thead>
              <tr>
                <th>Editor</th>
                <th>Date</th>
                <th>Summary</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {revisions.map((rev) => {
                const profile = rev.profiles as Record<string, unknown> | null;
                return (
                  <tr key={String(rev.id)}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <User style={{ width: 12, height: 12, color: 'var(--text-2)', flexShrink: 0 }} />
                      <span style={{ fontSize: '12px', color: 'var(--text-1)' }}>
                        {String(profile?.username ?? 'Unknown')}
                      </span>
                    </td>
                    <td className="td-meta">
                      <Clock style={{ width: 11, height: 11, display: 'inline', verticalAlign: 'middle', marginRight: 4, color: 'var(--text-2)' }} />
                      {formatDate(String(rev.created_at))}
                    </td>
                    <td style={{ fontSize: '12px', color: 'var(--text-1)', fontStyle: rev.edit_summary ? 'normal' : 'italic' }}>
                      {rev.edit_summary ? String(rev.edit_summary) : <span style={{ color: 'var(--text-2)' }}>No summary</span>}
                    </td>
                    <td>
                      <Link
                        href={`/wiki/${article.slug}/history/${String(rev.id)}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--link)' }}
                      >
                        <GitCompare style={{ width: 11, height: 11 }} />
                        View Diff
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)', fontSize: '13px' }}>
          No revisions yet. This article has not been edited since it was created.
        </div>
      )}
    </>
  );
}
