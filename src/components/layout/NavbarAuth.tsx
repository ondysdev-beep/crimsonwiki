'use client';

import { useState, useEffect, useRef } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import type { User } from '@supabase/supabase-js';
import type { Profile } from '@/lib/types/database';

export function NavbarAuth() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  const loadProfile = async (user: User) => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (data) {
        setProfile(data as Profile);
      } else {
        const meta = user.user_metadata ?? {};
        const username =
          meta?.custom_claims?.global_name ??
          meta?.user_name ??
          meta?.name ??
          meta?.full_name ??
          user.email?.split('@')[0] ??
          'user_' + user.id.substring(0, 8);
        setProfile({
          id: user.id,
          username: (username ?? '').trim() || 'user_' + user.id.substring(0, 8),
          avatar_url: meta?.avatar_url ?? null,
          discord_id: meta?.provider_id ?? null,
          role: 'editor',
          is_founder: false,
          created_at: new Date().toISOString(),
        } as Profile);
      }
    } catch {
      setProfile(null);
    }
  };

  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user) loadProfile(user);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        if (session?.user) {
          loadProfile(session.user);
        } else {
          setProfile(null);
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
    setProfile(null);
    setMenuOpen(false);
    router.refresh();
  };

  if (!profile) {
    return (
      <a href="/auth/login" className="btn-login">
        Login with Discord
      </a>
    );
  }

  return (
    <div className="user-menu-wrap" ref={menuRef}>
      <button
        className="user-avatar-btn"
        onClick={() => setMenuOpen(!menuOpen)}
      >
        {profile.avatar_url ? (
          <Image
            src={profile.avatar_url}
            alt={profile.username}
            width={30}
            height={30}
            className="user-avatar-img"
          />
        ) : (
          <span className="user-avatar-fallback">
            {profile.username.charAt(0).toUpperCase()}
          </span>
        )}
      </button>

      {menuOpen && (
        <div className="user-dropdown">
          <div className="user-dropdown-header">
            <div className="user-dropdown-name">{profile.username}</div>
            <div className="user-dropdown-role">{profile.role}</div>
          </div>
          <a
            href={`/profile/${profile.username}`}
            className="user-dropdown-item"
            onClick={(e) => { e.preventDefault(); setMenuOpen(false); router.push(`/profile/${profile.username}`); }}
          >
            My Profile
          </a>
          <a
            href={`/profile/${profile.username}?tab=articles`}
            className="user-dropdown-item"
            onClick={(e) => { e.preventDefault(); setMenuOpen(false); router.push(`/profile/${profile.username}?tab=articles`); }}
          >
            My Articles
          </a>
          <a
            href="/settings"
            className="user-dropdown-item"
            onClick={(e) => { e.preventDefault(); setMenuOpen(false); router.push('/settings'); }}
          >
            Settings
          </a>
          {(profile.role === 'admin' || profile.role === 'moderator') && (
            <a
              href="/admin"
              className="user-dropdown-item"
              onClick={(e) => { e.preventDefault(); setMenuOpen(false); router.push('/admin'); }}
            >
              Admin Panel
            </a>
          )}
          <div className="user-dropdown-divider" />
          <button
            className="user-dropdown-item user-dropdown-signout"
            onClick={handleSignOut}
          >
            Log Out
          </button>
        </div>
      )}
    </div>
  );
}
