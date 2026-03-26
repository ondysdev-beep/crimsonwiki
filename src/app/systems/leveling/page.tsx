import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Leveling System',
  description: `Leveling system guide for ${SITE_NAME} -- progression, experience, and character development.`,
};

export default function LevelingSystemPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Leveling System</div>
          <div className="page-hd-sub">Progression, experience, and character development</div>
        </div>
      </div>

      {/* LEVELING SYSTEM CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">Leveling System Guide</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📈</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '16px' }}>
                No Articles Yet
              </h3>
              <p style={{ marginBottom: '24px' }}>
                This section has no articles yet. Be the first to contribute comprehensive leveling system guides!
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
                When creating content for the leveling system, consider including:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>Experience gain methods and optimization</li>
                <li style={{ marginBottom: '8px' }}>Level requirements and progression milestones</li>
                <li style={{ marginBottom: '8px' }}>Attribute points and stat allocation</li>
                <li style={{ marginBottom: '8px' }}>Power leveling strategies and routes</li>
                <li style={{ marginBottom: '8px' }}>Endgame progression systems</li>
                <li>Leveling rewards and unlockables</li>
              </ul>
              <p>
                Help other players optimize their character progression!
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
              <Link href="/category/quests" className="sidebar-link">Questing</Link>
              <Link href="/category/tips" className="sidebar-link">Leveling Tips</Link>
              <Link href="/category/bosses" className="sidebar-link">Boss Grinding</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Contribute</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                Share your leveling strategies!
              </p>
              <Link href="/wiki/new" className="sidebar-link">Create Leveling Guide</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
