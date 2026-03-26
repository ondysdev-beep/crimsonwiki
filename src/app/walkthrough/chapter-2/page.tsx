import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Chapter 2',
  description: `Chapter 2 walkthrough for ${SITE_NAME} -- story guide and quest help.`,
};

export default function Chapter2Page() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Chapter 2</div>
          <div className="page-hd-sub">Story walkthrough and quest guide</div>
        </div>
      </div>

      {/* CHAPTER 2 CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">Chapter 2 Walkthrough</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>📖</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '16px' }}>
                No Articles Yet
              </h3>
              <p style={{ marginBottom: '24px' }}>
                This section has no articles yet. Be the first to contribute comprehensive Chapter 2 walkthrough content!
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
                <li style={{ marginBottom: '8px' }}>Chapter 2 main quest progression</li>
                <li style={{ marginBottom: '8px' }}>Story developments and plot twists</li>
                <li style={{ marginBottom: '8px' }}>New regions and exploration areas</li>
                <li style={{ marginBottom: '8px' }}>Advanced gameplay mechanics</li>
                <li style={{ marginBottom: '8px' }}>Challenging boss encounters</li>
                <li>Character progression and customization</li>
              </ul>
              <p>
                Help other players master Chapter 2 of Crimson Desert!
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Walkthrough Sections</div>
            <div className="wiki-box-body">
              <Link href="/walkthrough/prologue" className="sidebar-link">Prologue</Link>
              <Link href="/walkthrough/chapter-1" className="sidebar-link">Chapter 1</Link>
              <Link href="/walkthrough/chapter-2" className="sidebar-link">Chapter 2</Link>
              <Link href="/walkthrough/chapter-3" className="sidebar-link">Chapter 3</Link>
              <Link href="/walkthrough/chapter-4" className="sidebar-link">Chapter 4</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Related Content</div>
            <div className="wiki-box-body">
              <Link href="/category/quests" className="sidebar-link">Main Quests</Link>
              <Link href="/characters" className="sidebar-link">Characters</Link>
              <Link href="/category/locations" className="sidebar-link">Locations</Link>
              <Link href="/walkthrough" className="sidebar-link">Full Walkthrough</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Contribute</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                Help build the complete Chapter 2 guide!
              </p>
              <Link href="/wiki/new" className="sidebar-link">Create Article</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
