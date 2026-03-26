import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for CrimsonWiki -- what data we collect and how we use it.',
};

export default function PrivacyPage() {
  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Privacy Policy</div>
          <div className="page-hd-sub">Last updated: March 2026</div>
        </div>
      </div>

      {/* PRIVACY CONTENT */}
      <div className="content-grid">
        <div>
          <div className="wiki-box">
            <div className="wiki-box-hd">What Data We Collect</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                When you sign in via Discord OAuth, we receive and store your Discord username, avatar URL,
                email address, and Discord user ID. We also collect your IP address (handled by our hosting
                provider, Vercel) and browser user-agent for security purposes. All wiki edits are attributed
                to your public username.
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">How We Use Your Data</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                Your data is used solely for authentication, displaying your profile, and attributing your
                wiki contributions. We do not sell, share, or monetize your personal data. Email addresses
                are not displayed publicly.
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Third-Party Services</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                CrimsonWiki uses the following third-party services:
              </p>
              <ul style={{ marginBottom: '16px', paddingLeft: '20px' }}>
                <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--text-0)' }}>Supabase</strong> -- Database and authentication infrastructure.</li>
                <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--text-0)' }}>Vercel</strong> -- Hosting, CDN, and serverless functions.</li>
                <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--text-0)' }}>Discord</strong> -- OAuth authentication provider.</li>
                <li style={{ marginBottom: '6px' }}><strong style={{ color: 'var(--text-0)' }}>Google AdSense</strong> -- Advertising (if enabled).</li>
              </ul>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Cookies</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                We use essential cookies for authentication session management. Third-party services
                (such as Google AdSense) may set additional cookies for advertising purposes.
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Your Rights</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p style={{ marginBottom: '16px' }}>
                You can delete your account at any time through the{' '}
                <Link href="/settings" style={{ color: 'var(--link)' }}>Settings</Link> page.
                Deleting your account removes your profile data. Published wiki edits will remain but will
                be de-attributed.
              </p>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Contact</div>
            <div className="wiki-box-body" style={{ fontSize: '14px', lineHeight: '1.8' }}>
              <p>
                For privacy-related questions, reach out to us on our Discord server or open an issue
                on our GitHub repository.
              </p>
            </div>
          </div>
        </div>

        {/* RIGHT SIDEBAR */}
        <div className="right-sidebar">
          <div className="wiki-box">
            <div className="wiki-box-hd">Quick Links</div>
            <div className="wiki-box-body">
              <Link href="/terms" className="sidebar-link">Terms of Service</Link>
              <Link href="/contribute" className="sidebar-link">Contribution Guidelines</Link>
              <Link href="/settings" className="sidebar-link">Account Settings</Link>
              <Link href="/auth/login" className="sidebar-link">Sign In</Link>
            </div>
          </div>

          <div className="wiki-box">
            <div className="wiki-box-hd">Data Protection</div>
            <div className="wiki-box-body" style={{ fontSize: '12px', lineHeight: '1.6' }}>
              <p style={{ marginBottom: '8px' }}>
                <strong>Encryption:</strong> All data is encrypted in transit using HTTPS.
              </p>
              <p style={{ marginBottom: '8px' }}>
                <strong>Storage:</strong> Data stored in secure Supabase infrastructure.
              </p>
              <p>
                <strong>Retention:</strong> Account data retained until deletion request.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
