'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, Search, MessageSquare } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDateRelative } from '@/lib/utils';

interface CommentRow {
  id: string;
  content: string;
  created_at: string;
  articles: { title: string; slug: string } | null;
  profiles: { username: string } | null;
}

export default function AdminCommentsPage() {
  const [comments, setComments] = useState<CommentRow[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAccess();
    fetchComments();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login'); return; }
    const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    const role = (data as { role: string } | null)?.role;
    if (role !== 'admin' && role !== 'moderator') router.push('/');
  };

  const fetchComments = async () => {
    const { data } = await supabase
      .from('comments')
      .select('id, content, created_at, articles(title, slug), profiles(username)')
      .order('created_at', { ascending: false })
      .limit(300);
    if (data) setComments(data as unknown as CommentRow[]);
    setLoading(false);
  };

  const deleteComment = async (id: string) => {
    if (!confirm('Delete this comment?')) return;
    await supabase.from('comments').delete().eq('id', id);
    setComments(prev => prev.filter(c => c.id !== id));
  };

  const filtered = comments.filter(c => {
    const q = search.toLowerCase();
    return !q ||
      c.content.toLowerCase().includes(q) ||
      (c.profiles?.username ?? '').toLowerCase().includes(q) ||
      (c.articles?.title ?? '').toLowerCase().includes(q);
  });

  return (
    <>
      <div className="page-hd">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/admin" style={{ color: 'var(--text-2)', display: 'flex' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="page-hd-title">Comment Moderation</div>
            <div className="page-hd-sub">{comments.length} total comments</div>
          </div>
        </div>
      </div>

      <div className="wiki-box" style={{ marginBottom: '16px' }}>
        <div style={{ padding: '10px 12px', display: 'flex', alignItems: 'center', gap: '8px', borderBottom: '1px solid var(--border)' }}>
          <Search size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search by content, author, or article…"
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
            <MessageSquare size={32} />
            <p style={{ fontSize: '13px' }}>No comments found</p>
          </div>
        </div>
      ) : (
        <div className="wiki-box">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>Author</th>
                <th>Comment</th>
                <th>Article</th>
                <th>Date</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id}>
                  <td style={{ whiteSpace: 'nowrap', color: 'var(--text-1)', fontSize: '12px' }}>
                    {c.profiles?.username ?? <em style={{ color: 'var(--text-3)' }}>deleted</em>}
                  </td>
                  <td style={{ fontSize: '12px', color: 'var(--text-1)', maxWidth: '340px' }}>
                    <span style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {c.content}
                    </span>
                  </td>
                  <td style={{ fontSize: '12px', whiteSpace: 'nowrap' }}>
                    {c.articles ? (
                      <Link href={`/wiki/${c.articles.slug}`} style={{ color: 'var(--link)' }}>
                        {c.articles.title}
                      </Link>
                    ) : <em style={{ color: 'var(--text-3)' }}>deleted article</em>}
                  </td>
                  <td style={{ fontSize: '11px', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                    {formatDateRelative(c.created_at)}
                  </td>
                  <td>
                    <button
                      onClick={() => deleteComment(c.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--crimson)', padding: '4px', display: 'flex' }}
                      title="Delete comment"
                    >
                      <Trash2 size={14} />
                    </button>
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
