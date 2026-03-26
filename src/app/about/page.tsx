import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'About',
  description: `About ${SITE_NAME} -- the community-driven wiki for Crimson Desert.`,
};

export default function AboutPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">About CrimsonWiki</div>
          <div className="page-hd-sub">Learn about the community-driven wiki for Crimson Desert</div>
        </div>
      </div>

      {/* ABOUT CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">What is CrimsonWiki?</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                CrimsonWiki is a community-driven wiki for Crimson Desert, launched alongside the game in March 2026. 
                Our mission is to provide comprehensive, accurate, and up-to-date information about all aspects of the game.
              </p>
              <p style={{ marginBottom: '16px' }}>
                <strong style={{ color: 'var(--text-0)' }}>Important:</strong> CrimsonWiki is <strong style={{ color: 'var(--text-0)' }}>not affiliated with Pearl Abyss</strong> 
                or any official Crimson Desert entity. We are a fan-made project created by and for the community.
              </p>
              <p>
                All content on this wiki is created and maintained by volunteer contributors who are passionate about 
                Crimson Desert and want to help other players enjoy the game to its fullest.
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">How to Contribute</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                Contributing to CrimsonWiki is easy and rewarding! Here's how you can help:
              </p>
              <ol style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Create an Account</strong> - Sign in with Discord to get started. 
                  Your account lets you create and edit articles, and tracks your contributions.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Edit Articles</strong> - Found outdated information? 
                  Click the edit button on any article to improve it. Every edit helps!
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Create New Articles</strong> - See something missing? 
                  Create comprehensive articles about quests, bosses, items, locations, and more.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Follow Style Guide</strong> - Consistency is key. 
                  Follow our editing and style guidelines to maintain quality.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>Be Respectful</strong> - Work collaboratively with other editors 
                  and maintain a neutral, encyclopedic tone.
                </li>
              </ol>
              <p>
                Ready to start contributing? <Link href="/contribute" style={{ color: 'var(--link)' }}>Visit our contribution guide</Link> 
                to learn more about best practices and guidelines.
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Contact</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                Want to get in touch with the CrimsonWiki community or team? Here's how:
              </p>
              <div style={{ marginLeft: '20px' }}>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Discord Server:</strong> Our Discord server is coming soon! 
                  Join the community discussion by contributing to the wiki in the meantime.
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>GitHub:</strong> Found a bug or want to suggest features? 
                  Open an issue on our GitHub repository.
                </p>
                <p style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Wiki Discussion:</strong> Use the talk pages on articles 
                  to discuss specific content improvements with other editors.
                </p>
                <p>
                  <strong style={{ color: 'var(--text-0)' }}>Email:</strong> For legal or copyright concerns, 
                  contact us at admin@crimsonwiki.org
                </p>
              </div>
              <p style={{ marginTop: '16px' }}>
                For general questions about contributing, <Link href="/contribute" style={{ color: 'var(--link)' }}>check out our contribution guide</Link> 
                or start editing and learn by doing!
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Quick Links</div>
            <div className="wiki-box-body">
              <Link href="/contribute" className="sidebar-link">Contribute</Link>
              <Link href="/help/editing" className="sidebar-link">Editing Guide</Link>
              <Link href="/help/style" className="sidebar-link">Style Guide</Link>
              <Link href="/community" className="sidebar-link">Community Portal</Link>
              <Link href="/statistics" className="sidebar-link">Statistics</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Getting Started</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>New to wiki editing?</strong> Start with our comprehensive guides.
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>Looking for something?</strong> Use the search bar or browse categories.
              </p>
              <p>
                <strong>Need help?</strong> Join our community discussions or ask questions on article talk pages.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
