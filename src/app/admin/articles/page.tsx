'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search, Eye, EyeOff, Trash2, ExternalLink, Pencil, Copy, FolderOpen, CheckSquare, Square, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDate, slugify } from '@/lib/utils';
import type { Article, Category } from '@/lib/types/database';

interface ArticleWithCat extends Article {
  categories: { name: string; slug: string } | null;
}

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<ArticleWithCat[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'all' | 'published' | 'draft' | 'no-category'>('all');
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [bulkCatTarget, setBulkCatTarget] = useState('');
  const [showMoveModal, setShowMoveModal] = useState(false);
  const [moveSingleId, setMoveSingleId] = useState<string | null>(null);
  const [moveCatTarget, setMoveCatTarget] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAccess();
    fetchData();
  }, []);

  const checkAccess = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user || error) { router.push('/auth/login'); return; }
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const role = (data as { role: string } | null)?.role;
    if (role !== 'admin' && role !== 'moderator') router.push('/');
  };

  const fetchData = async () => {
    const [{ data: arts }, { data: cats }] = await Promise.all([
      supabase.from('articles').select('*, categories(name, slug)').order('updated_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);
    if (arts) setArticles(arts as unknown as ArticleWithCat[]);
    if (cats) setCategories(cats as Category[]);
    setLoading(false);
  };

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from('articles').update({ is_published: !current }).eq('id', id);
    fetchData();
  };

  const deleteArticle = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await supabase.from('articles').delete().eq('id', id);
    setSelected(prev => { const n = new Set(prev); n.delete(id); return n; });
    fetchData();
  };

  const cloneArticle = async (article: ArticleWithCat) => {
    const newSlug = slugify(`${article.title}-copy-${Date.now().toString().slice(-4)}`);
    await supabase.from('articles').insert({
      slug: newSlug,
      title: `${article.title} (Copy)`,
      category_id: article.category_id,
      content: article.content,
      content_text: article.content_text,
      excerpt: article.excerpt,
      is_published: false,
    });
    fetchData();
  };

  const openMoveModal = (id: string) => {
    setMoveSingleId(id);
    setMoveCatTarget('');
    setShowMoveModal(true);
  };

  const handleMoveSingle = async () => {
    if (!moveSingleId) return;
    const catId = moveCatTarget ? parseInt(moveCatTarget) : null;
    await supabase.from('articles').update({ category_id: catId }).eq('id', moveSingleId);
    setShowMoveModal(false);
    setMoveSingleId(null);
    fetchData();
  };

  const toggleSelect = (id: string) => {
    setSelected(prev => { const n = new Set(prev); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  };

  const toggleSelectAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map(a => a.id)));
    }
  };

  const bulkPublish = async (state: boolean) => {
    for (const id of Array.from(selected)) {
      await supabase.from('articles').update({ is_published: state }).eq('id', id);
    }
    setSelected(new Set());
    fetchData();
  };

  const bulkDelete = async () => {
    if (!confirm(`Delete ${selected.size} articles? This cannot be undone.`)) return;
    for (const id of Array.from(selected)) {
      await supabase.from('articles').delete().eq('id', id);
    }
    setSelected(new Set());
    fetchData();
  };

  const bulkMove = async () => {
    const catId = bulkCatTarget ? parseInt(bulkCatTarget) : null;
    for (const id of Array.from(selected)) {
      await supabase.from('articles').update({ category_id: catId }).eq('id', id);
    }
    setSelected(new Set());
    setBulkCatTarget('');
    fetchData();
  };

  const filtered = articles.filter((a) => {
    const matchSearch = a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.slug.toLowerCase().includes(search.toLowerCase());
    if (filter === 'published') return matchSearch && a.is_published;
    if (filter === 'draft') return matchSearch && !a.is_published;
    if (filter === 'no-category') return matchSearch && !a.category_id;
    return matchSearch;
  });

  const inputStyle = {
    background: 'var(--bg-2)', border: '1px solid var(--border-2)',
    color: 'var(--text-0)', fontSize: '12px', padding: '0 8px',
    outline: 'none', fontFamily: 'var(--ff)',
  };

  if (loading) {
    return <div className="settings-page"><div className="settings-loading">Loading...</div></div>;
  }

  return (
    <>
      {/* MOVE MODAL */}
      {showMoveModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', padding: '24px', width: '360px', maxWidth: '90vw' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-0)', marginBottom: '16px' }}>Move Article to Category</div>
            <select value={moveCatTarget} onChange={e => setMoveCatTarget(e.target.value)} style={{ ...inputStyle, width: '100%', height: '30px', marginBottom: '16px' }}>
              <option value="">— No category —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setShowMoveModal(false)} style={{ ...inputStyle, height: '28px', padding: '0 14px', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleMoveSingle} className="btn-login" style={{ height: '28px', padding: '0 14px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <ArrowRight style={{ width: 12, height: 12 }} /> Move
              </button>
            </div>
          </div>
        </div>
      )}

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
          <input type="text" placeholder="Search articles..." value={search} onChange={(e) => setSearch(e.target.value)}
            style={{ ...inputStyle, width: '240px', height: '26px' }} />
        </div>
        <div style={{ display: 'flex', gap: '4px' }}>
          {(['all', 'published', 'draft', 'no-category'] as const).map((f) => (
            <button key={f} type="button" onClick={() => setFilter(f)} style={{
              padding: '3px 10px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--ff)',
              border: `1px solid ${filter === f ? 'rgba(155,32,32,0.4)' : 'var(--border-2)'}`,
              background: filter === f ? 'rgba(155,32,32,0.1)' : 'var(--bg-2)',
              color: filter === f ? 'var(--crimson-bright)' : 'var(--text-2)',
            }}>
              {f === 'all' ? 'All' : f === 'published' ? 'Published' : f === 'draft' ? 'Drafts' : 'No Category'}
            </button>
          ))}
        </div>
      </div>

      {/* BULK ACTIONS BAR */}
      {selected.size > 0 && (
        <div style={{ marginBottom: '12px', padding: '10px 14px', background: 'rgba(74,158,255,0.06)', border: '1px solid rgba(74,158,255,0.25)', display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '12px', color: '#4a9eff', fontWeight: '600' }}>{selected.size} selected</span>
          <button type="button" onClick={() => bulkPublish(true)} style={{ padding: '3px 10px', fontSize: '11px', background: 'rgba(51,204,119,0.1)', border: '1px solid rgba(51,204,119,0.3)', color: '#33cc77', cursor: 'pointer', fontFamily: 'var(--ff)' }}>
            Publish all
          </button>
          <button type="button" onClick={() => bulkPublish(false)} style={{ padding: '3px 10px', fontSize: '11px', background: 'rgba(200,130,10,0.1)', border: '1px solid rgba(200,130,10,0.3)', color: 'var(--amber)', cursor: 'pointer', fontFamily: 'var(--ff)' }}>
            Unpublish all
          </button>
          <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
            <select value={bulkCatTarget} onChange={e => setBulkCatTarget(e.target.value)} style={{ ...inputStyle, height: '26px', minWidth: '160px' }}>
              <option value="">— Move to category… —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button type="button" onClick={bulkMove} style={{ padding: '3px 10px', fontSize: '11px', background: 'var(--bg-3)', border: '1px solid var(--border-2)', color: 'var(--text-1)', cursor: 'pointer', fontFamily: 'var(--ff)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <FolderOpen style={{ width: 11, height: 11 }} /> Move
            </button>
          </div>
          <button type="button" onClick={bulkDelete} style={{ padding: '3px 10px', fontSize: '11px', background: 'rgba(155,32,32,0.1)', border: '1px solid rgba(155,32,32,0.3)', color: 'var(--crimson-bright)', cursor: 'pointer', fontFamily: 'var(--ff)' }}>
            Delete all
          </button>
          <button type="button" onClick={() => setSelected(new Set())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: '11px', fontFamily: 'var(--ff)' }}>
            Clear
          </button>
        </div>
      )}

      {/* TABLE */}
      <div className="wiki-box">
        <div className="wiki-box-hd">Articles ({filtered.length})</div>
        <table className="article-table">
          <thead>
            <tr>
              <th style={{ width: 32 }}>
                <button type="button" onClick={toggleSelectAll} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: 0, lineHeight: 0 }}>
                  {selected.size > 0 && selected.size === filtered.length
                    ? <CheckSquare style={{ width: 14, height: 14 }} />
                    : <Square style={{ width: 14, height: 14 }} />}
                </button>
              </th>
              <th>Title</th>
              <th>Category</th>
              <th>Status</th>
              <th>Views</th>
              <th>Updated</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((article) => (
              <tr key={article.id} style={{ background: selected.has(article.id) ? 'rgba(74,158,255,0.05)' : undefined }}>
                <td>
                  <input type="checkbox" checked={selected.has(article.id)} onChange={() => toggleSelect(article.id)}
                    style={{ width: 13, height: 13, cursor: 'pointer', accentColor: '#4a9eff' }} />
                </td>
                <td className="td-title">
                  <div>{article.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>/wiki/{article.slug}</div>
                </td>
                <td style={{ fontSize: '11px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
                  {article.categories?.name ?? <span style={{ color: 'var(--text-3)' }}>—</span>}
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
                    <button type="button" onClick={() => openMoveModal(article.id)} title="Move to category"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: '2px', lineHeight: 0 }}>
                      <FolderOpen style={{ width: 14, height: 14 }} />
                    </button>
                    <button type="button" onClick={() => cloneArticle(article)} title="Clone article"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: '2px', lineHeight: 0 }}>
                      <Copy style={{ width: 14, height: 14 }} />
                    </button>
                    <button type="button" onClick={() => togglePublish(article.id, article.is_published)}
                      title={article.is_published ? 'Unpublish' : 'Publish'}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: '2px', lineHeight: 0 }}>
                      {article.is_published ? <EyeOff style={{ width: 14, height: 14 }} /> : <Eye style={{ width: 14, height: 14 }} />}
                    </button>
                    <button type="button" onClick={() => deleteArticle(article.id, article.title)} title="Delete"
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: '2px', lineHeight: 0 }}>
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-2)', fontSize: '12px' }}>No articles found.</div>
        )}
      </div>
    </>
  );
}
