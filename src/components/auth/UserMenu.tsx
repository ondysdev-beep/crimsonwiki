'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { LogOut, User, Shield, FileText, Settings } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types/database';

export function UserMenu({ user }: { user: Profile }) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.refresh();
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 p-1 rounded-lg hover:bg-dark-800 transition-colors"
      >
        {user.avatar_url ? (
          <Image
            src={user.avatar_url}
            alt={user.username}
            width={32}
            height={32}
            className="rounded-full"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-crimson-600 flex items-center justify-center text-white text-sm font-bold">
            {user.username.charAt(0).toUpperCase()}
          </div>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 bg-dark-800 border border-dark-700 rounded-lg shadow-xl py-1 z-50">
          <div className="px-4 py-3 border-b border-dark-700">
            <p className="text-sm font-medium text-dark-100">{user.username}</p>
            <p className="text-xs text-dark-400 capitalize">{user.role}</p>
          </div>

          <Link
            href={`/profile/${user.username}`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-dark-200 hover:bg-dark-700 transition-colors"
          >
            <User className="w-4 h-4" />
            My Profile
          </Link>

          <Link
            href={`/profile/${user.username}?tab=articles`}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-dark-200 hover:bg-dark-700 transition-colors"
          >
            <FileText className="w-4 h-4" />
            My Articles
          </Link>

          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2 px-4 py-2 text-sm text-dark-200 hover:bg-dark-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            Settings
          </Link>

          {(user.role === 'admin' || user.role === 'moderator') && (
            <Link
              href="/admin"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-4 py-2 text-sm text-dark-200 hover:bg-dark-700 transition-colors"
            >
              <Shield className="w-4 h-4" />
              Admin Panel
            </Link>
          )}

          <div className="border-t border-dark-700 mt-1">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 px-4 py-2 text-sm text-crimson-400 hover:bg-dark-700 transition-colors w-full text-left"
            >
              <LogOut className="w-4 h-4" />
              Log Out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
