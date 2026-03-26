import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatDateRelative } from '@/lib/utils';
import type { ArticleWithCategory, Category } from '@/lib/types/database';

export const dynamic = 'force-dynamic';
export const revalidate = 60;

const CATEGORY_COLORS: Record<string, { color: string; glow: string }> = {
  quests: { color: '#c9a227', glow: 'rgba(201,162,39,0.12)' },
  bosses: { color: '#cc3333', glow: 'rgba(204,51,51,0.12)' },
  items: { color: '#4a9eff', glow: 'rgba(74,158,255,0.12)' },
  locations: { color: '#33cc77', glow: 'rgba(51,204,119,0.12)' },
  classes: { color: '#9b59b6', glow: 'rgba(155,89,182,0.12)' },
  crafting: { color: '#e67e22', glow: 'rgba(230,126,34,0.12)' },
  tips: { color: '#1abc9c', glow: 'rgba(26,188,156,0.12)' },
  lore: { color: '#95a5a6', glow: 'rgba(149,165,166,0.12)' },
};

function getBadgeClass(slug: string): string {
  const map: Record<string, string> = {
    quests: 'badge-quest', bosses: 'badge-boss', items: 'badge-item',
    locations: 'badge-location', classes: 'badge-class', crafting: 'badge-crafting',
    tips: 'badge-tip', lore: 'badge-lore',
  };
  return map[slug] || 'badge-quest';
}

