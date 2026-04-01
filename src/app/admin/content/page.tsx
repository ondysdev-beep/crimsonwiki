'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, AlertCircle, Copy, Unlink, FolderOpen, RefreshCw, ExternalLink, Pencil } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDateRelative } from '@/lib/utils';

interface AuditArticle {
  id: string;
  slug: string;
  title: string;
  is_published: boolean;
  updated_at: string;
  word_count: number;
  has_cover: boolean;
  category_id: number | null;
  category_name: string | null;
}

interface DuplicateGroup {
  title: string;
  articles: { id: string; slug: string; updated_at: string; is_published: boolean }[];
}

function wordCount(text: string | null): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function AdminContentPage() {
  const [tab, setTab] = useState<'audit' | 'duplicates' | 'orphaned'>('audit');
  const [articles, setArticles] = useState<AuditArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
    setRefreshing(true);
    const { data } = await supabase
      .from('articles')
      .select('id, slug, title, is_published, updated_at, content_text, cover_image_url, category_id, categories(name)')
      .order('updated_at', { ascending: false });

    if (data) {
      const mapped = (data as unknown as {
        id: string; slug: string; title: string; is_published: boolean;
        updated_at: string; content_text: string | null;
        cover_image_url: string | null; category_id: number | null;
        categories: { name: string } | null;
      }[]).map(a => ({
        id: a.id,
        slug: a.slug,
        title: a.title,
        is_published: a.is_published,
        updated_at: a.updated_at,
        word_count: wordCount(a.content_text),
        has_cover: !!a.cover_image_url,
        category_id: a.category_id,
        category_name: a.categories?.name ?? null,
      }));
      setArticles(mapped);
    }
    setLoading(false);
    setRefreshing(false);
  };

  // Audit issues
  const noCategory = articles.filter(a => !a.category_id);
  const shortArticles = articles.filter(a => a.word_count < 100 && a.is_published);
  const noCover = articles.filter(a => !a.has_cover && a.is_published);
  const unpublished = articles.filter(a => !a.is_published);

  // Duplicate detection (same title, case-insensitive)
  const dupGroups: DuplicateGroup[] = [];
  const titleMap: Record<string, AuditArticle[]> = {};
  articles.forEach(a => {
    const key = a.title.toLowerCase().trim();
    if (!titleMap[key]) titleMap[key] = [];
    titleMap[key].push(a);
  });
  Object.entries(titleMap).forEach(([, group]) => {
    if (group.length > 1) {
      dupGroups.push({
        title: group[0].title,
        articles: group.map(a => ({ id: a.id, slug: a.slug, updated_at: a.updated_at, is_published: a.is_published })),
      });
    }
  });

  // Orphaned = published articles with no category
  const orphaned = articles.filter(a => !a.category_id && a.is_published);

  const tabStyle = (t: string) => ({
    padding: '5px 14px', fontSize: '12px', fontWeight: '600' as const, cursor: 'pointer',
    border: `1px solid ${tab === t ? 'rgba(155,32,32,0.4)' : 'var(--border-2)'}`,
    background: tab === t ? 'rgba(155,32,32,0.1)' : 'var(--bg-2)',
    color: tab === t ? 'var(--crimson-bright)' : 'var(--text-2)',
    fontFamily: 'var(--ff)',
  });

  const badge = (n: number, warn = false) => (
    <span style={{
      marginLeft: '6px', fontSize: '10px', fontWeight: '700', padding: '1px 6px',
      background: n > 0 ? (warn ? 'rgba(155,32,32,0.15)' : 'rgba(200,130,10,0.15)') : 'var(--bg-3)',
      border: `1px solid ${n > 0 ? (warn ? 'rgba(155,32,32,0.3)' : 'rgba(200,130,10,0.3)') : 'var(--border)'}`,
      color: n > 0 ? (warn ? 'var(--crimson-bright)' : 'var(--amber)') : 'var(--text-3)',
    }}>{n}</span>
  );

  if (loading) return <div className="settings-page"><div className="settings-loading">Loading...</div></div>;

  return (
    <>
      <div className="page-hd">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/admin" style={{ color: 'var(--text-2)', display: 'flex' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="page-hd-title">Content Management</div>
            <div className="page-hd-sub">Audit · Duplicates · Orphaned content</div>
          </div>
        </div>
        <button type="button" onClick={fetchData} disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'var(--bg-3)', border: '1px solid var(--border-2)', color: 'var(--text-1)', cursor: 'pointer', fontFamily: 'var(--ff)', fontSize: '12px' }}>
          <RefreshCw size={12} style={{ animation: refreshing ? 'spin 1s linear infinite' : undefined }} /> Refresh
        </button>
      </div>

      {/* STATS STRIP */}
      <div className="stats-strip" style={{ marginBottom: '16px' }}>
        <div className="stat-cell"><span className="stat-num">{articles.length}</span><div className="stat-label">Total articles</div></div>
        <div className="stat-cell"><span className="stat-num" style={{ color: noCategory.length > 0 ? 'var(--amber)' : undefined }}>{noCategory.length}</span><div className="stat-label">No category</div></div>
        <div className="stat-cell"><span className="stat-num" style={{ color: shortArticles.length > 0 ? 'var(--amber)' : undefined }}>{shortArticles.length}</span><div className="stat-label">Too short</div></div>
        <div className="stat-cell"><span className="stat-num" style={{ color: dupGroups.length > 0 ? 'var(--crimson-bright)' : undefined }}>{dupGroups.length}</span><div className="stat-label">Duplicates</div></div>
        <div className="stat-cell"><span className="stat-num">{unpublished.length}</span><div className="stat-label">Drafts</div></div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        <button type="button" onClick={() => setTab('audit')} style={tabStyle('audit')}>
          Content Audit {badge(noCategory.length + shortArticles.length + noCover.length, true)}
        </button>
        <button type="button" onClick={() => setTab('duplicates')} style={tabStyle('duplicates')}>
          Duplicates {badge(dupGroups.length, dupGroups.length > 0)}
        </button>
        <button type="button" onClick={() => setTab('orphaned')} style={tabStyle('orphaned')}>
          Orphaned {badge(orphaned.length)}
        </button>
      </div>

      {/* AUDIT TAB */}
      {tab === 'audit' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {/* No category */}
          <div className="wiki-box">
            <div className="wiki-box-hd" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FolderOpen size={13} />
              Articles without category ({noCategory.length})
            </div>
            {noCategory.length === 0
              ? <div className="wiki-box-body" style={{ fontSize: '12px', color: 'var(--text-2)' }}>✓ All articles have a category.</div>
              : <table className="article-table">
                  <thead><tr><th>Title</th><th>Status</th><th>Updated</th><th></th></tr></thead>
                  <tbody>
                    {noCategory.map(a => (
                      <tr key={a.id}>
                        <td className="td-title"><div>{a.title}</div><div style={{ fontSize: '11px', color: 'var(--text-2)' }}>/wiki/{a.slug}</div></td>
                        <td><span style={{ fontSize: '11px', padding: '2px 6px', background: a.is_published ? 'rgba(51,204,119,0.1)' : 'rgba(200,130,10,0.1)', border: `1px solid ${a.is_published ? 'rgba(51,204,119,0.25)' : 'rgba(200,130,10,0.25)'}`, color: a.is_published ? '#33cc77' : 'var(--amber)' }}>{a.is_published ? 'Published' : 'Draft'}</span></td>
                        <td className="td-meta">{formatDateRelative(a.updated_at)}</td>
                        <td><Link href={`/wiki/${a.slug}/edit`} style={{ color: 'var(--amber)', display: 'flex', padding: '4px' }}><Pencil size={13} /></Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>

          {/* Too short */}
          <div className="wiki-box">
            <div className="wiki-box-hd" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={13} />
              Published articles under 100 words ({shortArticles.length})
            </div>
            {shortArticles.length === 0
              ? <div className="wiki-box-body" style={{ fontSize: '12px', color: 'var(--text-2)' }}>✓ All published articles meet the minimum length.</div>
              : <table className="article-table">
                  <thead><tr><th>Title</th><th>Words</th><th>Category</th><th>Updated</th><th></th></tr></thead>
                  <tbody>
                    {shortArticles.map(a => (
                      <tr key={a.id}>
                        <td className="td-title"><div>{a.title}</div><div style={{ fontSize: '11px', color: 'var(--text-2)' }}>/wiki/{a.slug}</div></td>
                        <td style={{ fontSize: '12px', color: 'var(--crimson-bright)', fontWeight: '600' }}>{a.word_count}</td>
                        <td style={{ fontSize: '11px', color: 'var(--text-2)' }}>{a.category_name ?? '—'}</td>
                        <td className="td-meta">{formatDateRelative(a.updated_at)}</td>
                        <td><Link href={`/wiki/${a.slug}/edit`} style={{ color: 'var(--amber)', display: 'flex', padding: '4px' }}><Pencil size={13} /></Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>

          {/* No cover image */}
          <div className="wiki-box">
            <div className="wiki-box-hd" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertCircle size={13} />
              Published articles without cover image ({noCover.length})
            </div>
            {noCover.length === 0
              ? <div className="wiki-box-body" style={{ fontSize: '12px', color: 'var(--text-2)' }}>✓ All published articles have a cover image.</div>
              : <table className="article-table">
                  <thead><tr><th>Title</th><th>Category</th><th>Updated</th><th></th></tr></thead>
                  <tbody>
                    {noCover.slice(0, 50).map(a => (
                      <tr key={a.id}>
                        <td className="td-title"><div>{a.title}</div><div style={{ fontSize: '11px', color: 'var(--text-2)' }}>/wiki/{a.slug}</div></td>
                        <td style={{ fontSize: '11px', color: 'var(--text-2)' }}>{a.category_name ?? '—'}</td>
                        <td className="td-meta">{formatDateRelative(a.updated_at)}</td>
                        <td><Link href={`/wiki/${a.slug}/edit`} style={{ color: 'var(--amber)', display: 'flex', padding: '4px' }}><Pencil size={13} /></Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        </div>
      )}

      {/* DUPLICATES TAB */}
      {tab === 'duplicates' && (
        <div className="wiki-box">
          <div className="wiki-box-hd" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Copy size={13} />
            Duplicate titles ({dupGroups.length} groups)
          </div>
          {dupGroups.length === 0
            ? <div className="wiki-box-body" style={{ fontSize: '12px', color: 'var(--text-2)' }}>✓ No duplicate titles found.</div>
            : <div className="wiki-box-body" style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-2)', marginBottom: '4px' }}>Articles sharing the exact same title (case-insensitive).</p>
                {dupGroups.map((group, i) => (
                  <div key={i} style={{ border: '1px solid rgba(155,32,32,0.2)', background: 'rgba(155,32,32,0.04)', padding: '10px 12px' }}>
                    <div style={{ fontSize: '12px', fontWeight: '700', color: 'var(--text-0)', marginBottom: '8px' }}>"{group.title}"</div>
                    {group.articles.map(a => (
                      <div key={a.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '4px 0', borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px', color: 'var(--text-2)', flex: 1 }}>/wiki/{a.slug}</span>
                        <span style={{ fontSize: '11px', padding: '1px 6px', background: a.is_published ? 'rgba(51,204,119,0.1)' : 'rgba(200,130,10,0.1)', border: `1px solid ${a.is_published ? 'rgba(51,204,119,0.25)' : 'rgba(200,130,10,0.25)'}`, color: a.is_published ? '#33cc77' : 'var(--amber)' }}>{a.is_published ? 'Published' : 'Draft'}</span>
                        <span style={{ fontSize: '11px', color: 'var(--text-3)' }}>{formatDateRelative(a.updated_at)}</span>
                        <Link href={`/wiki/${a.slug}`} style={{ color: 'var(--text-2)', lineHeight: 0 }} title="View"><ExternalLink size={13} /></Link>
                        <Link href={`/wiki/${a.slug}/edit`} style={{ color: 'var(--amber)', lineHeight: 0 }} title="Edit"><Pencil size={13} /></Link>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
          }
        </div>
      )}

      {/* ORPHANED TAB */}
      {tab === 'orphaned' && (
        <div className="wiki-box">
          <div className="wiki-box-hd" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Unlink size={13} />
            Orphaned published articles — no category ({orphaned.length})
          </div>
          {orphaned.length === 0
            ? <div className="wiki-box-body" style={{ fontSize: '12px', color: 'var(--text-2)' }}>✓ All published articles are assigned to a category.</div>
            : <>
                <div className="wiki-box-body" style={{ paddingBottom: '4px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-2)', marginBottom: '8px' }}>
                    These published articles are not in any category and won't appear in category pages.
                    Assign them a category via <Link href="/admin/articles" style={{ color: 'var(--link)' }}>Manage Articles</Link>.
                  </p>
                </div>
                <table className="article-table">
                  <thead><tr><th>Title</th><th>Words</th><th>Updated</th><th></th></tr></thead>
                  <tbody>
                    {orphaned.map(a => (
                      <tr key={a.id}>
                        <td className="td-title"><div>{a.title}</div><div style={{ fontSize: '11px', color: 'var(--text-2)' }}>/wiki/{a.slug}</div></td>
                        <td style={{ fontSize: '12px', color: 'var(--text-1)' }}>{a.word_count}</td>
                        <td className="td-meta">{formatDateRelative(a.updated_at)}</td>
                        <td style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
                          <Link href={`/wiki/${a.slug}`} style={{ color: 'var(--text-2)', lineHeight: 0 }}><ExternalLink size={13} /></Link>
                          <Link href={`/wiki/${a.slug}/edit`} style={{ color: 'var(--amber)', lineHeight: 0 }}><Pencil size={13} /></Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </>
          }
        </div>
      )}
    </>
  );
}
