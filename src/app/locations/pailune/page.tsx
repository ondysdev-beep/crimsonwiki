import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Pailune',
  description: `Pailune location guide for ${SITE_NAME} -- region information and points of interest.`,
};

export default function PailunePage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Pailune</div>
          <div className="page-hd-sub">Region guide and points of interest</div>
        </div>
      </div>

      {/* PAILUNE CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">Pailune Region Guide</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌲</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '16px' }}>
                No Articles Yet
              </h3>
              <p style={{ marginBottom: '24px' }}>
                This section has no articles yet. Be the first to contribute comprehensive Pailune region information!
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <Link href="/wiki/new" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                  Create Article
                </Link>
                <Link href="/category/locations" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                  Browse Locations
                </Link>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-1)' }}>
                Browse all articles in <Link href="/category/locations" style={{ color: 'var(--link)' }}>Locations</Link>.
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Suggested Content</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                When creating content for Pailune, consider including:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>Forest regions and dense woodlands</li>
                <li style={{ marginBottom: '8px' }}>Hidden groves and sacred areas</li>
                <li style={{ marginBottom: '8px' }}>Forest settlements and outposts</li>
                <li style={{ marginBottom: '8px' }}>Ancient ruins and forgotten temples</li>
                <li style={{ marginBottom: '8px' }}>Unique flora and fauna</li>
                <li>Forest-specific resources and materials</li>
              </ul>
              <p>
                Help other players explore the forest regions of Crimson Desert!
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Location Links</div>
            <div className="wiki-box-body">
              <Link href="/locations/hernand" className="sidebar-link">Hernand</Link>
              <Link href="/locations/demeniss" className="sidebar-link">Demeniss</Link>
              <Link href="/locations/delesyia" className="sidebar-link">Delesyia</Link>
              <Link href="/locations/pailune" className="sidebar-link">Pailune</Link>
              <Link href="/category/locations" className="sidebar-link">All Locations</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Related Content</div>
            <div className="wiki-box-body">
              <Link href="/category/quests" className="sidebar-link">Forest Quests</Link>
              <Link href="/category/bosses" className="sidebar-link">Forest Creatures</Link>
              <Link href="/category/lore" className="sidebar-link">Forest Lore</Link>
              <Link href="/category/items" className="sidebar-link">Forest Resources</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Contribute</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                Document Pailune's forest regions!
              </p>
              <Link href="/wiki/new" className="sidebar-link">Create Location Guide</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
