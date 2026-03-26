import Link from 'next/link';
import type { Metadata } from 'next';
import { createClient } from '@/lib/supabase/server';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Contribute',
  description: `Help build ${SITE_NAME} -- the community-driven wiki for Crimson Desert.`,
};

export default async function ContributePage() {
  const supabase = await createClient();

  // Fetch real stats from Supabase
  const [
    { count: totalUsers },
    { count: totalArticles },
    { count: totalEdits },
    { count: articlesThisMonth },
    { count: editsThisWeek },
    topContributors
  ] = await Promise.all([
    // Total users
    supabase.from('profiles').select('*', { count: 'exact', head: true }),

    // Total articles
    supabase.from('articles').select('*', { count: 'exact', head: true }).eq('is_published', true),

    // Total edits (revisions)
    supabase.from('article_revisions').select('*', { count: 'exact', head: true }),

    // Articles this month
    supabase
      .from('articles')
      .select('*', { count: 'exact', head: true })
      .eq('is_published', true)
      .gte('created_at', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString()),

    // Edits this week
    supabase
      .from('article_revisions')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),

    // Top contributors (by revision count)
    supabase
      .from('article_revisions')
      .select('edited_by, profiles!article_revisions_edited_by_fkey(username)')
      .not('edited_by', 'is', null)
      .limit(10)
  ]);

  // Process top contributors data
  const contributorCounts = topContributors.data?.reduce((acc, rev) => {
    const username = rev.profiles?.username || 'Unknown';
    acc[username] = (acc[username] || 0) + 1;
    return acc;
  }, {} as Record<string, number>) || {};

  const topContributorsList = Object.entries(contributorCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 3)
    .map(([name, edits]) => ({ name, edits }));
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Contribute to CrimsonWiki</div>
          <div className="page-hd-sub">Help build the community-driven wiki for Crimson Desert</div>
        </div>
      </div>

      {/* CONTRIBUTION OPTIONS */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">How You Can Help</div>
            <div className="wiki-box-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px' }}>
                <div className="wiki-box" style={{ margin: 0 }}>
                  <div className="wiki-box-hd">Write Articles</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: '1.6', marginBottom: '12px' }}>
                    Share your knowledge about quests, bosses, items, locations, classes, crafting, and more.
                  </div>
                  <Link href="/wiki/new" className="btn-login" style={{ display: 'block', textAlign: 'center' }}>
                    Create New Article
                  </Link>
                </div>

                <div className="wiki-box" style={{ margin: 0 }}>
                  <div className="wiki-box-hd">Edit and Improve</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: '1.6', marginBottom: '12px' }}>
                    Found outdated info or a typo? Every edit counts. Help keep the wiki accurate and up-to-date.
                  </div>
                  <Link href="/search" className="btn-login" style={{ display: 'block', textAlign: 'center' }}>
                    Browse Articles
                  </Link>
                </div>

                <div className="wiki-box" style={{ margin: 0 }}>
                  <div className="wiki-box-hd">Join the Community</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: '1.6', marginBottom: '12px' }}>
                    Create your account with Discord to start contributing. Track your edits and build your profile.
                  </div>
                  <Link href="/auth/login" className="btn-login" style={{ display: 'block', textAlign: 'center' }}>
                    Sign In with Discord
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* GUIDELINES */}
          <div className="wiki-box">
            <div className="wiki-box-hd">Contribution Guidelines</div>
            <div className="wiki-box-body" style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '8px' }}>1. <strong style={{ color: 'var(--text-0)' }}>Be accurate</strong> -- Verify information before publishing. Cite sources when possible.</p>
              <p style={{ marginBottom: '8px' }}>2. <strong style={{ color: 'var(--text-0)' }}>Be respectful</strong> -- Write in a neutral, encyclopedic tone. No personal opinions or speculation.</p>
              <p style={{ marginBottom: '8px' }}>3. <strong style={{ color: 'var(--text-0)' }}>No spoilers without warning</strong> -- Mark major story spoilers clearly.</p>
              <p style={{ marginBottom: '8px' }}>4. <strong style={{ color: 'var(--text-0)' }}>Use categories</strong> -- Place articles in the correct category for easy discovery.</p>
              <p style={{ marginBottom: '8px' }}>5. <strong style={{ color: 'var(--text-0)' }}>No copyrighted content</strong> -- Do not copy-paste from other wikis or official sources. Write original content.</p>
              <p>6. <strong style={{ color: 'var(--text-0)' }}>Write edit summaries</strong> -- Briefly describe your changes so other editors understand what was modified.</p>
            </div>
          </div>

          {/* LICENSE */}
          <div className="wiki-box">
            <div className="wiki-box-hd">License</div>
            <div className="wiki-box-body" style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: '1.6' }}>
              All community content on CrimsonWiki is licensed under{' '}
              <a
                href="https://creativecommons.org/licenses/by-sa/4.0/"
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: 'var(--link)' }}
              >
                CC BY-SA 4.0
              </a>. By contributing, you agree to license your edits under this license.
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Quick Stats</div>
            <div className="wiki-box-body">
              <div className="contrib-row">
                <span>Total Contributors</span>
                <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--amber)' }}>{totalUsers || 0}</span>
              </div>
              <div className="contrib-row">
                <span>Articles This Month</span>
                <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--amber)' }}>{articlesThisMonth || 0}</span>
              </div>
              <div className="contrib-row">
                <span>Edits This Week</span>
                <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--amber)' }}>{editsThisWeek || 0}</span>
              </div>
              <div className="contrib-row">
                <span>Total Articles</span>
                <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--amber)' }}>{totalArticles || 0}</span>
              </div>
              <div className="contrib-row">
                <span>Total Edits</span>
                <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--amber)' }}>{totalEdits || 0}</span>
              </div>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Top Contributors</div>
            <div className="wiki-box-body">
              {topContributorsList.length > 0 ? (
                topContributorsList.map((contributor, index) => (
                  <div key={index} className="contrib-row">
                    <span className="contrib-name">{contributor.name}</span>
                    <span className="contrib-edits">{contributor.edits} edits</span>
                  </div>
                ))
              ) : (
                <div style={{ textAlign: 'center', padding: '20px', color: 'var(--text-2)' }}>
                  <div style={{ fontSize: '24px', marginBottom: '8px' }}>📝</div>
                  <p style={{ fontSize: '12px' }}>No contributors yet</p>
                  <p style={{ fontSize: '11px', marginTop: '8px' }}>Be the first to contribute!</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
