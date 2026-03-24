import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export async function Navbar() {
  const supabase = await createClient();
  const { data: { session } } = await supabase.auth.getSession();

  return (
    <div className="nav-wrap">
      <nav className="nav">
        <Link href="/" className="logo">
          Crimson<span>Wiki</span>
        </Link>

        <div className="nav-links">
          <Link href="/" className="nav-link">Home</Link>
          <Link href="/search" className="nav-link">Categories</Link>
          <Link href="/wiki/new" className="nav-link">Contribute</Link>
        </div>

        <div className="nav-right">
          <Link href="/search" className="search-pill">
            <span>🔍</span> Search the wiki...
          </Link>
          {session ? (
            <Link href="/admin" className="btn-login">
              Dashboard
            </Link>
          ) : (
            <Link href="/auth/login" className="btn-login">
              Login with Discord
            </Link>
          )}
        </div>
      </nav>
    </div>
  );
}
