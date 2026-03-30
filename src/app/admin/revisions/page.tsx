'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, GitBranch, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDateRelative } from '@/lib/utils';

interface RevisionRow {
  id: string;
  edit_summary: string | null;
  created_at: string;
  articles: { title: string; slug: string } | null;
  profiles: { username: string } | null;
}

export default function AdminRevisionsPage() {
  const [revisions, setRevisions] = useState<RevisionRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAccess();
    fetchRevisions();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login'); return; }
    const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    const role = (data as { role: string } | null)?.role;
    if (role !== 'admin' && role !== 'moderator') router.push('/');
  };

  const fetchRevisions = async () => {
    const { data } = await supabase
      .from('article_revisions')
      .select('id, edit_summary, created_at, articles(title, slug), profiles!article_revisions_edited_by_fkey(username)')
      .order('created_at', { ascending: false })
      .limit(100);
    if (data) setRevisions(data as unknown as RevisionRow[]);
    setLoading(false);
  };

  const filtered = revisions.filter(r => {
    const q = search.toLowerCase();
    return !q ||
      (r.articles?.title ?? '').toLowerCase().includes(q) ||
      (r.profiles?.username ?? '').toLowerCase().includes(q) ||
      (r.edit_summary ?? '').toLowerCase().includes(q);
  });

  return (
    <>
      <div className="page-hd">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/admin" style={{ color: 'var(--text-2)', display: 'flex' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="page-hd-title">Recent Revisions</div>
            <div className="page-hd-sub">Last {revisions.length} edits across all articles</div>
          </div>
        </div>
      </div>

      <div className="wiki-box" style={{ marginBottom: '16px' }}>
        <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)' }}>
          <Search size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by article, editor, or summary…"
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ background: 'none', border: 'none', outline: 'none', color: 'var(--text-0)', fontFamily: 'var(--ff)', fontSize: '12px', width: '100%' }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-2)', fontSize: '13px', padding: '20px' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="wiki-box">
          <div className="wiki-box-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', color: 'var(--text-2)', gap: '8px' }}>
            <GitBranch size={32} />
            <p style={{ fontSize: '13px' }}>No revisions found</p>
          </div>
        </div>
      ) : (
        <div className="wiki-box">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Editor</th>
                <th>Summary</th>
                <th>Date</th>
                <th style={{ width: 60 }}>Diff</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(r => (
                <tr key={r.id}>
                  <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {r.articles ? (
                      <Link href={`/wiki/${r.articles.slug}`} style={{ color: 'var(--text-0)', fontWeight: 500 }}>
                        {r.articles.title}
                      </Link>
                    ) : <em style={{ color: 'var(--text-3)' }}>deleted</em>}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-1)', whiteSpace: 'nowrap' }}>
                    {r.profiles?.username ?? <em style={{ color: 'var(--text-3)' }}>anon</em>}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-2)', maxWidth: '300px' }}>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {r.edit_summary || <em style={{ color: 'var(--text-3)' }}>no summary</em>}
                    </span>
                  </td>
                  <td style={{ fontSize: '11px', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                    {formatDateRelative(r.created_at)}
                  </td>
                  <td>
                    {r.articles && (
                      <Link
                        href={`/wiki/${r.articles.slug}/history/${r.id}`}
                        style={{ fontSize: '11px', color: 'var(--link)' }}
                      >
                        view diff
                      </Link>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
