import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { formatDateRelative, SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'New Pages',
  description: `Newly created articles on ${SITE_NAME} -- latest additions to the wiki.`,
};

export default async function NewPagesPage() {
  const supabase = await createClient();

  // Fetch the 30 most recently created articles
  const { data: articles } = await supabase
    .from('articles')
    .select(`
      title,
      slug,
      created_at,
      author:profiles!articles_created_by_fkey(username),
      category:categories(name, slug)
    `)
    .eq('is_published', true)
    .order('created_at', { ascending: false })
    .limit(30);

  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">New Pages</div>
          <div className="page-hd-sub">Recently created articles</div>
        </div>
      </div>

      {/* NEW PAGES CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">
              Newest Articles {articles && `(${articles.length} articles)`}
            </div>
            <div className="wiki-box-body">
              {articles && articles.length > 0 ? (
                <table className="article-table">
                  <thead>
                    <tr>
                      <th>Article</th>
                      <th>Category</th>
                      <th>Author</th>
                      <th>Created</th>
                    </tr>
                  </thead>
                  <tbody>
                    {articles.map((article) => {
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
                          <td style={{ fontSize: '13px' }}>
                            {article.author ? (
                              <Link href={`/profile/${article.author.username}`} style={{ color: 'var(--link)' }}>
                                {article.author.username}
                              </Link>
                            ) : (
                              <span style={{ color: 'var(--text-2)' }}>Unknown</span>
                            )}
                          </td>
                          <td className="td-meta">{formatDateRelative(article.created_at)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-2)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>🆕</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '8px' }}>
                    No New Articles Yet
                  </h3>
                  <p style={{ marginBottom: '16px' }}>
                    Be the first to create a new article and help build the wiki!
                  </p>
                  <Link href="/wiki/new" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                    Create New Article
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Creation Statistics */}
          {articles && articles.length > 0 && (
            <div className="wiki-box">
              <div className="wiki-box-hd">Creation Statistics</div>
              <div className="wiki-box-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                  <div style={{ textAlign: 'center', padding: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--amber)', marginBottom: '4px' }}>
                      {articles.length}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-1)' }}>Recent Articles</div>
                  </div>

                  <div style={{ textAlign: 'center', padding: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--amber)', marginBottom: '4px' }}>
                      {new Set(articles.map(a => a.author?.username).filter(Boolean)).size}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-1)' }}>Creators</div>
                  </div>

                  <div style={{ textAlign: 'center', padding: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--amber)', marginBottom: '4px' }}>
                      {new Set(articles.map(a => a.category?.slug).filter(Boolean)).size}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-1)' }}>Categories</div>
                  </div>

                  <div style={{ textAlign: 'center', padding: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--amber)', marginBottom: '4px' }}>
                      {articles[0] ? formatDateRelative(articles[0].created_at) : 'N/A'}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-1)' }}>Latest Creation</div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top Creators */}
          {articles && articles.length > 0 && (
            <div className="wiki-box">
              <div className="wiki-box-hd">Top Creators (Recent)</div>
              <div className="wiki-box-body">
                {(() => {
                  const creatorCounts = articles.reduce((acc, article) => {
                    if (article.author?.username) {
                      acc[article.author.username] = (acc[article.author.username] || 0) + 1;
                    }
                    return acc;
                  }, {} as Record<string, number>);

                  const topCreators = Object.entries(creatorCounts)
                    .sort(([, a], [, b]) => b - a)
                    .slice(0, 10);

                  return (
                    <div>
                      {topCreators.map(([username, count], index) => (
                        <div key={username} className="contrib-row">
                          <span className="contrib-rank">#{index + 1}</span>
                          <Link href={`/profile/${username}`} className="contrib-name">
                            {username}
                          </Link>
                          <span className="contrib-edits">{count} articles</span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}

          {/* Category Breakdown */}
          {articles && articles.length > 0 && (
            <div className="wiki-box">
              <div className="wiki-box-hd">Category Breakdown</div>
              <div className="wiki-box-body">
                {(() => {
                  const categoryCounts = articles.reduce((acc, article) => {
                    const categoryName = article.category?.name || 'Uncategorized';
                    acc[categoryName] = (acc[categoryName] || 0) + 1;
                    return acc;
                  }, {} as Record<string, number>);

                  const sortedCategories = Object.entries(categoryCounts)
                    .sort(([, a], [, b]) => b - a);

                  return (
                    <div>
                      {sortedCategories.map(([category, count]) => (
                        <div key={category} className="contrib-row">
                          <span>{category}</span>
                          <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--amber)' }}>
                            {count}
                          </span>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Quick Links</div>
            <div className="wiki-box-body">
              <Link href="/special/recentchanges" className="sidebar-link">Recent Changes</Link>
              <Link href="/special/allpages" className="sidebar-link">All Pages</Link>
              <Link href="/special/random" className="sidebar-link">Random Page</Link>
              <Link href="/statistics" className="sidebar-link">Statistics</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Create Content</div>
            <div className="wiki-box-body">
              <Link href="/wiki/new" className="sidebar-link">Create Article</Link>
              <Link href="/help/editing" className="sidebar-link">Editing Guide</Link>
              <Link href="/help/style" className="sidebar-link">Style Guide</Link>
              <Link href="/contribute" className="sidebar-link">Contribute</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Community</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>Join us!</strong> Help expand the wiki with your knowledge.
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>Every article:</strong> Makes the wiki better for everyone.
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>New to editing?</strong> Check our guides first.
              </p>
              <Link href="/community" className="sidebar-link">Community Portal</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
