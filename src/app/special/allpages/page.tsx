import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { formatDate, SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'All Pages',
  description: `Browse all articles on ${SITE_NAME} -- complete article index.`,
};

export default async function AllPagesPage() {
  const supabase = await createClient();

  // Fetch all published articles sorted alphabetically
  const { data: articles } = await supabase
    .from('articles')
    .select('title, slug, updated_at, category:categories(name, slug)')
    .eq('is_published', true)
    .order('title', { ascending: true });

  // Group articles by first letter
  const groupedArticles = articles?.reduce((acc, article) => {
    const firstLetter = article.title.charAt(0).toUpperCase();
    if (!acc[firstLetter]) {
      acc[firstLetter] = [];
    }
    acc[firstLetter].push(article);
    return acc;
  }, {} as Record<string, typeof articles>) || {};

  // Sort the letters alphabetically
  const sortedLetters = Object.keys(groupedArticles).sort();

  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">All Pages</div>
          <div className="page-hd-sub">Complete index of all wiki articles</div>
        </div>
      </div>

      {/* ALL PAGES CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">
              Article Index ({articles?.length || 0} articles)
            </div>
            <div className="wiki-box-body">
              {articles && articles.length > 0 ? (
                <div>
                  {/* Quick navigation */}
                  <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-1)', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '14px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '12px' }}>
                      Quick Navigation:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                      {sortedLetters.map(letter => (
                        <Link
                          key={letter}
                          href={`#${letter}`}
                          style={{
                            display: 'inline-block',
                            padding: '4px 8px',
                            background: 'var(--bg-2)',
                            border: '1px solid var(--border)',
                            borderRadius: '2px',
                            fontSize: '12px',
                            fontWeight: '500',
                            color: 'var(--link)',
                            textDecoration: 'none'
                          }}
                        >
                          {letter}
                        </Link>
                      ))}
                    </div>
                  </div>

                  {/* Articles grouped by letter */}
                  {sortedLetters.map(letter => (
                    <div key={letter} style={{ marginBottom: '32px' }}>
                      <h2 
                        id={letter}
                        style={{ 
                          fontSize: '24px', 
                          fontWeight: '600', 
                          color: 'var(--text-0)', 
                          marginBottom: '16px',
                          scrollMarginTop: '100px'
                        }}
                      >
                        {letter}
                      </h2>
                      <table className="article-table">
                        <thead>
                          <tr>
                            <th>Article</th>
                            <th>Category</th>
                            <th>Last Updated</th>
                          </tr>
                        </thead>
                        <tbody>
                          {groupedArticles[letter].map((article) => {
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
                                <td className="td-meta">{formatDate(article.updated_at)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-2)' }}>
                  <div style={{ fontSize: '48px', marginBottom: '16px' }}>📚</div>
                  <h3 style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '8px' }}>
                    No Articles Found
                  </h3>
                  <p style={{ marginBottom: '16px' }}>
                    There are no published articles yet. Be the first to contribute!
                  </p>
                  <Link href="/wiki/new" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                    Create First Article
                  </Link>
                </div>
              )}
            </div>
          </div>

          {/* Statistics */}
          {articles && articles.length > 0 && (
            <div className="wiki-box">
              <div className="wiki-box-hd">Index Statistics</div>
              <div className="wiki-box-body">
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '16px' }}>
                  <div style={{ textAlign: 'center', padding: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--amber)', marginBottom: '4px' }}>
                      {articles.length}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-1)' }}>Total Articles</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--amber)', marginBottom: '4px' }}>
                      {sortedLetters.length}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-1)' }}>Letter Sections</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--amber)', marginBottom: '4px' }}>
                      {Math.max(...sortedLetters.map(letter => groupedArticles[letter].length))}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-1)' }}>Largest Section</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '16px', border: '1px solid var(--border)' }}>
                    <div style={{ fontSize: '24px', fontWeight: '700', color: 'var(--amber)', marginBottom: '4px' }}>
                      {sortedLetters.find(letter => groupedArticles[letter].length === Math.min(...sortedLetters.map(letter => groupedArticles[letter].length)))}
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--text-1)' }}>Smallest Section</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Browse by Category</div>
            <div className="wiki-box-body">
              <Link href="/category/quests" className="sidebar-link">Quests</Link>
              <Link href="/category/bosses" className="sidebar-link">Bosses</Link>
              <Link href="/category/items" className="sidebar-link">Items</Link>
              <Link href="/category/locations" className="sidebar-link">Locations</Link>
              <Link href="/category/classes" className="sidebar-link">Classes</Link>
              <Link href="/category/crafting" className="sidebar-link">Crafting</Link>
              <Link href="/category/tips" className="sidebar-link">Tips</Link>
              <Link href="/category/lore" className="sidebar-link">Lore</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Special Pages</div>
            <div className="wiki-box-body">
              <Link href="/special/recentchanges" className="sidebar-link">Recent Changes</Link>
              <Link href="/special/newpages" className="sidebar-link">New Pages</Link>
              <Link href="/special/random" className="sidebar-link">Random Page</Link>
              <Link href="/statistics" className="sidebar-link">Statistics</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Contribute</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                Missing an article? Create it!
              </p>
              <p style={{ marginBottom: '8px' }}>
                Found an error? Fix it!
              </p>
              <Link href="/wiki/new" className="sidebar-link">Create Article</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
