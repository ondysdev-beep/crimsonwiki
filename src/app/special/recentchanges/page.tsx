import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { formatDateRelative, SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Recent Changes',
  description: `Recent changes on ${SITE_NAME} -- latest edits and updates.`,
};

export default async function RecentChangesPage() {
  const supabase = await createClient();

  // Fetch last 50 edits with article and editor information
  const { data: revisions } = await supabase
    .from('article_revisions')
    .select(`
      id,
      created_at,
      edit_summary,
      edited_by,
      article:articles(title, slug),
      editor:profiles!article_revisions_edited_by_fkey(username)
    `)
    .order('created_at', { ascending: false })
    .limit(50);

  const uniqueEditorCount = revisions
    ? new Set(revisions.map(r => r.edited_by).filter(Boolean)).size
    : 0;

  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Recent Changes</div>
          <div className="page-hd-sub">Latest edits and updates across the wiki</div>
        </div>
      </div>

      {/* RECENT CHANGES CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">
              Last 50 Edits {revisions && `(${revisions.length} changes)`}
            </div>
            <div className="wiki-box-body">
              {revisions && revisions.length > 0 ? (
                <table className="article-table">
                  <thead>
                    <tr>
                      <th style={{ width: '120px' }}>Date</th>
                      <th style={{ width: '120px' }}>Editor</th>
                      <th>Article</th>
                      <th>Summary</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revisions.map((revision) => (
                      <tr key={revision.id}>
                        <td className="td-meta" style={{ fontSize: '12px' }}>
                          {formatDateRelative(revision.created_at)}
                        </td>
                        <td style={{ fontSize: '12px' }}>
                          {(() => {
                            const ed = revision.editor as { username: string } | null;
                            return ed?.username
                              ? <Link href={`/profile/${ed.username}`} style={{ color: 'var(--link)' }}>{ed.username}</Link>
                              : <span style={{ color: 'var(--text-2)' }}>—</span>;
                          })()}
                        </td>
                        <td className="td-title">
                          {revision.article ? (
                            <Link href={`/wiki/${revision.article.slug}`}>
                              {revision.article.title}
                            </Link>
                          ) : (
                            <span style={{ color: 'var(--text-2)' }}>Deleted article</span>
                          )}
                        </td>
                        <td style={{ fontSize: '12px', color: 'var(--text-1)' }}>
                          {revision.edit_summary || <em style={{ color: 'var(--text-2)' }}>No summary</em>}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-2)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📝</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '8px' }}>
                    No Recent Changes
                  </h3>
                  <p style={{ marginBottom: '16px' }}>
                    There haven't been any edits yet. Be the first to contribute!
                  </p>
                  <Link href="/wiki/new" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                    Create First Article
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Activity Summary */}
          {revisions && revisions.length > 0 && (
            <div className="wiki-box">
              <div className="wiki-box-hd">Activity Summary</div>
              <div className="wiki-box-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ textAlign: 'center', padding: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--amber)', marginBottom: '4px' }}>
                      {revisions.length}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-1)' }}>Recent Edits</div>
                  </div>

                  <div style={{ textAlign: 'center', padding: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--amber)', marginBottom: '4px' }}>
                      {uniqueEditorCount}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-1)' }}>Active Editors</div>
                  </div>

                  <div style={{ textAlign: 'center', padding: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--amber)', marginBottom: '4px' }}>
                      {new Set(revisions.map(r => r.article?.slug).filter(Boolean)).size}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-1)' }}>Articles Updated</div>
                  </div>

                  <div style={{ textAlign: 'center', padding: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--amber)', marginBottom: '4px' }}>
                      {revisions.filter(r => r.edit_summary).length}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-1)' }}>With Summaries</div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Quick Links</div>
            <div className="wiki-box-body">
              <Link href="/special/newpages" className="sidebar-link">New Pages</Link>
              <Link href="/special/allpages" className="sidebar-link">All Pages</Link>
              <Link href="/special/random" className="sidebar-link">Random Page</Link>
              <Link href="/statistics" className="sidebar-link">Statistics</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Recent Activity</div>
            <div className="wiki-box-body">
              <Link href="/community" className="sidebar-link">Community Portal</Link>
              <Link href="/contribute" className="sidebar-link">Contribute</Link>
              <Link href="/help/editing" className="sidebar-link">Editing Guide</Link>
              <Link href="/discord" className="sidebar-link">Discord Server</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">About Recent Changes</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>What this shows:</strong> The last 50 edits across all articles.
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>Edit summaries:</strong> Help others understand what changed.
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>Real-time:</strong> Updates automatically as edits are made.
              </p>
              <p>
                <strong>Contribute:</strong> Every edit helps improve the wiki!
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
