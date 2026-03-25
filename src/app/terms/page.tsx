import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Terms of Service',
  description: 'Terms of Service for CrimsonWiki -- rules for contributing and using the wiki.',
};

export default function TermsPage() {
  return (
    <div className="section page-enter" style={{ maxWidth: 760 }}>
      <h1 className="section-title" style={{ fontSize: 28, marginBottom: 8 }}>Terms of Service</h1>
      <div style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 32 }}>
        Last updated: March 2026
      </div>

      <div style={{ fontSize: 14, color: 'var(--text-muted)', lineHeight: 1.8 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8, marginTop: 0 }}>
          Content Ownership
        </h2>
        <p style={{ marginBottom: 16 }}>
          All community-contributed content on CrimsonWiki is licensed under the{' '}
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--crimson-bright)' }}>
            Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
          </a>{' '}
          license. By submitting content, you agree to license your contributions under this license
          and confirm that you have the right to do so.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          Prohibited Content
        </h2>
        <p style={{ marginBottom: 8 }}>The following content is prohibited on CrimsonWiki:</p>
        <ul style={{ marginBottom: 16, paddingLeft: 20 }}>
          <li style={{ marginBottom: 6 }}>Spam, advertising, or promotional content unrelated to Crimson Desert.</li>
          <li style={{ marginBottom: 6 }}>Copyrighted game assets, screenshots, or textures used without permission.</li>
          <li style={{ marginBottom: 6 }}>Harassment, hate speech, or personal attacks against other users.</li>
          <li style={{ marginBottom: 6 }}>Malicious links, scripts, or any form of security exploit.</li>
          <li style={{ marginBottom: 6 }}>Deliberately false or misleading information.</li>
        </ul>

        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          Account Termination
        </h2>
        <p style={{ marginBottom: 16 }}>
          We reserve the right to suspend or terminate accounts that violate these terms.
          Repeated violations will result in a permanent ban. You may delete your own account
          at any time through the Settings page.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          Disclaimer
        </h2>
        <p style={{ marginBottom: 16 }}>
          CrimsonWiki is a fan-made project and is <strong style={{ color: 'var(--text-primary)' }}>not affiliated with Pearl Abyss</strong> or
          any official Crimson Desert entity. All game-related content, names, and trademarks
          are the property of their respective owners.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          Limitation of Liability
        </h2>
        <p style={{ marginBottom: 16 }}>
          CrimsonWiki is provided &ldquo;as is&rdquo; without warranties of any kind. We are not responsible
          for the accuracy of community-contributed content. Use information from this wiki at your
          own discretion.
        </p>

        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 8 }}>
          Changes to These Terms
        </h2>
        <p>
          We may update these terms at any time. Continued use of CrimsonWiki after changes
          constitutes acceptance of the updated terms.
        </p>
      </div>
    </div>
  );
}
