import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Community Portal',
  description: `Community portal for ${SITE_NAME} -- connect with contributors and stay updated.`,
};

export default function CommunityPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Community Portal</div>
          <div className="page-hd-sub">Connect with contributors and stay updated</div>
        </div>
      </div>

      {/* COMMUNITY CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">Community Resources</div>
            <div className="wiki-box-body">
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                <div className="wiki-box" style={{ margin: 0 }}>
                  <div className="wiki-box-hd">
                    <Link href="/special/recentchanges" style={{ color: 'var(--text-0)', textDecoration: 'none' }}>
                      Recent Changes
                    </Link>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: '1.6', marginBottom: '12px' }}>
                    See the latest edits and updates across all articles. Track what's happening in the wiki in real-time.
                  </div>
                  <Link href="/special/recentchanges" className="btn-login" style={{ display: 'block', textAlign: 'center' }}>
                    View Recent Changes
                  </Link>
                </div>

                <div className="wiki-box" style={{ margin: 0 }}>
                  <div className="wiki-box-hd">
                    <Link href="/special/newpages" style={{ color: 'var(--text-0)', textDecoration: 'none' }}>
                      New Articles
                    </Link>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: '1.6', marginBottom: '12px' }}>
                    Browse the newest articles created by community contributors. Discover fresh content and topics.
                  </div>
                  <Link href="/special/newpages" className="btn-login" style={{ display: 'block', textAlign: 'center' }}>
                    Browse New Articles
                  </Link>
                </div>

                <div className="wiki-box" style={{ margin: 0 }}>
                  <div className="wiki-box-hd">
                    <Link href="/help/editing" style={{ color: 'var(--text-0)', textDecoration: 'none' }}>
                      Editing Guide
                    </Link>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: '1.6', marginBottom: '12px' }}>
                    Learn how to create and edit articles. Step-by-step instructions for wiki editing.
                  </div>
                  <Link href="/help/editing" className="btn-login" style={{ display: 'block', textAlign: 'center' }}>
                    Learn to Edit
                  </Link>
                </div>

                <div className="wiki-box" style={{ margin: 0 }}>
                  <div className="wiki-box-hd">
                    <Link href="/help/style" style={{ color: 'var(--text-0)', textDecoration: 'none' }}>
                      Style Guide
                    </Link>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: '1.6', marginBottom: '12px' }}>
                    Understand our formatting standards and writing guidelines. Keep the wiki consistent.
                  </div>
                  <Link href="/help/style" className="btn-login" style={{ display: 'block', textAlign: 'center' }}>
                    Read Style Guide
                  </Link>
                </div>

                <div className="wiki-box" style={{ margin: 0 }}>
                  <div className="wiki-box-hd">
                    <Link href="/discord" style={{ color: 'var(--text-0)', textDecoration: 'none' }}>
                      Discord Server
                    </Link>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: '1.6', marginBottom: '12px' }}>
                    Join our community discussion (coming soon). Chat with other contributors and players.
                  </div>
                  <Link href="/discord" className="btn-login" style={{ display: 'block', textAlign: 'center' }}>
                    Join Discord
                  </Link>
                </div>

                <div className="wiki-box" style={{ margin: 0 }}>
                  <div className="wiki-box-hd">
                    <Link href="/contribute" style={{ color: 'var(--text-0)', textDecoration: 'none' }}>
                      Contribute
                    </Link>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-1)', lineHeight: '1.6', marginBottom: '12px' }}>
                    Get started with contributing to the wiki. Every contribution helps the community.
                  </div>
                  <Link href="/contribute" className="btn-login" style={{ display: 'block', textAlign: 'center' }}>
                    Start Contributing
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Community Guidelines</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                Our community thrives on collaboration and respect. Here are the principles that guide our interactions:
              </p>
              <div style={{ marginLeft: '20px' }}>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Be Constructive</strong> - Focus on improving the wiki. 
                  Provide helpful feedback and suggestions.
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Be Respectful</strong> - Treat all contributors with courtesy, 
                  regardless of experience level or opinions.
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Be Collaborative</strong> - Work together to build the best 
                  possible resource for the Crimson Desert community.
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Be Accurate</strong> - Verify information before publishing. 
                  Cite sources when possible and correct errors when found.
                </p>
                <p style={{ marginBottom: '12px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Be Patient</strong> - Remember that everyone is volunteering. 
                  Be understanding of different schedules and priorities.
                </p>
                <p>
                  <strong style={{ color: 'var(--text-0)' }}>Be Welcoming</strong> - Help new contributors get started. 
                  A friendly community encourages more participation.
                </p>
              </div>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">How to Get Involved</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                Ready to join our community? Here's how you can start contributing today:
              </p>
              <ol style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Create an Account</strong> - Sign in with Discord to get started. 
                  This gives you editing privileges and tracks your contributions.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Start Small</strong> - Fix typos, add missing information, 
                  or improve existing articles. Every edit counts!
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Learn the Ropes</strong> - Read our editing and style guides. 
                  Understanding our standards helps everyone work together effectively.
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Join Discussions</strong> - Use talk pages to discuss article 
                  improvements with other editors.
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>Share Your Knowledge</strong> - Create new articles about topics 
                  you know well. Your expertise helps the entire community.
                </li>
              </ol>
              <p>
                Remember: The wiki is built by people like you! Your contributions, no matter how small, 
                help create a better resource for everyone.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Quick Stats</div>
            <div className="wiki-box-body">
              <Link href="/statistics" className="sidebar-link">View Detailed Statistics</Link>
              <div className="contrib-row">
                <span>Active Contributors</span>
                <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--amber)' }}>Growing</span>
              </div>
              <div className="contrib-row">
                <span>Daily Activity</span>
                <span style={{ fontFamily: 'var(--ff-mono)', color: 'var(--amber)' }}>Active</span>
              </div>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Community Tools</div>
            <div className="wiki-box-body">
              <Link href="/special/allpages" className="sidebar-link">All Pages</Link>
              <Link href="/special/random" className="sidebar-link">Random Page</Link>
              <Link href="/search" className="sidebar-link">Search Wiki</Link>
              <Link href="/category" className="sidebar-link">Browse Categories</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Need Help?</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>Questions?</strong> Ask on article talk pages.
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>Issues?</strong> Report problems via GitHub.
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>Guidance?</strong> Check our help guides.
              </p>
              <p>
                <strong>Contact?</strong> Email admin@crimsonwiki.org
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