export default async function HomePage() {
  const supabase = await createClient();

  const { data: recentData } = await supabase
    .from('articles')
    .select('*, categories(*), profiles!articles_created_by_fkey(*)')
    .eq('is_published', true)
    .order('updated_at', { ascending: false })
    .limit(10);
  const recentArticles = (recentData ?? []) as unknown as ArticleWithCategory[];

  const { data: catData } = await supabase
    .from('categories')
    .select('*')
    .order('name');
  const categories = (catData ?? []) as Category[];

  const { count: articleCount } = await supabase
    .from('articles')
    .select('*', { count: 'exact', head: true })
    .eq('is_published', true);

  const { count: profileCount } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true });

  const { count: editCount } = await supabase
    .from('article_revisions')
    .select('*', { count: 'exact', head: true });

  // Get total monthly readers (sum of all article views in last 30 days)
  const { data: viewData } = await supabase
    .from('articles')
    .select('view_count')
    .eq('is_published', true);

  const totalViews = viewData?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0;

  // Get article counts per category
  const { data: categoryCounts } = await supabase
    .from('categories')
    .select('*, articles(count)')
    .eq('articles.is_published', true);

  const categoriesWithCounts = categories.map(cat => {
    const countData = categoryCounts?.find(c => c.id === cat.id);
    return {
      ...cat,
      article_count: countData?.articles?.[0]?.count || 0
    };
  });

  // Get top contributors
  const { data: topContributors } = await supabase
    .from('profiles')
    .select('*, article_revisions(count)')
    .eq('is_founder', true)
    .order('article_revisions(count)', { ascending: false })
    .limit(5);

  // Get random tips for "Did You Know" section
  const { data: tipsData } = await supabase
    .from('articles')
    .select('title, content')
    .eq('is_published', true)
    .ilike('content', '%tip%')
    .order('random()')
    .limit(3);

  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Crimson Desert Wiki</div>
          <div className="page-hd-sub">
            The community-driven reference for Crimson Desert — {articleCount?.toLocaleString() || '0'}+ articles, {profileCount?.toLocaleString() || '0'}+ contributors
          </div>
        </div>
        <Link href="/wiki/new" className="page-hd-edit">[ edit page ]</Link>
      </div>

      {/* WELCOME NOTICE */}
      <div className="notice">
        <strong>Welcome to CrimsonWiki.</strong> This wiki is a community project. Anyone can contribute — <Link href="/auth/login">create an account</Link> to start editing. The game launched March 19, 2026. Many articles are stubs — help us expand them.
      </div>

      {/* STATS STRIP */}
      <div className="stats-strip">
        <div className="stat-cell">
          <span className="stat-num">{articleCount?.toLocaleString() || '0'}</span>
          <div className="stat-label">Articles</div>
        </div>
        <div className="stat-cell">
          <span className="stat-num">{profileCount?.toLocaleString() || '0'}</span>
          <div className="stat-label">Contributors</div>
        </div>
        <div className="stat-cell">
          <span className="stat-num">{editCount?.toLocaleString() || '0'}</span>
          <div className="stat-label">Edits</div>
        </div>
        <div className="stat-cell">
          <span className="stat-num">{totalViews > 1000 ? `${Math.round(totalViews / 1000)}K` : totalViews}</span>
          <div className="stat-label">Total Views</div>
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="content-grid">
        {/* MAIN COLUMN */}
        <div>
          {/* CATEGORIES TABLE */}
          <div className="wiki-box">
            <div className="wiki-box-hd">
              Browse by Category
              <Link href="/search" className="wiki-box-hd-link">[all categories]</Link>
            </div>
            <table className="wiki-table">
              <thead>
                <tr>
                  <th className="td-icon"></th>
                  <th>Category</th>
                  <th>Description</th>
                  <th className="td-count">Articles</th>
                </tr>
              </thead>
              <tbody>
                {categoriesWithCounts.map((cat) => (
                  <tr key={cat.id}>
                    <td className="td-icon">{cat.icon}</td>
                    <td>
                      <Link href={`/category/${cat.slug}`}>{cat.name}</Link>
                    </td>
                    <td style={{ color: 'var(--text-2)', fontSize: '11px' }}>
                      {cat.description || 'No description available'}
                    </td>
                    <td className="td-count">{cat.article_count.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* RECENT ARTICLES TABLE */}
          <div className="wiki-box">
            <div className="wiki-box-hd">
              Recently Edited Articles
              <Link href="/search" className="wiki-box-hd-link">[full list]</Link>
            </div>
            <table className="article-table">
              <thead>
                <tr>
                  <th>Article</th>
                  <th>Type</th>
                  <th>Editor</th>
                  <th>Edited</th>
                  <th>Views</th>
                </tr>
              </thead>
              <tbody>
                {recentArticles.map((article) => {
                  const catSlug = (article.categories as unknown as Category)?.slug || '';
                  const catName = (article.categories as unknown as Category)?.name || '';
                  const authorName = (article.profiles as { username: string } | null)?.username || 'Unknown';
                  return (
                    <tr key={article.id}>
                      <td className="td-title">
                        <Link href={`/wiki/${article.slug}`}>{article.title}</Link>
                      </td>
                      <td>
                        <span className={`tag tag-${catSlug}`}>{catName}</span>
                      </td>
                      <td className="td-meta">
                        <Link href={`/profile/${authorName}`}>{authorName}</Link>
                      </td>
                      <td className="td-meta">{formatDateRelative(article.updated_at)}</td>
                      <td className="td-views">{(article.view_count || 0).toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          {/* TOP CONTRIBUTORS */}
          <div className="wiki-box">
            <div className="wiki-box-hd">Top Contributors</div>
            <div>
              {topContributors?.map((contrib, i) => (
                <div key={contrib.id} className="contrib-row">
                  <span className="contrib-rank">#{i + 1}</span>
                  <Link href={`/profile/${contrib.username}`} className="contrib-name">
                    {contrib.username}
                  </Link>
                  {contrib.is_founder && <span className="founder-tag">founder</span>}
                  <span className="contrib-edits">{(contrib as any).article_revisions?.[0]?.count || 0} edits</span>
                </div>
              ))}
            </div>
          </div>

          {/* DID YOU KNOW */}
          <div className="wiki-box">
            <div className="wiki-box-hd">Did You Know</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6', color: 'var(--text-1)' }}>
              {tipsData?.map((tip, i) => (
                <p key={i} style={{ marginBottom: '6px' }}>
                  {typeof tip.content === 'string'
                    ? (tip.content.length > 100 ? tip.content.slice(0, 100) + '...' : tip.content)
                    : String(tip.content)
                  }
                </p>
              ))}
            </div>
          </div>

          {/* CONTRIBUTE BOX */}
          <div className="wiki-box">
            <div className="wiki-box-hd">Contribute</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', color: 'var(--text-1)', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>This wiki is written by the community. Create an account to add and edit articles.</p>
              <Link href="/auth/login" className="btn-login" style={{ width: '100%', height: '26px' }}>
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
