import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for CrimsonWiki -- rules for contributing and using the wiki.',
};

export default function TermsPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Terms of Service</div>
          <div className="page-hd-sub">Last updated: March 2026</div>
        </div>
      </div>

      {/* TERMS CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">Content Ownership</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                All community-contributed content on CrimsonWiki is licensed under the{' '}
                <a
                  href="https://creativecommons.org/licenses/by-sa/4.0/"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--link)' }}
                >
                  Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
                </a>{' '}
                license. By submitting content, you agree to license your contributions under this license
                and confirm that you have the right to do so.
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Prohibited Content</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '8px' }}>The following content is prohibited on CrimsonWiki:</p>
              <ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '6px' }}>Spam, advertising, or promotional content unrelated to Crimson Desert.</li>
                <li style={{ marginBottom: '6px' }}>Copyrighted game assets, screenshots, or textures used without permission.</li>
                <li style={{ marginBottom: '6px' }}>Harassment, hate speech, or personal attacks against other users.</li>
                <li style={{ marginBottom: '6px' }}>Malicious links, scripts, or any form of security exploit.</li>
                <li style={{ marginBottom: '6px' }}>Deliberately false or misleading information.</li>
              </ul>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Account Termination</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                We reserve the right to suspend or terminate accounts that violate these terms.
                Repeated violations will result in a permanent ban. You may delete your own account
                at any time through the Settings page.
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Disclaimer</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                CrimsonWiki is a fan-made project and is <strong style={{ color: 'var(--text-0)' }}>not affiliated with Pearl Abyss</strong> or
                any official Crimson Desert entity. All game-related content, names, and trademarks
                are the property of their respective owners.
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Limitation of Liability</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                CrimsonWiki is provided &ldquo;as is&rdquo; without warranties of any kind. We are not responsible
                for the accuracy of community-contributed content. Use information from this wiki at your
                own discretion.
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Changes to These Terms</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p>
                We may update these terms at any time. Continued use of CrimsonWiki after changes
                constitutes acceptance of the updated terms.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Quick Links</div>
            <div className="wiki-box-body">
              <Link href="/privacy" className="sidebar-link">Privacy Policy</Link>
              <Link href="/contribute" className="sidebar-link">Contribution Guidelines</Link>
              <Link href="/settings" className="sidebar-link">Account Settings</Link>
              <Link href="/auth/login" className="sidebar-link">Sign In</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">License Information</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>CC BY-SA 4.0:</strong> Share and adapt with attribution.
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>Commercial Use:</strong> Allowed with proper attribution.
              </p>
              <p>
                <strong>Modifications:</strong> Must be shared under same license.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
