import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Weapons',
  description: `Weapons guide for ${SITE_NAME} -- all weapon types, stats, and combat strategies.`,
};

export default function WeaponsPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Weapons</div>
          <div className="page-hd-sub">All weapon types, stats, and combat strategies</div>
        </div>
      </div>

      {/* WEAPONS CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">Weapons Guide</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>⚔️</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '16px' }}>
                No Articles Yet
              </h3>
              <p style={{ marginBottom: '24px' }}>
                This section has no articles yet. Be the first to contribute comprehensive weapon guides!
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '24px' }}>
                <Link href="/wiki/new" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                  Create Article
                </Link>
                <Link href="/category/items" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                  Browse Items
                </Link>
              </div>
              <p style={{ fontSize: '13px', color: 'var(--text-1)' }}>
                Browse all articles in <Link href="/category/items" style={{ color: 'var(--link)' }}>Items</Link>.
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
                <li style={{ marginBottom: '8px' }}>Individual weapon statistics and damage values</li>
                <li style={{ marginBottom: '8px' }}>Weapon upgrade paths and enhancement systems</li>
                <li style={{ marginBottom: '8px' }}>Best weapons for each class and build</li>
                <li style={{ marginBottom: '8px' }}>Weapon crafting recipes and materials</li>
                <li style={{ marginBottom: '8px' }}>Combat styles and weapon combinations</li>
                <li>Legendary and unique weapon locations</li>
              </ul>
              <p>
                Help other players master Crimson Desert's combat systems!
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Item Categories</div>
            <div className="wiki-box-body">
              <Link href="/items/weapons" className="sidebar-link">Weapons</Link>
              <Link href="/items/armor" className="sidebar-link">Armor</Link>
              <Link href="/items/accessories" className="sidebar-link">Accessories</Link>
              <Link href="/items/consumables" className="sidebar-link">Consumables</Link>
              <Link href="/items/materials" className="sidebar-link">Materials</Link>
              <Link href="/category/items" className="sidebar-link">All Items</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Related Content</div>
            <div className="wiki-box-body">
              <Link href="/category/classes" className="sidebar-link">Class Builds</Link>
              <Link href="/category/crafting" className="sidebar-link">Crafting</Link>
              <Link href="/category/bosses" className="sidebar-link">Boss Loot</Link>
              <Link href="/category/quests" className="sidebar-link">Quest Rewards</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Contribute</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                Share your weapon expertise!
              </p>
              <Link href="/wiki/new" className="sidebar-link">Create Guide</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
