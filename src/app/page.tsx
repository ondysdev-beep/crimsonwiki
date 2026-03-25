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
    .limit(8);
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

  return (
    <div className="page-enter">
      {/* HERO */}
      <div className="hero">
        <div className="hero-bg" />
        <div className="hero-ornament top" />
        <div className="hero-ornament bottom" />
        <div className="hero-content">
          <div className="hero-eyebrow">Community Knowledge Base</div>
          <h1 className="hero-title">CrimsonWiki</h1>
          <div className="hero-subtitle">The World of Crimson Desert</div>
          <div className="hero-desc">
            A community-driven archive of quests, items, secrets, and lore -- built by explorers, for explorers.
          </div>
          <form action="/search" method="GET" className="hero-search">
            <input name="q" placeholder="Search quests, bosses, items, locations..." />
            <button type="submit" className="hero-search-btn">Search</button>
          </form>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-num">{articleCount?.toLocaleString() || '0'}</span>
              <div className="hero-stat-label">Articles</div>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">{profileCount?.toLocaleString() || '0'}</span>
              <div className="hero-stat-label">Contributors</div>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">{categories.length}</span>
              <div className="hero-stat-label">Categories</div>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-num">{editCount?.toLocaleString() || '0'}</span>
              <div className="hero-stat-label">Edits</div>
            </div>
          </div>
        </div>
      </div>

      {/* CATEGORIES */}
      <div className="section">
        <div className="section-header">
          <div className="section-title">Browse by Category</div>
          <Link href="/search" className="section-link">View All</Link>
        </div>
        {categories.length > 0 ? (
          <div className="categories-grid">
            {categories.map((cat) => {
              const colors = CATEGORY_COLORS[cat.slug] || { color: '#9b2020', glow: 'rgba(155,32,32,0.12)' };
              return (
                <Link
                  key={cat.id}
                  href={`/category/${cat.slug}`}
                  className="cat-card"
                  style={{ '--cat-color': colors.color, '--cat-glow': colors.glow } as React.CSSProperties}
                >
                  <span className="cat-icon">{cat.icon || ''}</span>
                  <div className="cat-name">{cat.name}</div>
                  <div className="cat-desc">{cat.description || ''}</div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-dim)' }}>
            No categories yet. Be the first to{' '}
            <Link href="/contribute" style={{ color: 'var(--crimson-bright)' }}>contribute</Link>!
          </div>
        )}
      </div>

      {/* ORNAMENT */}
      <div className="ornament-divider" style={{ maxWidth: 1400, margin: '0 auto 0', padding: '0 32px' }}>
        <span></span>
      </div>

      {/* RECENT ARTICLES */}
      <div className="section" style={{ paddingTop: 40 }}>
        <div className="section-header">
          <div className="section-title">Recently Edited</div>
          <Link href="/search" className="section-link">All Changes</Link>
        </div>
        <div className="article-list">
          {recentArticles.map((article) => {
            const catSlug = (article.categories as unknown as Category)?.slug || '';
            const catName = (article.categories as unknown as Category)?.name || '';
            const catColor = CATEGORY_COLORS[catSlug]?.color || '#9b2020';
            const authorName = (article.profiles as { username: string } | null)?.username || 'Unknown';
            return (
              <Link
                key={article.id}
                href={`/wiki/${article.slug}`}
                className="article-item"
                style={{ '--cat-color': catColor } as React.CSSProperties}
              >
                <div className="article-item-cat" />
                <div className="article-item-body">
                  <div className="article-item-title">{article.title}</div>
                  <div className="article-item-meta">
                    by <span>{authorName}</span> · {formatDateRelative(article.updated_at)} · <span>{(article.view_count || 0).toLocaleString()} views</span>
                  </div>
                </div>
                <span className={`badge ${getBadgeClass(catSlug)}`}>{catName}</span>
              </Link>
            );
          })}
          {recentArticles.length === 0 && (
            <div style={{ padding: '40px 16px', textAlign: 'center', color: 'var(--text-dim)' }}>
              No articles yet. Be the first to{' '}
              <Link href="/wiki/new" style={{ color: 'var(--crimson-bright)' }}>create one</Link>!
            </div>
          )}
        </div>
      </div>

      {/* BOTTOM CARDS: Quick Links + Did You Know + Contribute */}
      <div className="section" style={{ paddingTop: 0 }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 16 }}>
          <div className="sidebar-card" style={{ margin: 0 }}>
            <div className="sidebar-title">Quick Links</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <Link href="/wiki/new" className="footer-link" style={{ fontSize: 13 }}>Create New Article</Link>
              <Link href="/search" className="footer-link" style={{ fontSize: 13 }}>Search the Wiki</Link>
              <Link href="/category/quests" className="footer-link" style={{ fontSize: 13 }}>Browse Quests</Link>
              <Link href="/category/bosses" className="footer-link" style={{ fontSize: 13 }}>Browse Bosses</Link>
            </div>
          </div>

          <div className="sidebar-card" style={{ margin: 0, fontFamily: "'Crimson Pro', serif", fontSize: 15, color: 'var(--text-muted)', fontStyle: 'italic', lineHeight: 1.7 }}>
            <div className="sidebar-title" style={{ fontStyle: 'normal' }}>Did You Know?</div>
            &ldquo;The secret vault beneath Thornwood Village contains a one-time loot chest that respawns only on new moon cycles.&rdquo;
          </div>

          <div className="sidebar-card" style={{ margin: 0, border: '1px solid rgba(155,32,32,0.3)', background: 'rgba(155,32,32,0.05)' }}>
            <div className="sidebar-title" style={{ color: 'var(--crimson-bright)' }}>Contribute</div>
            <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
              Help build the most complete Crimson Desert resource. Every edit counts.
            </div>
            <Link href="/contribute" className="btn-login" style={{ width: '100%', textAlign: 'center' }}>
              Join and Start Editing
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
