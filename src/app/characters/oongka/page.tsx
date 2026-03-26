import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Oongka',
  description: `Oongka character guide for ${SITE_NAME} -- character information and role in story.`,
};

export default function OongkaPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Oongka</div>
          <div className="page-hd-sub">Character guide and story information</div>
        </div>
      </div>

      {/* OONGKA CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">Oongka Character Guide</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏹</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '16px' }}>
                No Articles Yet
              </h3>
              <p style={{ marginBottom: '24px' }}>
                This section has no articles yet. Be the first to contribute comprehensive Oongka character information!
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <Link href="/wiki/new" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                  Create Article
                </Link>
                <Link href="/category/lore" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                  Browse Lore
                </Link>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-1)' }}>
                Browse all articles in <Link href="/category/lore" style={{ color: 'var(--link)' }}>Lore</Link>.
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Suggested Content</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                When creating content for Oongka, consider including:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>Character background and origins</li>
                <li style={{ marginBottom: '8px' }}>Role in the story and relationship to main characters</li>
                <li style={{ marginBottom: '8px' }}>Abilities, skills, and special abilities</li>
                <li style={{ marginBottom: '8px' }}>Character development and story arc</li>
                <li style={{ marginBottom: '8px' }}>Key moments and dialogue</li>
                <li>Contribution to main plot and side quests</li>
              </ul>
              <p>
                Help other players understand this character in Crimson Desert!
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Character Links</div>
            <div className="wiki-box-body">
              <Link href="/characters/kliff" className="sidebar-link">Kliff</Link>
              <Link href="/characters/damiane" className="sidebar-link">Damiane</Link>
              <Link href="/characters/oongka" className="sidebar-link">Oongka</Link>
              <Link href="/characters" className="sidebar-link">All Characters</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Related Content</div>
            <div className="wiki-box-body">
              <Link href="/walkthrough" className="sidebar-link">Story Progression</Link>
              <Link href="/category/quests" className="sidebar-link">Character Quests</Link>
              <Link href="/category/lore" className="sidebar-link">Character Lore</Link>
              <Link href="/category/lore" className="sidebar-link">Factions</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Contribute</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                Share your knowledge about Oongka!
              </p>
              <Link href="/wiki/new" className="sidebar-link">Create Character Guide</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
