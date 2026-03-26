import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Character Builds',
  description: `Character builds guide for ${SITE_NAME} -- optimal builds, equipment, and strategies.`,
};

export default function BuildsSystemPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Character Builds</div>
          <div className="page-hd-sub">Optimal builds, equipment, and strategies</div>
        </div>
      </div>

      {/* BUILDS SYSTEM CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">Character Builds Guide</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚡</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '16px' }}>
                No Articles Yet
              </h3>
              <p style={{ marginBottom: '24px' }}>
                This section has no articles yet. Be the first to contribute comprehensive character build guides!
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <Link href="/wiki/new" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                  Create Article
                </Link>
                <Link href="/category/classes" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                  Browse Classes
                </Link>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-1)' }}>
                Browse all articles in <Link href="/category/classes" style={{ color: 'var(--link)' }}>Classes</Link>.
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Suggested Content</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                When creating content for character builds, consider including:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>Class-specific optimal builds</li>
                <li style={{ marginBottom: '8px' }}>Equipment combinations and synergies</li>
                <li style={{ marginBottom: '8px' }}>Stat allocation and attribute priorities</li>
                <li style={{ marginBottom: '8px' }}>Skill selections and rotations</li>
                <li style={{ marginBottom: '8px' }}>PvP vs PvE build variations</li>
                <li>Beginner-friendly and advanced builds</li>
              </ul>
              <p>
                Help other players optimize their character builds!
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">System Links</div>
            <div className="wiki-box-body">
              <Link href="/systems/combat" className="sidebar-link">Combat</Link>
              <Link href="/systems/crafting" className="sidebar-link">Crafting</Link>
              <Link href="/systems/skills" className="sidebar-link">Skills</Link>
              <Link href="/systems/builds" className="sidebar-link">Builds</Link>
              <Link href="/systems/leveling" className="sidebar-link">Leveling</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Related Content</div>
            <div className="wiki-box-body">
              <Link href="/category/classes" className="sidebar-link">Class Guides</Link>
              <Link href="/systems/skills" className="sidebar-link">Skill Systems</Link>
              <Link href="/category/items" className="sidebar-link">Equipment</Link>
              <Link href="/category/tips" className="sidebar-link">Build Tips</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Contribute</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                Share your optimal builds!
              </p>
              <Link href="/wiki/new" className="sidebar-link">Create Build Guide</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
