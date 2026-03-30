'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, TrendingUp, Eye, FileText, Users } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface TopArticle { slug: string; title: string; view_count: number; categories: { name: string } | null; }
interface TopEditor  { username: string; edits: number; }
interface CatStat    { name: string; count: number; color: string | null; }

export default function AdminAnalyticsPage() {
  const [topArticles, setTopArticles]   = useState<TopArticle[]>([]);
  const [topEditors,  setTopEditors]    = useState<TopEditor[]>([]);
  const [catStats,    setCatStats]      = useState<CatStat[]>([]);
  const [totalViews,  setTotalViews]    = useState(0);
  const [totalEdits,  setTotalEdits]    = useState(0);
  const [loading,     setLoading]       = useState(true);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAccess();
    fetchData();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login'); return; }
    const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    const role = (data as { role: string } | null)?.role;
    if (role !== 'admin' && role !== 'moderator') router.push('/');
  };

  const fetchData = async () => {
    // Top articles by views
    const { data: artData } = await supabase
      .from('articles')
      .select('slug, title, view_count, categories(name)')
      .eq('is_published', true)
      .order('view_count', { ascending: false })
      .limit(10);
    if (artData) {
      setTopArticles(artData as unknown as TopArticle[]);
      setTotalViews((artData as TopArticle[]).reduce((s, a) => s + (a.view_count || 0), 0));
    }

    // Articles per category
    const { data: catData } = await supabase
      .from('categories')
      .select('name, color, articles(count)')
      .is('parent_id', null);
    if (catData) {
      const stats: CatStat[] = (catData as unknown as { name: string; color: string | null; articles: { count: number }[] }[])
        .map(c => ({ name: c.name, color: c.color, count: Array.isArray(c.articles) ? c.articles.length : 0 }))
        .sort((a, b) => b.count - a.count);
      setCatStats(stats);
    }

    // Top editors (by revision count)
    const { data: revData } = await supabase
      .from('article_revisions')
      .select('profiles!article_revisions_edited_by_fkey(username)');
    if (revData) {
      setTotalEdits(revData.length);
      const counts: Record<string, number> = {};
      (revData as unknown as { profiles: { username: string } | null }[]).forEach(r => {
        const u = r.profiles?.username;
        if (u) counts[u] = (counts[u] || 0) + 1;
      });
      const sorted: TopEditor[] = Object.entries(counts)
        .map(([username, edits]) => ({ username, edits }))
        .sort((a, b) => b.edits - a.edits)
        .slice(0, 10);
      setTopEditors(sorted);
    }

    setLoading(false);
  };

  if (loading) return <div style={{ color: 'var(--text-2)', fontSize: '13px', padding: '20px' }}>Loading analytics…</div>;

  const maxViews = topArticles[0]?.view_count || 1;
  const maxEdits = topEditors[0]?.edits || 1;
  const maxCat   = catStats[0]?.count || 1;

  return (
    <>
      <div className="page-hd">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/admin" style={{ color: 'var(--text-2)', display: 'flex' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="page-hd-title">Analytics</div>
            <div className="page-hd-sub">Content performance overview</div>
          </div>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="stats-strip" style={{ marginBottom: '16px' }}>
        {[
          { icon: Eye,      label: 'Total Views',  value: totalViews.toLocaleString() },
          { icon: FileText, label: 'Published',    value: topArticles.length + '+' },
          { icon: Users,    label: 'Total Edits',  value: totalEdits.toLocaleString() },
          { icon: TrendingUp, label: 'Categories', value: catStats.length },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="stat-cell">
            <span className="stat-num">{value}</span>
            <div className="stat-label">{label}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
        {/* TOP ARTICLES */}
        <div className="wiki-box">
          <div className="wiki-box-hd">Top Articles by Views</div>
          <div className="wiki-box-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topArticles.map((a, i) => (
              <div key={a.slug}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <Link href={`/wiki/${a.slug}`} style={{ fontSize: '12px', color: 'var(--text-0)' }}>
                    #{i + 1} {a.title}
                  </Link>
                  <span style={{ fontSize: '11px', color: 'var(--text-2)', whiteSpace: 'nowrap', marginLeft: '8px' }}>
                    {(a.view_count || 0).toLocaleString()} views
                  </span>
                </div>
                <div style={{ height: '3px', background: 'var(--bg-3)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round(((a.view_count || 0) / maxViews) * 100)}%`, height: '100%', background: 'var(--crimson)', borderRadius: '2px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* TOP EDITORS */}
        <div className="wiki-box">
          <div className="wiki-box-hd">Top Editors by Revisions</div>
          <div className="wiki-box-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {topEditors.map((e, i) => (
              <div key={e.username}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-0)' }}>#{i + 1} {e.username}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-2)' }}>{e.edits} edits</span>
                </div>
                <div style={{ height: '3px', background: 'var(--bg-3)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round((e.edits / maxEdits) * 100)}%`, height: '100%', background: 'var(--amber)', borderRadius: '2px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CATEGORY DISTRIBUTION */}
        <div className="wiki-box" style={{ gridColumn: '1 / -1' }}>
          <div className="wiki-box-hd">Articles per Category</div>
          <div className="wiki-box-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {catStats.filter(c => c.count > 0).map(c => (
              <div key={c.name}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '3px' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-0)' }}>{c.name}</span>
                  <span style={{ fontSize: '11px', color: 'var(--text-2)' }}>{c.count} articles</span>
                </div>
                <div style={{ height: '4px', background: 'var(--bg-3)', borderRadius: '2px', overflow: 'hidden' }}>
                  <div style={{ width: `${Math.round((c.count / maxCat) * 100)}%`, height: '100%', background: c.color || 'var(--amber)', borderRadius: '2px' }} />
                </div>
              </div>
            ))}
            {catStats.every(c => c.count === 0) && (
              <p style={{ fontSize: '12px', color: 'var(--text-2)', textAlign: 'center' }}>No articles assigned to categories yet.</p>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
