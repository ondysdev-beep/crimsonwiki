'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Zap, Clock, FileText, Eye, EyeOff, Trash2, ExternalLink, Pencil, FolderOpen } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDateRelative } from '@/lib/utils';
import type { Category } from '@/lib/types/database';

interface RecentActivity {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  updated_at: string;
  category_name: string | null;
  editor: string | null;
}

interface DraftRow {
  id: string;
  slug: string;
  title: string;
  updated_at: string;
  category_name: string | null;
  word_count: number;
}

function wordCount(text: string | null): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function AdminQuickPage() {
  const [recent, setRecent] = useState<RecentActivity[]>([]);
  const [drafts, setDrafts] = useState<DraftRow[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [moveId, setMoveId] = useState<string | null>(null);
  const [moveCat, setMoveCat] = useState('');
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
    const [{ data: recentData }, { data: draftData }, { data: catData }] = await Promise.all([
      supabase
        .from('articles')
        .select('id, slug, title, is_published, updated_at, categories(name), profiles!articles_updated_by_fkey(username)')
        .order('updated_at', { ascending: false })
        .limit(20),
      supabase
        .from('articles')
        .select('id, slug, title, updated_at, content_text, categories(name)')
        .eq('is_published', false)
        .order('updated_at', { ascending: false }),
      supabase.from('categories').select('*').order('name'),
    ]);

    if (recentData) {
      setRecent((recentData as unknown as {
        id: string; slug: string; title: string; is_published: boolean; updated_at: string;
        categories: { name: string } | null;
        profiles: { username: string } | null;
      }[]).map(a => ({
        id: a.id, slug: a.slug, title: a.title,
        is_published: a.is_published, updated_at: a.updated_at,
        category_name: a.categories?.name ?? null,
        editor: a.profiles?.username ?? null,
      })));
    }
    if (draftData) {
      setDrafts((draftData as unknown as {
        id: string; slug: string; title: string; updated_at: string;
        content_text: string | null; categories: { name: string } | null;
      }[]).map(a => ({
        id: a.id, slug: a.slug, title: a.title, updated_at: a.updated_at,
        category_name: a.categories?.name ?? null,
        word_count: wordCount(a.content_text),
      })));
    }
    if (catData) setCategories(catData as Category[]);
    setLoading(false);
  };

  const togglePublish = async (id: string, current: boolean) => {
    await supabase.from('articles').update({ is_published: !current }).eq('id', id);
    fetchData();
  };

  const deleteArticle = async (id: string, title: string) => {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    await supabase.from('articles').delete().eq('id', id);
    fetchData();
  };

  const handleMove = async () => {
    if (!moveId) return;
    const catId = moveCat ? parseInt(moveCat) : null;
    await supabase.from('articles').update({ category_id: catId }).eq('id', moveId);
    setMoveId(null);
    setMoveCat('');
    fetchData();
  };

  const publishAllDrafts = async () => {
    if (!confirm(`Publish all ${drafts.length} drafts?`)) return;
    for (const d of drafts) {
      await supabase.from('articles').update({ is_published: true }).eq('id', d.id);
    }
    fetchData();
  };

  const inputStyle = {
    background: 'var(--bg-2)', border: '1px solid var(--border-2)',
    color: 'var(--text-0)', fontSize: '12px', padding: '0 8px',
    outline: 'none', fontFamily: 'var(--ff)',
  };

  if (loading) return <div className="settings-page"><div className="settings-loading">Loading...</div></div>;

  return (
    <>
      {/* MOVE MODAL */}
      {moveId && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: 'var(--bg-1)', border: '1px solid var(--border)', padding: '24px', width: '360px', maxWidth: '90vw' }}>
            <div style={{ fontSize: '14px', fontWeight: '700', color: 'var(--text-0)', marginBottom: '16px' }}>Move Article to Category</div>
            <select value={moveCat} onChange={e => setMoveCat(e.target.value)} style={{ ...inputStyle, width: '100%', height: '30px', marginBottom: '16px' }}>
              <option value="">— No category —</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button type="button" onClick={() => setMoveId(null)} style={{ ...inputStyle, height: '28px', padding: '0 14px', cursor: 'pointer' }}>Cancel</button>
              <button type="button" onClick={handleMove} className="btn-login" style={{ height: '28px', padding: '0 14px' }}>Move</button>
            </div>
          </div>
        </div>
      )}

      <div className="page-hd">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/admin" style={{ color: 'var(--text-2)', display: 'flex' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="page-hd-title">Quick Actions</div>
            <div className="page-hd-sub">Recent activity · Draft management · Fast edits</div>
          </div>
        </div>
      </div>

      {/* QUICK LINKS */}
      <div className="wiki-box" style={{ marginBottom: '16px' }}>
        <div className="wiki-box-hd" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Zap size={13} /> Quick Links
        </div>
        <div className="wiki-box-body" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
          {[
            { href: '/wiki/new', label: '+ New Article' },
            { href: '/admin/articles', label: 'All Articles' },
            { href: '/admin/categories', label: 'Categories' },
            { href: '/admin/subcategories', label: 'Subcategories' },
            { href: '/admin/content', label: 'Content Audit' },
            { href: '/admin/stubs', label: 'Stub Articles' },
            { href: '/admin/comments', label: 'Comments' },
            { href: '/admin/users', label: 'Users' },
          ].map(({ href, label }) => (
            <Link key={href} href={href} style={{
              display: 'block', padding: '8px 12px', fontSize: '12px', fontWeight: '600',
              border: '1px solid var(--border)', background: 'var(--bg-3)',
              color: 'var(--text-0)', textDecoration: 'none',
            }}>{label}</Link>
          ))}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* RECENT ACTIVITY */}
        <div className="wiki-box">
          <div className="wiki-box-hd" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Clock size={13} /> Recently Updated ({recent.length})
          </div>
          <div className="wiki-box-body" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {recent.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-0)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                    {a.editor && <><span style={{ color: 'var(--text-2)' }}>{a.editor}</span> · </>}
                    {formatDateRelative(a.updated_at)}
                    {a.category_name && <> · <span style={{ color: 'var(--text-2)' }}>{a.category_name}</span></>}
                  </div>
                </div>
                <span style={{ fontSize: '10px', padding: '1px 5px', flexShrink: 0, background: a.is_published ? 'rgba(51,204,119,0.1)' : 'rgba(200,130,10,0.1)', border: `1px solid ${a.is_published ? 'rgba(51,204,119,0.25)' : 'rgba(200,130,10,0.25)'}`, color: a.is_published ? '#33cc77' : 'var(--amber)' }}>
                  {a.is_published ? 'pub' : 'draft'}
                </span>
                <Link href={`/wiki/${a.slug}/edit`} style={{ color: 'var(--text-2)', lineHeight: 0, flexShrink: 0 }}><Pencil size={12} /></Link>
                <button type="button" onClick={() => { setMoveId(a.id); setMoveCat(''); }} title="Move to category" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: 0, lineHeight: 0, flexShrink: 0 }}>
                  <FolderOpen size={12} />
                </button>
                <button type="button" onClick={() => togglePublish(a.id, a.is_published)} title={a.is_published ? 'Unpublish' : 'Publish'} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: 0, lineHeight: 0, flexShrink: 0 }}>
                  {a.is_published ? <EyeOff size={12} /> : <Eye size={12} />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* DRAFTS */}
        <div className="wiki-box">
          <div className="wiki-box-hd" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={13} /> Drafts ({drafts.length})
            </span>
            {drafts.length > 0 && (
              <button type="button" onClick={publishAllDrafts} style={{ fontSize: '11px', padding: '2px 10px', background: 'rgba(51,204,119,0.1)', border: '1px solid rgba(51,204,119,0.3)', color: '#33cc77', cursor: 'pointer', fontFamily: 'var(--ff)' }}>
                Publish all
              </button>
            )}
          </div>
          <div className="wiki-box-body" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            {drafts.length === 0 && (
              <div style={{ fontSize: '12px', color: 'var(--text-2)', textAlign: 'center', padding: '20px' }}>No drafts.</div>
            )}
            {drafts.map(a => (
              <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 0', borderBottom: '1px solid var(--border)' }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-0)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{a.title}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-3)' }}>
                    {a.word_count} words · {formatDateRelative(a.updated_at)}
                    {a.category_name && <> · <span style={{ color: 'var(--text-2)' }}>{a.category_name}</span></>}
                  </div>
                </div>
                <Link href={`/wiki/${a.slug}`} style={{ color: 'var(--text-2)', lineHeight: 0, flexShrink: 0 }} title="Preview"><ExternalLink size={12} /></Link>
                <Link href={`/wiki/${a.slug}/edit`} style={{ color: 'var(--amber)', lineHeight: 0, flexShrink: 0 }} title="Edit"><Pencil size={12} /></Link>
                <button type="button" onClick={() => togglePublish(a.id, false)} title="Publish" style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#33cc77', padding: 0, lineHeight: 0, flexShrink: 0 }}>
                  <Eye size={12} />
                </button>
                <button type="button" onClick={() => deleteArticle(a.id, a.title)} title="Delete" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: 0, lineHeight: 0, flexShrink: 0 }}>
                  <Trash2 size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
