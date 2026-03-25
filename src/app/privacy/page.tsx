import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'Privacy Policy for CrimsonWiki -- what data we collect and how we use it.',
};

export default function PrivacyPage() {
  return (
    <div className="section page-enter" style={{ maxWidth: 760 }}>
      <h1 className="section-title" style={{ fontSize: 28, marginBottom: 8 }}>Privacy Policy</h1>
      <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 32 }}>
        Last updated: March 2026
      </div>

      <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, marginTop: 0 }}>
          What Data We Collect
        </h2>
        <p style={{ marginBottom: 16 }}>
          When you sign in via Discord OAuth, we receive and store your Discord username, avatar URL,
          email address, and Discord user ID. We also collect your IP address (handled by our hosting
          provider, Vercel) and browser user-agent for security purposes. All wiki edits are attributed
          to your public username.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          How We Use Your Data
        </h2>
        <p style={{ marginBottom: 16 }}>
          Your data is used solely for authentication, displaying your profile, and attributing your
          wiki contributions. We do not sell, share, or monetize your personal data. Email addresses
          are not displayed publicly.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          Third-Party Services
        </h2>
        <p style={{ marginBottom: 16 }}>
          CrimsonWiki uses the following third-party services:
        </p>
        <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
          <li style={{ marginBottom: 6 }}><strong style={{ color: 'var(--text-primary)' }}>Supabase</strong> -- Database and authentication infrastructure.</li>
          <li style={{ marginBottom: 6 }}><strong style={{ color: 'var(--text-primary)' }}>Vercel</strong> -- Hosting, CDN, and serverless functions.</li>
          <li style={{ marginBottom: 6 }}><strong style={{ color: 'var(--text-primary)' }}>Discord</strong> -- OAuth authentication provider.</li>
          <li style={{ marginBottom: 6 }}><strong style={{ color: 'var(--text-primary)' }}>Google AdSense</strong> -- Advertising (if enabled).</li>
        </ul>

        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          Cookies
        </h2>
        <p style={{ marginBottom: 16 }}>
          We use essential cookies for authentication session management. Third-party services
          (such as Google AdSense) may set additional cookies for advertising purposes.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          Your Rights
        </h2>
        <p style={{ marginBottom: 16 }}>
          You can delete your account at any time through the{' '}
          <Link href="/settings" style={{ color: 'var(--crimson-bright)' }}>Settings</Link> page.
          Deleting your account removes your profile data. Published wiki edits will remain but will
          be de-attributed.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          Contact
        </h2>
        <p>
          For privacy-related questions, reach out to us on our Discord server or open an issue
          on our GitHub repository.
        </p>
      </div>
    </div>
  );
}
