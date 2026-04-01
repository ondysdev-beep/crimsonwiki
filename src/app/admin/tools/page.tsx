'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Database, Download, CheckCircle, AlertTriangle, Search, Globe, RefreshCw } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface HealthItem {
  label: string;
  status: 'ok' | 'warn' | 'error';
  detail: string;
}

interface SEORow {
  id: string;
  slug: string;
  title: string;
  excerpt: string | null;
  cover_image_url: string | null;
  category_name: string | null;
}

export default function AdminToolsPage() {
  const [tab, setTab] = useState<'health' | 'backup' | 'seo'>('health');
  const [health, setHealth] = useState<HealthItem[]>([]);
  const [seoRows, setSeoRows] = useState<SEORow[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [backupData, setBackupData] = useState<{ categories: unknown[]; settings: unknown[]; redirects: unknown[] } | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAccess();
    fetchAll();
  }, []);

  const checkAccess = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user || error) { router.push('/auth/login'); return; }
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const role = (data as { role: string } | null)?.role;
    if (role !== 'admin' && role !== 'moderator') router.push('/');
  };

  const fetchAll = async () => {
    setRefreshing(true);
    await Promise.all([runHealthCheck(), fetchSEO(), fetchBackupData()]);
    setLoading(false);
    setRefreshing(false);
  };

  const runHealthCheck = async () => {
    const items: HealthItem[] = [];

    const { count: artCount, error: artErr } = await supabase.from('articles').select('*', { count: 'exact', head: true });
    items.push({
      label: 'Articles table',
      status: artErr ? 'error' : 'ok',
      detail: artErr ? artErr.message : `${artCount ?? 0} articles accessible`,
    });

    const { count: catCount, error: catErr } = await supabase.from('categories').select('*', { count: 'exact', head: true });
    items.push({
      label: 'Categories table',
      status: catErr ? 'error' : 'ok',
      detail: catErr ? catErr.message : `${catCount ?? 0} categories accessible`,
    });

    const { count: profCount, error: profErr } = await supabase.from('profiles').select('*', { count: 'exact', head: true });
    items.push({
      label: 'Profiles table',
      status: profErr ? 'error' : 'ok',
      detail: profErr ? profErr.message : `${profCount ?? 0} users accessible`,
    });

    const { count: settCount, error: settErr } = await supabase.from('site_settings').select('*', { count: 'exact', head: true });
    items.push({
      label: 'Site Settings table',
      status: settErr ? 'error' : 'ok',
      detail: settErr ? settErr.message : `${settCount ?? 0} settings keys`,
    });

    const { data: noSlugData } = await supabase.from('articles').select('id').is('slug', null);
    items.push({
      label: 'Articles missing slug',
      status: (noSlugData?.length ?? 0) > 0 ? 'error' : 'ok',
      detail: (noSlugData?.length ?? 0) > 0 ? `${noSlugData!.length} articles have no slug!` : 'All articles have slugs',
    });

    const { data: noTitleData } = await supabase.from('articles').select('id').is('title', null);
    items.push({
      label: 'Articles missing title',
      status: (noTitleData?.length ?? 0) > 0 ? 'warn' : 'ok',
      detail: (noTitleData?.length ?? 0) > 0 ? `${noTitleData!.length} articles have no title` : 'All articles have titles',
    });

    const { data: orphanCats } = await supabase
      .from('categories')
      .select('id, parent_id')
      .not('parent_id', 'is', null);
    let brokenParents = 0;
    if (orphanCats) {
      const allIds = new Set((await supabase.from('categories').select('id')).data?.map((c: { id: number }) => c.id) ?? []);
      brokenParents = orphanCats.filter((c: { parent_id: number | null }) => c.parent_id !== null && !allIds.has(c.parent_id)).length;
    }
    items.push({
      label: 'Category parent references',
      status: brokenParents > 0 ? 'error' : 'ok',
      detail: brokenParents > 0 ? `${brokenParents} categories reference non-existent parents` : 'All parent references are valid',
    });

    const { data: revData, error: revErr } = await supabase.from('article_revisions').select('id', { count: 'exact', head: true });
    items.push({
      label: 'Revisions table',
      status: revErr ? 'error' : 'ok',
      detail: revErr ? revErr.message : `Revisions table accessible`,
    });
    // suppress unused var warning
    void revData;

    setHealth(items);
  };

  const fetchSEO = async () => {
    const { data } = await supabase
      .from('articles')
      .select('id, slug, title, excerpt, cover_image_url, categories(name)')
      .eq('is_published', true)
      .order('title');
    if (data) {
      setSeoRows((data as unknown as {
        id: string; slug: string; title: string;
        excerpt: string | null; cover_image_url: string | null;
        categories: { name: string } | null;
      }[]).map(a => ({
        id: a.id, slug: a.slug, title: a.title,
        excerpt: a.excerpt, cover_image_url: a.cover_image_url,
        category_name: a.categories?.name ?? null,
      })));
    }
  };

  const fetchBackupData = async () => {
    const [{ data: cats }, { data: settings }, { data: redirects }] = await Promise.all([
      supabase.from('categories').select('*'),
      supabase.from('site_settings').select('*'),
      supabase.from('redirects').select('*'),
    ]);
    setBackupData({
      categories: cats ?? [],
      settings: settings ?? [],
      redirects: redirects ?? [],
    });
  };

  const downloadBackup = () => {
    if (!backupData) return;
    const payload = {
      exported_at: new Date().toISOString(),
      ...backupData,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `crimsonwiki-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const seoMissingExcerpt = seoRows.filter(a => !a.excerpt);
  const seoMissingCover = seoRows.filter(a => !a.cover_image_url);
  const seoShortTitle = seoRows.filter(a => a.title.length < 10);

  const tabStyle = (t: string) => ({
    padding: '5px 14px', fontSize: '12px', fontWeight: '600' as const, cursor: 'pointer',
    border: `1px solid ${tab === t ? 'rgba(155,32,32,0.4)' : 'var(--border-2)'}`,
    background: tab === t ? 'rgba(155,32,32,0.1)' : 'var(--bg-2)',
    color: tab === t ? 'var(--crimson-bright)' : 'var(--text-2)',
    fontFamily: 'var(--ff)',
  });

  if (loading) return <div className="settings-page"><div className="settings-loading">Loading...</div></div>;

  const healthOk = health.filter(h => h.status === 'ok').length;
  const healthWarn = health.filter(h => h.status === 'warn').length;
  const healthErr = health.filter(h => h.status === 'error').length;

  return (
    <>
      <div className="page-hd">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/admin" style={{ color: 'var(--text-2)', display: 'flex' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="page-hd-title">System Tools</div>
            <div className="page-hd-sub">Database health · Backup · SEO audit</div>
          </div>
        </div>
        <button type="button" onClick={fetchAll} disabled={refreshing}
          style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 12px', background: 'var(--bg-3)', border: '1px solid var(--border-2)', color: 'var(--text-1)', cursor: 'pointer', fontFamily: 'var(--ff)', fontSize: '12px' }}>
          <RefreshCw size={12} /> Refresh
        </button>
      </div>

      {/* HEALTH SUMMARY */}
      <div className="stats-strip" style={{ marginBottom: '16px' }}>
        <div className="stat-cell"><span className="stat-num" style={{ color: '#33cc77' }}>{healthOk}</span><div className="stat-label">Passed</div></div>
        <div className="stat-cell"><span className="stat-num" style={{ color: healthWarn > 0 ? 'var(--amber)' : undefined }}>{healthWarn}</span><div className="stat-label">Warnings</div></div>
        <div className="stat-cell"><span className="stat-num" style={{ color: healthErr > 0 ? 'var(--crimson-bright)' : undefined }}>{healthErr}</span><div className="stat-label">Errors</div></div>
        <div className="stat-cell"><span className="stat-num" style={{ color: seoMissingExcerpt.length > 0 ? 'var(--amber)' : undefined }}>{seoMissingExcerpt.length}</span><div className="stat-label">No excerpt</div></div>
        <div className="stat-cell"><span className="stat-num" style={{ color: seoMissingCover.length > 0 ? 'var(--amber)' : undefined }}>{seoMissingCover.length}</span><div className="stat-label">No cover</div></div>
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '16px' }}>
        <button type="button" onClick={() => setTab('health')} style={tabStyle('health')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Database size={12} /> DB Health
            {healthErr > 0 && <span style={{ fontSize: '10px', background: 'rgba(155,32,32,0.2)', padding: '0 5px', color: 'var(--crimson-bright)' }}>{healthErr}</span>}
          </span>
        </button>
        <button type="button" onClick={() => setTab('backup')} style={tabStyle('backup')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Download size={12} /> Backup &amp; Restore
          </span>
        </button>
        <button type="button" onClick={() => setTab('seo')} style={tabStyle('seo')}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Globe size={12} /> SEO Audit
            {(seoMissingExcerpt.length + seoMissingCover.length) > 0 && (
              <span style={{ fontSize: '10px', background: 'rgba(200,130,10,0.2)', padding: '0 5px', color: 'var(--amber)' }}>
                {seoMissingExcerpt.length + seoMissingCover.length}
              </span>
            )}
          </span>
        </button>
      </div>

      {/* DB HEALTH TAB */}
      {tab === 'health' && (
        <div className="wiki-box">
          <div className="wiki-box-hd" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={13} /> Database Health Check
          </div>
          <div className="wiki-box-body" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {health.map((item, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '8px 12px', border: `1px solid ${item.status === 'error' ? 'rgba(155,32,32,0.3)' : item.status === 'warn' ? 'rgba(200,130,10,0.3)' : 'var(--border)'}`,
                background: item.status === 'error' ? 'rgba(155,32,32,0.05)' : item.status === 'warn' ? 'rgba(200,130,10,0.05)' : 'var(--bg-2)',
              }}>
                {item.status === 'ok'
                  ? <CheckCircle size={14} style={{ color: '#33cc77', flexShrink: 0 }} />
                  : item.status === 'warn'
                    ? <AlertTriangle size={14} style={{ color: 'var(--amber)', flexShrink: 0 }} />
                    : <AlertTriangle size={14} style={{ color: 'var(--crimson-bright)', flexShrink: 0 }} />}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '12px', fontWeight: '600', color: 'var(--text-0)' }}>{item.label}</div>
                  <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>{item.detail}</div>
                </div>
                <span style={{
                  fontSize: '10px', fontWeight: '700', padding: '1px 7px', textTransform: 'uppercase',
                  background: item.status === 'ok' ? 'rgba(51,204,119,0.1)' : item.status === 'warn' ? 'rgba(200,130,10,0.1)' : 'rgba(155,32,32,0.1)',
                  border: `1px solid ${item.status === 'ok' ? 'rgba(51,204,119,0.25)' : item.status === 'warn' ? 'rgba(200,130,10,0.25)' : 'rgba(155,32,32,0.25)'}`,
                  color: item.status === 'ok' ? '#33cc77' : item.status === 'warn' ? 'var(--amber)' : 'var(--crimson-bright)',
                }}>{item.status}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BACKUP TAB */}
      {tab === 'backup' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="wiki-box">
            <div className="wiki-box-hd" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Download size={13} /> Export Backup
            </div>
            <div className="wiki-box-body">
              <p style={{ fontSize: '12px', color: 'var(--text-1)', marginBottom: '12px', lineHeight: '1.6' }}>
                Exports a JSON file with all <strong>categories</strong>, <strong>site settings</strong>, and <strong>redirects</strong>.
                Articles are not included due to size — use Supabase Dashboard for a full database backup.
              </p>
              {backupData && (
                <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', fontSize: '12px', color: 'var(--text-2)' }}>
                  <span>· {backupData.categories.length} categories</span>
                  <span>· {backupData.settings.length} settings</span>
                  <span>· {backupData.redirects.length} redirects</span>
                </div>
              )}
              <button type="button" onClick={downloadBackup} className="btn-login"
                style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '30px', padding: '0 16px' }}>
                <Download size={13} /> Download Backup JSON
              </button>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Restore from Backup</div>
            <div className="wiki-box-body">
              <p style={{ fontSize: '12px', color: 'var(--text-1)', marginBottom: '12px', lineHeight: '1.6' }}>
                To restore categories from a backup file, use the <strong>Import JSON</strong> button on the&nbsp;
                <Link href="/admin/categories" style={{ color: 'var(--link)' }}>Categories page</Link>.
                Site settings can be restored manually via the <Link href="/admin/settings" style={{ color: 'var(--link)' }}>Settings page</Link>.
                Redirects can be re-added via <Link href="/admin/redirects" style={{ color: 'var(--link)' }}>Redirects page</Link>.
              </p>
              <div style={{ padding: '10px 12px', background: 'rgba(200,130,10,0.07)', border: '1px solid rgba(200,130,10,0.25)', fontSize: '11px', color: 'var(--amber)' }}>
                ⚠ For full database restore, use the Supabase Dashboard → Database → Backups.
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO TAB */}
      {tab === 'seo' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="wiki-box">
            <div className="wiki-box-hd" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Search size={13} /> Missing Excerpt / Meta Description ({seoMissingExcerpt.length})
            </div>
            {seoMissingExcerpt.length === 0
              ? <div className="wiki-box-body" style={{ fontSize: '12px', color: 'var(--text-2)' }}>✓ All published articles have an excerpt.</div>
              : <table className="article-table">
                  <thead><tr><th>Title</th><th>Category</th><th></th></tr></thead>
                  <tbody>
                    {seoMissingExcerpt.slice(0, 30).map(a => (
                      <tr key={a.id}>
                        <td className="td-title"><div>{a.title}</div><div style={{ fontSize: '11px', color: 'var(--text-2)' }}>/wiki/{a.slug}</div></td>
                        <td style={{ fontSize: '11px', color: 'var(--text-2)' }}>{a.category_name ?? '—'}</td>
                        <td><Link href={`/wiki/${a.slug}/edit`} style={{ color: 'var(--amber)', display: 'flex', padding: '4px' }} title="Edit"><span style={{ fontSize: '11px' }}>Edit</span></Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={13} /> Missing Cover Image / OG Image ({seoMissingCover.length})
            </div>
            {seoMissingCover.length === 0
              ? <div className="wiki-box-body" style={{ fontSize: '12px', color: 'var(--text-2)' }}>✓ All published articles have a cover image.</div>
              : <table className="article-table">
                  <thead><tr><th>Title</th><th>Category</th><th></th></tr></thead>
                  <tbody>
                    {seoMissingCover.slice(0, 30).map(a => (
                      <tr key={a.id}>
                        <td className="td-title"><div>{a.title}</div><div style={{ fontSize: '11px', color: 'var(--text-2)' }}>/wiki/{a.slug}</div></td>
                        <td style={{ fontSize: '11px', color: 'var(--text-2)' }}>{a.category_name ?? '—'}</td>
                        <td><Link href={`/wiki/${a.slug}/edit`} style={{ color: 'var(--amber)', display: 'flex', padding: '4px' }} title="Edit"><span style={{ fontSize: '11px' }}>Edit</span></Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <AlertTriangle size={13} /> Very short title — under 10 chars ({seoShortTitle.length})
            </div>
            {seoShortTitle.length === 0
              ? <div className="wiki-box-body" style={{ fontSize: '12px', color: 'var(--text-2)' }}>✓ All titles are reasonably long.</div>
              : <table className="article-table">
                  <thead><tr><th>Title</th><th>Length</th><th>Category</th><th></th></tr></thead>
                  <tbody>
                    {seoShortTitle.map(a => (
                      <tr key={a.id}>
                        <td className="td-title"><div>{a.title}</div><div style={{ fontSize: '11px', color: 'var(--text-2)' }}>/wiki/{a.slug}</div></td>
                        <td style={{ fontSize: '12px', color: 'var(--amber)' }}>{a.title.length}</td>
                        <td style={{ fontSize: '11px', color: 'var(--text-2)' }}>{a.category_name ?? '—'}</td>
                        <td><Link href={`/wiki/${a.slug}/edit`} style={{ color: 'var(--amber)', display: 'flex', padding: '4px' }}><span style={{ fontSize: '11px' }}>Edit</span></Link></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
            }
          </div>
        </div>
      )}
    </>
  );
}
