import Link from 'next/link';
import type { Metadata } from 'next';
import { SITE_NAME } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'Contact',
  description: `Contact information for ${SITE_NAME} -- get in touch with the team.`,
};

export default function ContactPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Contact</div>
          <div className="page-hd-sub">Get in touch with the CrimsonWiki team</div>
        </div>
      </div>

      {/* CONTACT CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">Contact Methods</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                There are several ways to get in touch with the CrimsonWiki team and community, 
                depending on the nature of your inquiry:
              </p>
              
              <div style={{ marginLeft: '20px' }}>
                <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '8px' }}>
                    📝 Wiki-Related Issues
                  </h3>
                  <p style={{ marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--text-0)' }}>Best Method:</strong> Discord Server
                  </p>
                  <p style={{ marginBottom: '8px' }}>
                    For questions about article content, editing help, collaboration, or general wiki matters, 
                    our Discord server is the best place to get quick responses from the community.
                  </p>
                  <p>
                    <Link href="/discord" className="btn-login" style={{ display: 'inline-block', padding: '8px 16px' }}>
                      Join Discord
                    </Link>
                  </p>
                </div>

                <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '8px' }}>
                    ⚖️ Legal or Copyright Concerns
                  </h3>
                  <p style={{ marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--text-0)' }}>Email:</strong> <a href="mailto:admin@crimsonwiki.org" style={{ color: 'var(--link)' }}>admin@crimsonwiki.org</a>
                  </p>
                  <p style={{ marginBottom: '8px' }}>
                    For copyright claims, DMCA notices, legal inquiries, or other official matters, 
                    please email us directly. We take these concerns seriously and will respond promptly.
                  </p>
                  <p>
                    Please include specific details about the content in question and the nature of your concern.
                  </p>
                </div>

                <div style={{ marginBottom: '24px', padding: '16px', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '8px' }}>
                    🛡️ Report Vandalism or Abuse
                  </h3>
                  <p style={{ marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--text-0)' }}>Best Method:</strong> Discord Server
                  </p>
                  <p style={{ marginBottom: '8px' }}>
                    To report vandalism, spam, abuse, or policy violations, use our Discord server 
                    for immediate attention from moderators.
                  </p>
                  <p>
                    You can also use the talk pages on affected articles to discuss issues with other editors.
                  </p>
                </div>

                <div style={{ padding: '16px', border: '1px solid var(--border)', borderRadius: '4px' }}>
                  <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'var(--text-0)', marginBottom: '8px' }}>
                    🐛 Technical Issues
                  </h3>
                  <p style={{ marginBottom: '8px' }}>
                    <strong style={{ color: 'var(--text-0)' }}>Best Method:</strong> GitHub Repository
                  </p>
                  <p style={{ marginBottom: '8px' }}>
                    For bugs, feature requests, or technical issues with the wiki platform, 
                    please open an issue on our GitHub repository.
                  </p>
                  <p>
                    This helps us track technical problems and ensures they get addressed by the development team.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Response Times</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                Our response times vary by contact method and issue type:
              </p>
              <ul style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Discord:</strong> Usually within minutes to hours during active times
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Email:</strong> Within 24-48 hours for legal/administrative matters
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>GitHub:</strong> Depends on issue priority and developer availability
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>Talk Pages:</strong> Varies by contributor availability
                </li>
              </ul>
              <p>
                Remember that CrimsonWiki is run by volunteers. We appreciate your patience and understanding 
                as we work to address your concerns.
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Community Guidelines</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                When contacting us or interacting with the community, please keep these guidelines in mind:
              </p>
              <ol style={{ marginLeft: '20px', marginBottom: '16px' }}>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Be Specific</strong> - Provide clear details about your issue or question
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Be Patient</strong> - Remember we're volunteers with varying schedules
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Be Respectful</strong> - Treat all community members with courtesy
                </li>
                <li style={{ marginBottom: '8px' }}>
                  <strong style={{ color: 'var(--text-0)' }}>Be Constructive</strong> - Focus on solutions and improvements
                </li>
                <li>
                  <strong style={{ color: 'var(--text-0)' }}>Be Appropriate</strong> - Use the right contact method for your issue
                </li>
              </ol>
              <p>
                Following these guidelines helps us provide better support and maintain a positive community environment.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Quick Contact</div>
            <div className="wiki-box-body">
              <div className="contrib-row">
                <span>Discord</span>
                <Link href="/discord" className="sidebar-link" style={{ fontSize: '12px' }}>Join Server</Link>
              </div>
              <div className="contrib-row">
                <span>Email</span>
                <a href="mailto:admin@crimsonwiki.org" className="sidebar-link" style={{ fontSize: '12px' }}>Send Email</a>
              </div>
              <div className="contrib-row">
                <span>GitHub</span>
                <a href="https://github.com/ondysdev-beep/crimsonwiki" target="_blank" rel="noopener noreferrer" className="sidebar-link" style={{ fontSize: '12px' }}>View Issues</a>
              </div>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Before Contacting</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>Check our guides first:</strong>
              </p>
              <Link href="/help/editing" className="sidebar-link">Editing Guide</Link>
              <Link href="/help/style" className="sidebar-link">Style Guide</Link>
              <Link href="/contribute" className="sidebar-link">Contribution Guide</Link>
              <p style={{ marginTop: '8px' }}>
                Many common questions are answered in our documentation.
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Other Resources</div>
            <div className="wiki-box-body">
              <Link href="/community" className="sidebar-link">Community Portal</Link>
              <Link href="/about" className="sidebar-link">About CrimsonWiki</Link>
              <Link href="/terms" className="sidebar-link">Terms of Service</Link>
              <Link href="/privacy" className="sidebar-link">Privacy Policy</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
