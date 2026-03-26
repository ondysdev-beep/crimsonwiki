import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Characters',
  description: `Characters guide for ${SITE_NAME} -- all characters, NPCs, and story figures.`,
};

export default function CharactersPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Characters</div>
          <div className="page-hd-sub">All characters, NPCs, and story figures</div>
        </div>
      </div>

      {/* CHARACTERS CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">Characters Guide</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '16px' }}>
                No Articles Yet
              </h3>
              <p style={{ marginBottom: '24px' }}>
                This section has no articles yet. Be the first to contribute comprehensive character guides!
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
            <div className="wiki-box-hd">Character Categories</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                When creating character content, consider organizing by:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>Main Characters - Protagonists and key story figures</li>
                <li style={{ marginBottom: '8px' }}>Supporting Characters - Important allies and companions</li>
                <li style={{ marginBottom: '8px' }}>Antagonists - Villains and opposing forces</li>
                <li style={{ marginBottom: '8px' }}>NPCs - Quest givers, merchants, and service providers</li>
                <li style={{ marginBottom: '8px' }}>Faction Leaders - Heads of major organizations</li>
                <li>Minor Characters - Background figures and incidental NPCs</li>
              </ul>
              <p>
                Help other players understand Crimson Desert's rich cast of characters!
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
              <Link href="/category/lore" className="sidebar-link">All Characters</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Related Content</div>
            <div className="wiki-box-body">
              <Link href="/category/lore" className="sidebar-link">Story Lore</Link>
              <Link href="/category/quests" className="sidebar-link">Character Quests</Link>
              <Link href="/category/factions" className="sidebar-link">Factions</Link>
              <Link href="/walkthrough" className="sidebar-link">Story Progression</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Contribute</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                Document character backgrounds and stories!
              </p>
              <Link href="/wiki/new" className="sidebar-link">Create Character Guide</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
