import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Skills System',
  description: `Skills system guide for ${SITE_NAME} -- abilities, progression, and skill trees.`,
};

export default function SkillsSystemPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Skills System</div>
          <div className="page-hd-sub">Abilities, progression, and skill trees</div>
        </div>
      </div>

      {/* SKILLS SYSTEM CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">Skills System Guide</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>✨</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '16px' }}>
                No Articles Yet
              </h3>
              <p style={{ marginBottom: '24px' }}>
                This section has no articles yet. Be the first to contribute comprehensive skills system guides!
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
                When creating content for the skills system, consider including:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>Skill categories and types</li>
                <li style={{ marginBottom: '8px' }}>Skill point allocation and progression</li>
                <li style={{ marginBottom: '8px' }}>Active vs passive abilities</li>
                <li style={{ marginBottom: '8px' }}>Skill combinations and synergies</li>
                <li style={{ marginBottom: '8px' }}>Class-specific skill trees</li>
                <li>Master skills and ultimate abilities</li>
              </ul>
              <p>
                Help other players optimize their character development!
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
              <Link href="/systems/builds" className="sidebar-link">Build Guides</Link>
              <Link href="/category/tips" className="sidebar-link">Skill Tips</Link>
              <Link href="/systems/leveling" className="sidebar-link">Progression</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Contribute</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                Share your skill build expertise!
              </p>
              <Link href="/wiki/new" className="sidebar-link">Create Skill Guide</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
