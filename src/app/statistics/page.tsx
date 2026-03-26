import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { formatDate, SITE_NAME } from '@/lib/utils';
import type { ArticleWithCategory } from '@/lib/types/database';

export const metadata: Metadata = {
  title: 'Statistics',
  description: `Statistics for ${SITE_NAME} -- site metrics and activity data.`,
};

export default async function StatisticsPage() {
  const supabase = await createClient();

  // Get basic stats
  const [{ count: articleCount }, { count: userCount }, { count: editCount }, { count: commentCount }] = await Promise.all([
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('article_revisions').select('*', { count: 'exact', head: true }),
    supabase.from('comments').select('*', { count: 'exact', head: true }),
  ]);

  // Get top 10 most viewed articles
  const { data: topArticles } = await supabase
    .from('articles')
    .select('title, slug, view_count, updated_at, category:categories(name, slug)')
    .eq('is_published', true)
    .order('view_count', { ascending: false })
    .limit(10);

  // Get recent activity stats
  const monthStart = new Date();
  monthStart.setDate(1);
  monthStart.setHours(0, 0, 0, 0);

  const weekStart = new Date();
  weekStart.setDate(weekStart.getDate() - 7);

  const [{ count: articlesThisMonth }, { count: editsThisWeek }] = await Promise.all([
    supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', monthStart.toISOString())
      .eq('is_published', true),
    supabase
      .from('article_revisions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', weekStart.toISOString()),
  ]);

  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Statistics</div>
          <div className="page-hd-sub">Site metrics and activity data</div>
        </div>
      </div>

      {/* STATISTICS CONTENT */}
      <div className="content-grid">
        <div>
          {/* OVERVIEW STATS */}
          <div className="wiki-box">
            <div className="wiki-box-hd">Overview</div>
            <div className="wiki-box-body">
              <table className="wiki-table">
                <thead>
                  <tr>
                    <th>Metric</th>
                    <th className="td-count">Count</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Published Articles</td>
                    <td className="td-count">{articleCount?.toLocaleString() || '0'}</td>
                  </tr>
                  <tr>
                    <td>Registered Users</td>
                    <td className="td-count">{userCount?.toLocaleString() || '0'}</td>
                  </tr>
                  <tr>
                    <td>Total Edits</td>
                    <td className="td-count">{editCount?.toLocaleString() || '0'}</td>
                  </tr>
                  <tr>
                    <td>Comments</td>
                    <td className="td-count">{commentCount?.toLocaleString() || '0'}</td>
                  </tr>
                  <tr>
                    <td>Articles This Month</td>
                    <td className="td-count">{articlesThisMonth?.toLocaleString() || '0'}</td>
                  </tr>
                  <tr>
                    <td>Edits This Week</td>
                    <td className="td-count">{editsThisWeek?.toLocaleString() || '0'}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* TOP ARTICLES */}
          <div className="wiki-box">
            <div className="wiki-box-hd">Top 10 Most Viewed Articles</div>
            <div className="wiki-box-body">
              {topArticles && topArticles.length > 0 ? (
                <table className="article-table">
                  <thead>
                    <tr>
                      <th>Article</th>
                      <th>Category</th>
                      <th>Views</th>
                      <th>Last Updated</th>
                    </tr>
                  </thead>
                  <tbody>
                    {topArticles.map((article) => {
                      const cat = article.category as { name: string; slug: string } | null;
                      return (
                        <tr key={article.slug}>
                          <td className="td-title">
                            <Link href={`/wiki/${article.slug}`}>{article.title}</Link>
                          </td>
                          <td>
                            {cat?.name && (
                              <span className={`tag tag-${cat.slug}`}>{cat.name}</span>
                            )}
                          </td>
                          <td className="td-count">{(article.view_count || 0).toLocaleString()}</td>
                          <td className="td-meta">{formatDate(article.updated_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-2)' }}>
                  No articles found.
                </div>
              )}
            </div>
          </div>

          {/* ACTIVITY BREAKDOWN */}
          <div className="wiki-box">
            <div className="wiki-box-hd">Activity Breakdown</div>
            <div className="wiki-box-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--amber)', marginBottom: '8px' }}>
                    {articleCount?.toLocaleString() || '0'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-1)' }}>Total Articles</div>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--amber)', marginBottom: '8px' }}>
                    {userCount?.toLocaleString() || '0'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-1)' }}>Contributors</div>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--amber)', marginBottom: '8px' }}>
                    {editCount?.toLocaleString() || '0'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-1)' }}>Total Edits</div>
                </div>
                <div style={{ textAlign: 'center', padding: '20px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '32px', fontWeight: '700', color: 'var(--amber)', marginBottom: '8px' }}>
                    {articlesThisMonth?.toLocaleString() || '0'}
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-1)' }}>New This Month</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Recent Activity</div>
            <div className="wiki-box-body">
              <div className="contrib-row">
                <span>Articles This Month</span>
                <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--amber)' }}>
                  {articlesThisMonth?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="contrib-row">
                <span>Edits This Week</span>
                <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--amber)' }}>
                  {editsThisWeek?.toLocaleString() || '0'}
                </span>
              </div>
              <div className="contrib-row">
                <span>Active Users</span>
                <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--amber)' }}>
                  {userCount?.toLocaleString() || '0'}
                </span>
              </div>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Quick Links</div>
            <div className="wiki-box-body">
              <Link href="/special/recentchanges" className="sidebar-link">Recent Changes</Link>
              <Link href="/special/newpages" className="sidebar-link">New Pages</Link>
              <Link href="/special/allpages" className="sidebar-link">All Pages</Link>
              <Link href="/special/random" className="sidebar-link">Random Page</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Contribute</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                Help grow these statistics by contributing to the wiki!
              </p>
              <p style={{ marginBottom: '8px' }}>
                Every article created and edit made improves the resource for everyone.
              </p>
              <Link href="/contribute" className="sidebar-link">Start Contributing</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
