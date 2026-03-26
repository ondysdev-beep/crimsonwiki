import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Crafting System',
  description: `Crafting system guide for ${SITE_NAME} -- recipes, materials, and production mechanics.`,
};

export default function CraftingSystemPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Crafting System</div>
          <div className="page-hd-sub">Recipes, materials, and production mechanics</div>
        </div>
      </div>

      {/* CRAFTING SYSTEM CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">Crafting System Guide</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔨</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '16px' }}>
                No Articles Yet
              </h3>
              <p style={{ marginBottom: '24px' }}>
                This section has no articles yet. Be the first to contribute comprehensive crafting system guides!
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <Link href="/wiki/new" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                  Create Article
                </Link>
                <Link href="/category/crafting" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                  Browse Crafting
                </Link>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-1)' }}>
                Browse all articles in <Link href="/category/crafting" style={{ color: 'var(--link)' }}>Crafting</Link>.
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Suggested Content</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                When creating content for the crafting system, consider including:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>Crafting stations and workshops</li>
                <li style={{ marginBottom: '8px' }}>Recipe categories and unlock requirements</li>
                <li style={{ marginBottom: '8px' }}>Material gathering and processing</li>
                <li style={{ marginBottom: '8px' }}>Quality levels and enhancement systems</li>
                <li style={{ marginBottom: '8px' }}>Special recipes and legendary items</li>
                <li>Crafting skill progression and mastery</li>
              </ul>
              <p>
                Help other players master Crimson Desert's crafting system!
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
              <Link href="/category/crafting" className="sidebar-link">Crafting Guides</Link>
              <Link href="/category/items" className="sidebar-link">Materials</Link>
              <Link href="/category/locations" className="sidebar-link">Resource Locations</Link>
              <Link href="/category/tips" className="sidebar-link">Crafting Tips</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Contribute</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                Share your crafting knowledge!
              </p>
              <Link href="/wiki/new" className="sidebar-link">Create Crafting Guide</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
