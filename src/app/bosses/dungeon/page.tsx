import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Dungeon Bosses',
  description: `Dungeon bosses guide for ${SITE_NAME} -- instance boss encounters and strategies.`,
};

export default function DungeonBossesPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Dungeon Bosses</div>
          <div className="page-hd-sub">Instance boss encounters and strategies</div>
        </div>
      </div>

      {/* DUNGEON BOSSES CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">Dungeon Bosses Guide</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚔️</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '16px' }}>
                No Articles Yet
              </h3>
              <p style={{ marginBottom: '24px' }}>
                This section has no articles yet. Be the first to contribute comprehensive dungeon boss guides!
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <Link href="/wiki/new" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                  Create Article
                </Link>
                <Link href="/category/bosses" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                  Browse Bosses
                </Link>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-1)' }}>
                Browse all articles in <Link href="/category/bosses" style={{ color: 'var(--link)' }}>Bosses</Link>.
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
                <li style={{ marginBottom: '8px' }}>Individual dungeon boss strategies</li>
                <li style={{ marginBottom: '8px' }}>Attack patterns and weaknesses</li>
                <li style={{ marginBottom: '8px' }}>Recommended gear and level requirements</li>
                <li style={{ marginBottom: '8px' }}>Party composition and roles</li>
                <li style={{ marginBottom: '8px' }}>Loot tables and rewards</li>
                <li>Dungeon-specific mechanics and tips</li>
              </ul>
              <p>
                Help other players conquer challenging dungeon encounters!
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Boss Categories</div>
            <div className="wiki-box-body">
              <Link href="/bosses/world" className="sidebar-link">World Bosses</Link>
              <Link href="/bosses/dungeon" className="sidebar-link">Dungeon Bosses</Link>
              <Link href="/bosses/field" className="sidebar-link">Field Bosses</Link>
              <Link href="/category/bosses" className="sidebar-link">All Bosses</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Related Content</div>
            <div className="wiki-box-body">
              <Link href="/category/classes" className="sidebar-link">Class Builds</Link>
              <Link href="/category/items" className="sidebar-link">Equipment</Link>
              <Link href="/category/locations" className="sidebar-link">Dungeons</Link>
              <Link href="/category/quests" className="sidebar-link">Boss Quests</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Contribute</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                Share your dungeon boss strategies!
              </p>
              <Link href="/wiki/new" className="sidebar-link">Create Guide</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
