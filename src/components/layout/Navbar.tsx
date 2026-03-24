'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter, usePathname } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types/database';
import type { AuthChangeEvent, Session } from '@supabase/supabase-js';

export function Navbar() {
  const [user, setUser] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        if (data) setUser(data as Profile);
      }
    };
    load();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (_event: AuthChangeEvent, session: Session | null) => {
        if (session?.user) {
          const { data } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          if (data) setUser(data as Profile);
        } else {
          setUser(null);
        }
      }
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setMenuOpen(false);
    router.refresh();
  };

  const isActive = (path: string) => pathname === path;

  return (
    <div className="nav-wrap">
      <nav className="nav">
        <Link href="/" className="logo">
          Crimson<span>Wiki</span>
        </Link>

        <div className="nav-links">
          <Link href="/" className={`nav-link${isActive('/') ? ' active' : ''}`}>Home</Link>
          <Link href="/search" className={`nav-link${isActive('/search') ? ' active' : ''}`}>Categories</Link>
          <Link href="/wiki/new" className={`nav-link${isActive('/wiki/new') ? ' active' : ''}`}>Contribute</Link>
        </div>

        <div className="nav-right">
          <Link href="/search" className="search-pill">
            <span>🔍</span> Search the wiki...
          </Link>

          {user ? (
            <div className="user-menu-wrap" ref={menuRef}>
              <button
                className="user-avatar-btn"
                onClick={() => setMenuOpen(!menuOpen)}
              >
                {user.avatar_url ? (
                  <Image
                    src={user.avatar_url}
                    alt={user.username}
                    width={30}
                    height={30}
                    className="user-avatar-img"
                  />
                ) : (
                  <span className="user-avatar-fallback">
                    {user.username.charAt(0).toUpperCase()}
                  </span>
                )}
              </button>

              {menuOpen && (
                <div className="user-dropdown">
                  <div className="user-dropdown-header">
                    <div className="user-dropdown-name">{user.username}</div>
                    <div className="user-dropdown-role">{user.role}</div>
                  </div>
                  <Link href="/settings" className="user-dropdown-item" onClick={() => setMenuOpen(false)}>
                    ⚙️ Settings
                  </Link>
                  <Link href="/wiki/new" className="user-dropdown-item" onClick={() => setMenuOpen(false)}>
                    📝 New Article
                  </Link>
                  {(user.role === 'admin' || user.role === 'moderator') && (
                    <Link href="/admin" className="user-dropdown-item" onClick={() => setMenuOpen(false)}>
                      🛡️ Admin Panel
                    </Link>
                  )}
                  <div className="user-dropdown-divider" />
                  <button className="user-dropdown-item user-dropdown-signout" onClick={handleSignOut}>
                    🚪 Sign Out
                  </button>
                </div>
              )}
            </div>
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
