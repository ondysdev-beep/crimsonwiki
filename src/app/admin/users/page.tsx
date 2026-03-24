'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { ArrowLeft, Shield, Search } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types/database';

const ROLES = ['viewer', 'editor', 'moderator', 'admin'] as const;

export default function AdminUsersPage() {
  const [users, setUsers] = useState<Profile[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [myRole, setMyRole] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAccess();
    fetchUsers();
  }, []);

  const checkAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login'); return; }
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    const role = (data as { role: string } | null)?.role;
    if (role !== 'admin' && role !== 'moderator') { router.push('/'); return; }
    setMyRole(role);
  };

  const fetchUsers = async () => {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });
    if (data) setUsers(data as Profile[]);
    setLoading(false);
  };

  const updateRole = async (userId: string, newRole: string) => {
    if (myRole !== 'admin') return;
    await supabase
      .from('profiles')
      .update({ role: newRole as Profile['role'] })
      .eq('id', userId);
    fetchUsers();
  };

  const filtered = users.filter((u) =>
    u.username.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dark-800 rounded w-48" />
          <div className="h-64 bg-dark-800 rounded" />
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-screen-xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link href="/admin" className="flex items-center gap-1 text-sm text-dark-400 hover:text-dark-200 transition-colors">
          <ArrowLeft className="w-4 h-4" /> Admin
        </Link>
        <h1 className="text-2xl font-bold text-dark-50">Manage Users</h1>
        <span className="text-sm text-dark-500">{users.length} total</span>
      </div>

      {/* Search */}
      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-dark-400" />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-crimson-500/50"
        />
      </div>

      {/* Table */}
      <div className="bg-dark-800/50 border border-dark-700 rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-dark-700 text-dark-400">
                <th className="text-left px-4 py-3 font-medium">User</th>
                <th className="text-left px-4 py-3 font-medium">Discord ID</th>
                <th className="text-left px-4 py-3 font-medium">Role</th>
                <th className="text-left px-4 py-3 font-medium">Joined</th>
                {myRole === 'admin' && (
                  <th className="text-left px-4 py-3 font-medium">Actions</th>
                )}
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-dark-700/50 hover:bg-dark-800/50">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {user.avatar_url ? (
                        <Image src={user.avatar_url} alt={user.username} width={28} height={28} className="rounded-full" />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-crimson-600 flex items-center justify-center text-white text-xs font-bold">
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <span className="text-dark-100 font-medium">{user.username}</span>
                      {user.is_founder && <span className="text-xs text-yellow-500">★</span>}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-dark-400 font-mono text-xs">{user.discord_id || '—'}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                      user.role === 'admin' ? 'bg-crimson-600/20 text-crimson-400' :
                      user.role === 'moderator' ? 'bg-blue-600/20 text-blue-400' :
                      user.role === 'editor' ? 'bg-green-600/20 text-green-400' :
                      'bg-dark-600/50 text-dark-400'
                    }`}>
                      {user.role === 'admin' && <Shield className="w-3 h-3" />}
                      {user.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-dark-500 text-xs">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  {myRole === 'admin' && (
                    <td className="px-4 py-3">
                      <select
                        value={user.role}
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        className="bg-dark-900 border border-dark-600 rounded px-2 py-1 text-xs text-dark-200 focus:outline-none focus:ring-1 focus:ring-crimson-500/50"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <p className="text-center text-dark-500 py-8 text-sm">No users found.</p>
        )}
      </div>
    </div>
  );
}
