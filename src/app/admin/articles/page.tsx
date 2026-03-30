'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Eye, EyeOff, Trash2, ExternalLink, Pencil } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDate } from '@/lib/utils';
import type { Article } from '@/lib/types/database';

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft'>('all');
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAccess();
    fetchArticles();
  }, []);

  const checkAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login'); return; }
    const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    const role = (data as { role: string } | null)?.role;
    if (role !== 'admin' && role !== 'moderator') router.push('/');
  };

  const fetchArticles = async () => {
    const { data } = await supabase
      .from('articles')
      .select('*')
      .order('updated_at', { ascending: false });
    if (data) setArticles(data as Article[]);
    setLoading(false);
  };

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from('articles').update({ is_published: !current }).eq('id', id);
    fetchArticles();
  };

  const deleteArticle = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await supabase.from('articles').delete().eq('id', id);
    fetchArticles();
  };

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase());
    if (filter === 'published') return matchSearch && a.is_published;
    if (filter === 'draft') return matchSearch && !a.is_published;
    return matchSearch;
  });

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Manage Articles</div>
          <div className="page-hd-sub">
            <Link href="/admin" style={{ color: 'var(--link)' }}>← Admin</Link>
            &nbsp;· {articles.length} total
          </div>
        </div>
      </div>

      {/* FILTERS */}
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Search style={{ width: 13, height: 13, color: 'var(--text-2)', flexShrink: 0 }} />
          <input
            type="text"
            placeholder="Search articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '240px', height: '26px',
              background: 'var(--bg-2)', border: '1px solid var(--border-2)',
              color: 'var(--text-0)', fontSize: '12px', padding: '0 8px',
              outline: 'none', fontFamily: 'var(--ff)',
            }}
          />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['all', 'published', 'draft'] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => setFilter(f)}
              style={{
                padding: '3px 10px', fontSize: '11px', fontWeight: '600',
                border: `1px solid ${filter === f ? 'rgba(155,32,32,0.4)' : 'var(--border-2)'}`,
                background: filter === f ? 'rgba(155,32,32,0.1)' : 'var(--bg-2)',
                color: filter === f ? 'var(--crimson-bright)' : 'var(--text-2)',
                cursor: 'pointer', fontFamily: 'var(--ff)',
              }}
            >
              {f === 'all' ? 'All' : f === 'published' ? 'Published' : 'Drafts'}
            </button>
          ))}
        </div>
      </div>

      {/* TABLE */}
      <div className="wiki-box">
        <div className="wiki-box-hd">Articles ({filtered.length})</div>
        <table className="article-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Views</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((article) => (
              <tr key={article.id}>
                <td className="td-title">
                  <div>{article.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>/wiki/{article.slug}</div>
                </td>
                <td>
                  <span style={{
                    fontSize: '11px', fontWeight: '600', padding: '2px 8px',
                    background: article.is_published ? 'rgba(51,204,119,0.1)' : 'rgba(200,130,10,0.1)',
                    border: `1px solid ${article.is_published ? 'rgba(51,204,119,0.25)' : 'rgba(200,130,10,0.25)'}`,
                    color: article.is_published ? '#33cc77' : 'var(--amber)',
                  }}>
                    {article.is_published ? 'Published' : 'Draft'}
                  </span>
                </td>
                <td className="td-views">{article.view_count.toLocaleString()}</td>
                <td className="td-meta">{formatDate(article.updated_at)}</td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Link href={`/wiki/${article.slug}`} title="View" style={{ color: 'var(--text-2)', lineHeight: 0 }}>
                      <ExternalLink style={{ width: 14, height: 14 }} />
                    </Link>
                    <Link href={`/wiki/${article.slug}/edit`} title="Edit" style={{ color: 'var(--text-2)', lineHeight: 0 }}>
                      <Pencil style={{ width: 14, height: 14 }} />
                    </Link>
                    <button
                      type="button"
                      onClick={() => togglePublish(article.id, article.is_published)}
                      title={article.is_published ? 'Unpublish' : 'Publish'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: '2px', lineHeight: 0 }}
                    >
                      {article.is_published ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteArticle(article.id, article.title)}
                      title="Delete"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: '2px', lineHeight: 0 }}
                    >
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-2)', fontSize: '12px' }}>
            No articles found.
          </div>
        )}
      </div>
    </>
  );
}
