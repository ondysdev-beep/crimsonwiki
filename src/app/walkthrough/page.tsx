import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Walkthrough',
  description: `Crimson Desert walkthrough guide -- story progression and quest help.`,
};

export default function WalkthroughPage() {
  return (
    <>
      {/* BREADCRUMB */}
      <div className="breadcrumb">
        <Link href="/">Main Page</Link>
        <span>›</span>
        <span>Walkthrough</span>
      </div>

      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Walkthrough</div>
          <div className="page-hd-sub">Story progression and quest guide</div>
        </div>
      </div>

      {/* WALKTHROUGH CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">Walkthrough Status</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
              <h3 style={{ fontSize: '20px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '16px' }}>
                Full Walkthrough Coming Soon
              </h3>
              <p style={{ marginBottom: '24px', maxWidth: '600px', margin: '0 auto 24px' }}>
                A comprehensive walkthrough for Crimson Desert is currently in development.
                The game launched recently, and our community is working to document the complete story,
                all quests, and optimal progression paths.
              </p>
              <p style={{ marginBottom: '32px', maxWidth: '600px', margin: '0 auto 32px' }}>
                In the meantime, you can explore our existing guides and contribute to building the
                most comprehensive resource for Crimson Desert players.
              </p>

              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap', marginBottom: '32px' }}>
                <Link href="/category/quests" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                  Browse Quests
                </Link>
                <Link href="/category/locations" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                  Explore Locations
                </Link>
                <Link href="/contribute" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                  Help Build Guide
                </Link>
              </div>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Available Resources</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                While we work on the complete walkthrough, these resources can help you navigate Crimson Desert:
              </p>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '16px', marginBottom: '24px' }}>
                <div className="wiki-box" style={{ margin: 0 }}>
                  <div className="wiki-box-hd">
                    <Link href="/category/quests" style={{ color: 'var(--text-0)', textDecoration: 'none' }}>
                      Quest Guides
                    </Link>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: '1.6', marginBottom: '12px' }}>
                    Individual quest guides, main story walkthroughs, and side quest help.
                  </div>
                  <Link href="/category/quests" className="btn-login" style={{ display: 'block', textAlign: 'center' }}>
                    Browse Quests
                  </Link>
                </div>

                <div className="wiki-box" style={{ margin: 0 }}>
                  <div className="wiki-box-hd">
                    <Link href="/category/locations" style={{ color: 'var(--text-0)', textDecoration: 'none' }}>
                      Location Maps
                    </Link>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: '1.6', marginBottom: '12px' }}>
                    Region overviews, dungeon maps, and points of interest guides.
                  </div>
                  <Link href="/category/locations" className="btn-login" style={{ display: 'block', textAlign: 'center' }}>
                    Explore Maps
                  </Link>
                </div>

                <div className="wiki-box" style={{ margin: 0 }}>
                  <div className="wiki-box-hd">
                    <Link href="/category/bosses" style={{ color: 'var(--text-0)', textDecoration: 'none' }}>
                      Boss Strategies
                    </Link>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: '1.6', marginBottom: '12px' }}>
                    Combat strategies, weakness guides, and boss encounter tips.
                  </div>
                  <Link href="/category/bosses" className="btn-login" style={{ display: 'block', textAlign: 'center' }}>
                    Boss Guides
                  </Link>
                </div>

                <div className="wiki-box" style={{ margin: 0 }}>
                  <div className="wiki-box-hd">
                    <Link href="/category/classes" style={{ color: 'var(--text-0)', textDecoration: 'none' }}>
                      Class Builds
                    </Link>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: '1.6', marginBottom: '12px' }}>
                    Character builds, skill guides, and progression recommendations.
                  </div>
                  <Link href="/category/classes" className="btn-login" style={{ display: 'block', textAlign: 'center' }}>
                    Build Guides
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Walkthrough Structure</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                When complete, our walkthrough will include:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Prologue Guide</strong> - Getting started and basic tutorials
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Chapter 1-4 Walkthroughs</strong> - Complete story progression
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Main Quest Solutions</strong> - Step-by-step quest guidance
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Side Quest Directory</strong> - All optional content coverage
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Hidden Content</strong> - Secrets and optional discoveries
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Boss Strategies</strong> - Detailed combat guidance
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>Progression Tips</strong> - Leveling and equipment recommendations
                </li>
              </ul>
              <p style={{ marginBottom: '16px' }}>
                Each section will include detailed objectives, maps, character dialogue, and optimal strategies.
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">How You Can Help</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                Building a comprehensive walkthrough is a community effort! Here's how you can contribute:
              </p>
              <ol style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Document Your Journey</strong> - Take notes while playing
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Share Screenshots</strong> - Capture important locations and moments
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Write Quest Guides</strong> - Document quest steps and solutions
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Record Strategies</strong> - Share boss tactics and combat tips
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>Review and Improve</strong> - Help verify and enhance existing content
                </li>
              </ol>
              <p>
                Every contribution helps create the best possible resource for the Crimson Desert community.
                Even small additions like quest objectives or location descriptions make a big difference!
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Quick Links</div>
            <div className="wiki-box-body">
              <Link href="/category/quests" className="sidebar-link">Quest Guides</Link>
              <Link href="/category/locations" className="sidebar-link">Location Maps</Link>
              <Link href="/category/bosses" className="sidebar-link">Boss Strategies</Link>
              <Link href="/category/classes" className="sidebar-link">Class Builds</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Contribute</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                Help build the complete walkthrough!
              </p>
              <p style={{ marginBottom: '8px' }}>
                Share your knowledge and experiences.
              </p>
              <Link href="/contribute" className="sidebar-link">Start Contributing</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Community</div>
            <div className="wiki-box-body">
              <Link href="/community" className="sidebar-link">Community Portal</Link>
              <Link href="/discord" className="sidebar-link">Discord Server</Link>
              <Link href="/special/recentchanges" className="sidebar-link">Recent Changes</Link>
              <Link href="/help/editing" className="sidebar-link">Editing Guide</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
