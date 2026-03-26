import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Discord Server',
  description: `Join the ${SITE_NAME} Discord server for community discussion.`,
};

export default function DiscordPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Discord Server</div>
          <div className="page-hd-sub">Join the CrimsonWiki community discussion</div>
        </div>
      </div>

      {/* DISCORD CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">Community Discussion Coming Soon</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8', textAlign: 'center', padding: '40px 20px' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🚧</div>
              <p style={{ fontSize: '18px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '16px' }}>
                Our Discord server is currently under construction
              </p>
              <p style={{ marginBottom: '24px' }}>
                We're working hard to create an amazing community space for Crimson Desert players and wiki contributors. 
                In the meantime, you can still participate in building the wiki!
              </p>
              <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
                <Link href="/contribute" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                  Contribute to Wiki
                </Link>
                <Link href="/community" className="btn-login" style={{ display: 'inline-block', padding: '12px 24px' }}>
                  Community Portal
                </Link>
              </div>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">What to Expect</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                When our Discord server launches, you'll be able to:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Chat with Contributors</strong> - Connect with other wiki editors 
                  and Crimson Desert fans
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Get Help</strong> - Ask questions about editing, 
                  game mechanics, or wiki policies
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Share Discoveries</strong> - Discuss new findings, 
                  strategies, and game updates
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Collaborate</strong> - Coordinate with other editors 
                  on large projects and article improvements
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>Stay Updated</strong> - Get notifications about 
                  important wiki changes and events
                </li>
              </ul>
              <p>
                The Discord server will be the perfect complement to the wiki, enabling real-time discussion 
                and collaboration that enhances our collective knowledge base.
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Alternative Ways to Connect</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                While we work on the Discord server, here are other ways to engage with the community:
              </p>
              <div style={{ marginLeft: '20px' }}>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Wiki Talk Pages:</strong> Each article has a discussion 
                  tab where you can talk with other editors about that specific content.
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Community Portal:</strong> Visit our 
                  <Link href="/community" style={{ color: 'var(--link)' }}> community portal</Link> for 
                  announcements and coordination.
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>GitHub:</strong> For technical issues and 
                  feature requests, use our GitHub repository.
                </p>
                <p>
                  <strong style={{ color: 'var(--text-0)' }}>Email:</strong> For administrative matters, 
                  contact admin@crimsonwiki.org
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Quick Actions</div>
            <div className="wiki-box-body">
              <Link href="/contribute" className="sidebar-link">Start Contributing</Link>
              <Link href="/help/editing" className="sidebar-link">Learn to Edit</Link>
              <Link href="/wiki/new" className="sidebar-link">Create Article</Link>
              <Link href="/search" className="sidebar-link">Browse Wiki</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Community Stats</div>
            <div className="wiki-box-body">
              <div className="contrib-row">
                <span>Active Contributors</span>
                <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--amber)' }}>Growing</span>
              </div>
              <div className="contrib-row">
                <span>Articles Created</span>
                <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--amber)' }}>Expanding</span>
              </div>
              <div className="contrib-row">
                <span>Daily Edits</span>
                <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--amber)' }}>Active</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
