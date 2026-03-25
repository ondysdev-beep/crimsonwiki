import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Contribute',
  description: `Help build ${SITE_NAME} -- the community-driven wiki for Crimson Desert.`,
};

export default function ContributePage() {
  return (
    <div className="section page-enter" style={{ maxWidth: 860 }}>
      <div className="section-title" style={{ fontSize: 28, marginBottom: 8 }}>Contribute to CrimsonWiki</div>
      <div style={{ fontSize: 15, color: 'var(--text-muted)', lineHeight: 1.7, marginBottom: 32 }}>
        CrimsonWiki is built by the community for the community. Whether you are a seasoned adventurer
        or just starting your journey in Crimson Desert, your knowledge matters.
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 16, marginBottom: 40 }}>
        <div className="sidebar-card" style={{ margin: 0 }}>
          <div className="sidebar-title">Write Articles</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
            Share your knowledge about quests, bosses, items, locations, classes, crafting, and more.
          </div>
          <Link href="/wiki/new" className="btn-login" style={{ display: 'block', textAlign: 'center' }}>
            Create New Article
          </Link>
        </div>

        <div className="sidebar-card" style={{ margin: 0 }}>
          <div className="sidebar-title">Edit and Improve</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
            Found outdated info or a typo? Every edit counts. Help keep the wiki accurate and up-to-date.
          </div>
          <Link href="/search" className="btn-login" style={{ display: 'block', textAlign: 'center' }}>
            Browse Articles
          </Link>
        </div>

        <div className="sidebar-card" style={{ margin: 0 }}>
          <div className="sidebar-title">Join the Community</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: 12 }}>
            Create your account with Discord to start contributing. Track your edits and build your profile.
          </div>
          <Link href="/auth/login" className="btn-login" style={{ display: 'block', textAlign: 'center' }}>
            Sign In with Discord
          </Link>
        </div>
      </div>

      <div className="sidebar-card" style={{ margin: 0, marginBottom: 24 }}>
        <div className="sidebar-title">Contribution Guidelines</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', lineHeight: 1.8 }}>
          <p style={{ marginBottom: 8 }}>1. <strong style={{ color: 'var(--text-primary)' }}>Be accurate</strong> -- Verify information before publishing. Cite sources when possible.</p>
          <p style={{ marginBottom: 8 }}>2. <strong style={{ color: 'var(--text-primary)' }}>Be respectful</strong> -- Write in a neutral, encyclopedic tone. No personal opinions or speculation.</p>
          <p style={{ marginBottom: 8 }}>3. <strong style={{ color: 'var(--text-primary)' }}>No spoilers without warning</strong> -- Mark major story spoilers clearly.</p>
          <p style={{ marginBottom: 8 }}>4. <strong style={{ color: 'var(--text-primary)' }}>Use categories</strong> -- Place articles in the correct category for easy discovery.</p>
          <p style={{ marginBottom: 8 }}>5. <strong style={{ color: 'var(--text-primary)' }}>No copyrighted content</strong> -- Do not copy-paste from other wikis or official sources. Write original content.</p>
          <p>6. <strong style={{ color: 'var(--text-primary)' }}>Write edit summaries</strong> -- Briefly describe your changes so other editors understand what was modified.</p>
        </div>
      </div>

      <div style={{ fontSize: 13, color: 'var(--text-dim)', lineHeight: 1.6 }}>
        All community content on CrimsonWiki is licensed under{' '}
        <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--crimson-bright)' }}>
          CC BY-SA 4.0
        </a>. By contributing, you agree to license your edits under this license.
      </div>
    </div>
  );
}
