import Link from 'next/link';

export function Footer() {
  return (
    <footer>
      <div className="footer-inner">
        {/* About Column */}
        <div>
          <div className="footer-col-title">⚔ CrimsonWiki</div>
          <p style={{ fontSize: '11px', color: 'var(--text-2)', maxWidth: '260px', lineHeight: '1.6' }}>
            Community-driven encyclopedia for Crimson Desert. Not affiliated with Pearl Abyss Corp.
          </p>
        </div>

        {/* Explore Column */}
        <div>
          <div className="footer-col-title">Explore</div>
          <Link href="/categories" className="footer-link">All Categories</Link>
          <Link href="/special/recentchanges" className="footer-link">Recent Changes</Link>
          <Link href="/special/random" className="footer-link">Random Article</Link>
          <Link href="/statistics" className="footer-link">Statistics</Link>
        </div>

        {/* Contribute Column */}
        <div>
          <div className="footer-col-title">Contribute</div>
          <Link href="/auth/login" className="footer-link">Create Account</Link>
          <Link href="/help/editing" className="footer-link">Editing Guide</Link>
          <Link href="/help/style" className="footer-link">Style Guide</Link>
          <Link href="/discord" className="footer-link">Discord Server</Link>
        </div>

        {/* Legal Column */}
        <div>
          <div className="footer-col-title">Legal</div>
          <Link href="/privacy" className="footer-link">Privacy Policy</Link>
          <Link href="/terms" className="footer-link">Terms of Service</Link>
          <a
            href="https://creativecommons.org/licenses/by-sa/4.0/"
            target="_blank"
            rel="noopener noreferrer"
            className="footer-link"
          >
            CC BY-SA 4.0
          </a>
          <Link href="/contact" className="footer-link">Contact</Link>
        </div>
      </div>

      <div className="footer-bottom">
        <span>&copy; 2026 CrimsonWiki</span>
        <span>Content available under CC BY-SA 4.0</span>
        <span>Not affiliated with Pearl Abyss Corp.</span>
      </div>
    </footer>
  );
}
