import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Faction Quests',
  description: `Faction quests guide for ${SITE_NAME} -- faction storylines and reputation quests.`,
};

export default function FactionQuestsPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Faction Quests</div>
          <div className="page-hd-sub">Faction storylines and reputation quests</div>
        </div>
      </div>

      {/* FACTION QUESTS CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">Faction Quests Guide</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🏛️</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '16px' }}>
                No Articles Yet
              </h3>
              <p style={{ marginBottom: '24px' }}>
                This section has no articles yet. Be the first to contribute comprehensive faction quest guides!
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <Link href="/wiki/new" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                  Create Article
                </Link>
                <Link href="/category/quests" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                  Browse Quests
                </Link>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-1)' }}>
                Browse all articles in <Link href="/category/quests" style={{ color: 'var(--link)' }}>Quests</Link>.
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Suggested Content</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                When creating content for this section, consider including:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>Individual faction questlines</li>
                <li style={{ marginBottom: '8px' }}>Reputation systems and rewards</li>
                <li style={{ marginBottom: '8px' }}>Faction alliances and conflicts</li>
                <li style={{ marginBottom: '8px' }}>Faction-specific equipment and benefits</li>
                <li style={{ marginBottom: '8px' }}>Faction quest requirements and prerequisites</li>
                <li>Political storylines and consequences</li>
              </ul>
              <p>
                Help other players navigate Crimson Desert's faction systems!
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Quest Categories</div>
            <div className="wiki-box-body">
              <Link href="/quests/main" className="sidebar-link">Main Quests</Link>
              <Link href="/quests/side" className="sidebar-link">Side Quests</Link>
              <Link href="/quests/faction" className="sidebar-link">Faction Quests</Link>
              <Link href="/quests/hidden" className="sidebar-link">Hidden Quests</Link>
              <Link href="/category/quests" className="sidebar-link">All Quests</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Related Content</div>
            <div className="wiki-box-body">
              <Link href="/characters" className="sidebar-link">Characters</Link>
              <Link href="/category/locations" className="sidebar-link">Faction Bases</Link>
              <Link href="/category/lore" className="sidebar-link">Faction Lore</Link>
              <Link href="/category/items" className="sidebar-link">Faction Gear</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Contribute</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                Document your faction experiences!
              </p>
              <Link href="/wiki/new" className="sidebar-link">Create Guide</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
