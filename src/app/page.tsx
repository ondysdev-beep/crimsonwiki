import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';
import { formatDateRelative } from '@/lib/utils';
import type { ArticleWithCategory, Category } from '@/lib/types/database';
import { HeroSearch } from '@/components/wiki/HeroSearch';
import { getSettings } from '@/lib/settings';

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
  characters: { color: '#e74c3c', glow: 'rgba(231,76,60,0.12)' },
  mounts: { color: '#8e44ad', glow: 'rgba(142,68,173,0.12)' },
  collectibles: { color: '#f39c12', glow: 'rgba(243,156,18,0.12)' },
  walkthrough: { color: '#27ae60', glow: 'rgba(39,174,96,0.12)' },
  factions: { color: '#2c3e50', glow: 'rgba(44,62,80,0.12)' },
  activities: { color: '#16a085', glow: 'rgba(22,160,133,0.12)' },
  camp: { color: '#d35400', glow: 'rgba(211,84,0,0.12)' },
};

function getBadgeClass(slug: string): string {
  const map: Record<string, string> = {
    quests: 'badge-quest', bosses: 'badge-boss', items: 'badge-item',
    locations: 'badge-location', classes: 'badge-class', crafting: 'badge-crafting',
    tips: 'badge-tip', lore: 'badge-lore',
    characters: 'badge-boss', mounts: 'badge-class', collectibles: 'badge-item',
    walkthrough: 'badge-quest', factions: 'badge-lore', activities: 'badge-tip', camp: 'badge-crafting',
  };
  return map[slug] || 'badge-lore';
}

export default async function HomePage() {
  const supabase = await createClient();

  // Run all independent queries in parallel
  const [
    settings,
    { data: recentData },
    { data: popularData },
    { data: catData },
    { count: articleCount },
    { count: profileCount },
    { count: editCount },
    { data: viewData },
    { data: revisionData },
  ] = await Promise.all([
    getSettings(),
    supabase
      .from('articles')
      .select('*, categories(*), profiles!articles_created_by_fkey(*)')
      .eq('is_published', true)
      .order('updated_at', { ascending: false })
      .limit(10),
    supabase
      .from('articles')
      .select('slug, title, view_count, categories(name, slug)')
      .eq('is_published', true)
      .order('view_count', { ascending: false })
      .limit(5),
    supabase.from('categories').select('*').order('name'),
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('is_published', true),
    supabase.from('profiles').select('*', { count: 'exact', head: true }),
    supabase.from('article_revisions').select('*', { count: 'exact', head: true }),
    supabase.from('articles').select('view_count').eq('is_published', true),
    supabase
      .from('article_revisions')
      .select('edited_by, profiles!article_revisions_edited_by_fkey(username, is_founder)')
      .not('edited_by', 'is', null)
      .limit(50),
  ]);

  const recentArticles = (recentData ?? []) as unknown as ArticleWithCategory[];
  const popularArticles = (popularData ?? []) as { slug: string; title: string; view_count: number; categories: { name: string; slug: string } | null }[];
  const categories = ((catData ?? []) as Category[]).filter(c => !c.parent_id);
  const totalViews = viewData?.reduce((sum, article) => sum + (article.view_count || 0), 0) || 0;

  // Count articles per category
  const { data: countData } = await supabase
    .from('articles')
    .select('category_id')
    .eq('is_published', true);
  const countMap: Record<number, number> = {};
  (countData ?? []).forEach(a => {
    if (a.category_id) countMap[a.category_id] = (countMap[a.category_id] || 0) + 1;
  });
  const categoriesWithCounts = categories.map(cat => ({
    ...cat,
    article_count: countMap[cat.id] || 0,
  }));

  // Count revisions per user and get top 5
  const contributorCounts = revisionData?.reduce((acc, rev) => {
    const userId = rev.edited_by;
    const username = rev.profiles?.username || 'Unknown';
    const isFounder = rev.profiles?.is_founder || false;

    if (!userId) return acc;

    if (!acc[userId]) {
      acc[userId] = { username, count: 0, isFounder };
    }
    acc[userId].count++;
    return acc;
  }, {} as Record<string, { username: string; count: number; isFounder: boolean }>) || {};

  const topContributors = Object.entries(contributorCounts)
    .sort(([, a], [, b]) => b.count - a.count)
    .slice(0, 5)
    .map(([userId, data], index) => ({
      id: userId,
      username: data.username,
      is_founder: data.isFounder,
      edit_count: data.count
    }));

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
      {settings.site_notice_enabled && (
        <div className="notice">
          {settings.site_notice_text}
        </div>
      )}

      {/* HERO SEARCH */}
      <HeroSearch />

      {/* STATS STRIP — only shown once we have meaningful data */}
      {(articleCount ?? 0) >= settings.stats_min_articles && <div className="stats-strip">
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
      </div>}

      {/* CATEGORY CARDS */}
      <div className="wiki-box">
        <div className="wiki-box-hd">
          Browse by Category
          <Link href="/categories" className="wiki-box-hd-link">[all categories]</Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1px', background: 'var(--border)' }}>
          {categoriesWithCounts.map((cat) => {
            const colors = CATEGORY_COLORS[cat.slug] || { color: '#95a5a6', glow: 'rgba(149,165,166,0.12)' };
            return (
              <Link
                key={cat.id}
                href={`/category/${cat.slug}`}
                className="cat-card"
                style={{ borderLeft: `3px solid ${colors.color}` }}
              >
                <div className="cat-card-name" style={{ color: colors.color }}>{cat.name}</div>
                <div className="cat-card-count">{cat.article_count} articles</div>
                {cat.description && (
                  <div className="cat-card-desc">{cat.description}</div>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* TWO-COLUMN: RECENT ARTICLES + SIDEBAR */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: '10px' }}>
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

        {/* SIDEBAR */}
        <div>
          {/* TOP CONTRIBUTORS */}
          <div className="wiki-box">
            <div className="wiki-box-hd">Top Contributors</div>
            <div>
              {topContributors?.length > 0 ? (
                topContributors.map((contrib, i) => (
                  <div key={contrib.id} className="contrib-row">
                    <span className="contrib-rank">#{i + 1}</span>
                    <Link href={`/profile/${contrib.username}`} className="contrib-name">
                      {contrib.username}
                    </Link>
                    {contrib.is_founder && <span className="founder-tag">founder</span>}
                    <span className="contrib-edits">{contrib.edit_count} edits</span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '16px', color: 'var(--text-2)', fontSize: '12px' }}>
                  No contributors yet — be the first!
                </div>
              )}
            </div>
          </div>

          {/* POPULAR ARTICLES */}
          {popularArticles.length > 0 && (
            <div className="wiki-box">
              <div className="wiki-box-hd">Popular Articles</div>
              <div>
                {popularArticles.map((art, i) => (
                  <div key={art.slug} className="contrib-row">
                    <span className="contrib-rank">#{i + 1}</span>
                    <Link href={`/wiki/${art.slug}`} className="contrib-name">
                      {art.title}
                    </Link>
                    <span className="contrib-edits">{(art.view_count || 0).toLocaleString()} views</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* CONTRIBUTE BOX */}
          <div className="wiki-box">
            <div className="wiki-box-hd">Contribute</div>
            <div className="wiki-box-body" style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>Help build the wiki. Create an account to add and edit articles.</p>
              <Link href="/auth/login" className="btn-login" style={{ width: '100%', height: '28px', justifyContent: 'center' }}>
                Create Account
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
