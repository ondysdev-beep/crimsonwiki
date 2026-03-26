import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Combat System',
  description: `Combat system guide for ${SITE_NAME} -- battle mechanics, skills, and strategies.`,
};

export default function CombatSystemPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Combat System</div>
          <div className="page-hd-sub">Battle mechanics, skills, and strategies</div>
        </div>
      </div>

      {/* COMBAT SYSTEM CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">Combat System Guide</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚔️</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '16px' }}>
                No Articles Yet
              </h3>
              <p style={{ marginBottom: '24px' }}>
                This section has no articles yet. Be the first to contribute comprehensive combat system guides!
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
                When creating content for the combat system, consider including:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>Core combat mechanics and controls</li>
                <li style={{ marginBottom: '8px' }}>Weapon types and fighting styles</li>
                <li style={{ marginBottom: '8px' }}>Skill systems and ability trees</li>
                <li style={{ marginBottom: '8px' }}>Combat stats and attributes</li>
                <li style={{ marginBottom: '8px' }}>Enemy types and battle strategies</li>
                <li>Advanced techniques and combos</li>
              </ul>
              <p>
                Help other players master Crimson Desert's combat system!
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
              <Link href="/category/bosses" className="sidebar-link">Boss Strategies</Link>
              <Link href="/category/tips" className="sidebar-link">Combat Tips</Link>
              <Link href="/category/items" className="sidebar-link">Equipment</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Contribute</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                Share your combat expertise!
              </p>
              <Link href="/wiki/new" className="sidebar-link">Create Combat Guide</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
