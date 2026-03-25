import Link from 'next/link';

export function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div>
          <div className="footer-logo">CrimsonWiki</div>
          <div className="footer-desc">
            The community-driven encyclopedia for Crimson Desert. Built by players, for players. Not affiliated with Pearl Abyss.
          </div>
        </div>
        <div>
          <div className="footer-col-title">Explore</div>
          <Link href="/category/quests" className="footer-link">Quests</Link>
          <Link href="/category/bosses" className="footer-link">Bosses</Link>
          <Link href="/category/items" className="footer-link">Items</Link>
          <Link href="/category/locations" className="footer-link">Locations</Link>
          <Link href="/category/classes" className="footer-link">Classes</Link>
          <Link href="/category/crafting" className="footer-link">Crafting</Link>
          <Link href="/category/lore" className="footer-link">Lore</Link>
          <Link href="/category/tips" className="footer-link">Tips and Tricks</Link>
        </div>
        <div>
          <div className="footer-col-title">Contribute</div>
          <Link href="/contribute" className="footer-link">How to Contribute</Link>
          <Link href="/wiki/new" className="footer-link">New Article</Link>
          <Link href="/search" className="footer-link">Search Wiki</Link>
          <Link href="/auth/login" className="footer-link">Create Account</Link>
        </div>
        <div>
          <div className="footer-col-title">Legal</div>
          <Link href="/privacy" className="footer-link">Privacy Policy</Link>
          <Link href="/terms" className="footer-link">Terms of Service</Link>
          <a href="https://creativecommons.org/licenses/by-sa/4.0/" target="_blank" rel="noopener noreferrer" className="footer-link">CC BY-SA 4.0</a>
        </div>
      </div>
      <div className="footer-bottom">
        <span>&copy; {new Date().getFullYear()} CrimsonWiki -- Community content is CC BY-SA 4.0</span>
        <span>Not affiliated with Pearl Abyss</span>
      </div>
    </footer>
  );
}
