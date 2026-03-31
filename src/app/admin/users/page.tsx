'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Shield, Search } from 'lucide-react';
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
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user || error) { router.push('/auth/login'); return; }
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
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
      <div className="settings-page">
        <div className="settings-loading">Loading...</div>
      </div>
    );
  }

  const roleColor = (role: string) => {
    if (role === 'admin') return { bg: 'rgba(155,32,32,0.12)', border: 'rgba(155,32,32,0.3)', color: 'var(--crimson-bright)' };
    if (role === 'moderator') return { bg: 'rgba(74,158,255,0.1)', border: 'rgba(74,158,255,0.25)', color: '#4a9eff' };
    if (role === 'editor') return { bg: 'rgba(51,204,119,0.1)', border: 'rgba(51,204,119,0.25)', color: '#33cc77' };
    return { bg: 'var(--bg-3)', border: 'var(--border)', color: 'var(--text-2)' };
  };

  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Manage Users</div>
          <div className="page-hd-sub">
            <Link href="/admin" style={{ color: 'var(--link)' }}>← Admin</Link>
            &nbsp;· {users.length} total
          </div>
        </div>
      </div>

      {/* SEARCH */}
      <div style={{ marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <Search style={{ width: 14, height: 14, color: 'var(--text-2)', flexShrink: 0 }} />
        <input
          type="text"
          placeholder="Search users..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1, maxWidth: '320px', height: '28px',
            background: 'var(--bg-2)', border: '1px solid var(--border-2)',
            color: 'var(--text-0)', fontSize: '12px', padding: '0 8px',
            outline: 'none', fontFamily: 'var(--ff)',
          }}
        />
      </div>

      {/* TABLE */}
      <div className="wiki-box">
        <div className="wiki-box-hd">Users ({filtered.length})</div>
        <table className="article-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Discord ID</th>
              <th>Role</th>
              <th>Joined</th>
              {myRole === 'admin' && <th>Change Role</th>}
            </tr>
          </thead>
          <tbody>
            {filtered.map((user) => {
              const rc = roleColor(user.role);
              return (
                <tr key={user.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {user.avatar_url ? (
                        <Image src={user.avatar_url} alt={user.username} width={24} height={24} style={{ borderRadius: '50%' }} />
                      ) : (
                        <div style={{
                          width: 24, height: 24, borderRadius: '50%',
                          background: 'var(--crimson)', display: 'flex',
                          alignItems: 'center', justifyContent: 'center',
                          color: '#fff', fontSize: '10px', fontWeight: '700', flexShrink: 0,
                        }}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <Link href={`/profile/${user.username}`} style={{ color: 'var(--text-0)', fontWeight: '600', fontSize: '12px' }}>{user.username}</Link>
                      {user.is_founder && <span style={{ color: 'var(--amber)', fontSize: '11px' }}>★</span>}
                    </div>
                  </td>
                  <td className="td-meta" style={{ fontFamily: 'var(--ff-mono)', fontSize: '11px' }}>
                    {user.discord_id || '—'}
                  </td>
                  <td>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                      fontSize: '11px', fontWeight: '600', padding: '2px 8px',
                      background: rc.bg, border: `1px solid ${rc.border}`, color: rc.color,
                    }}>
                      {user.role === 'admin' && <Shield style={{ width: 10, height: 10 }} />}
                      {user.role}
                    </span>
                  </td>
                  <td className="td-meta">{new Date(user.created_at).toLocaleDateString()}</td>
                  {myRole === 'admin' && (
                    <td>
                      <select
                        value={user.role}
                        onChange={(e) => updateRole(user.id, e.target.value)}
                        style={{
                          background: 'var(--bg-3)', border: '1px solid var(--border-2)',
                          color: 'var(--text-1)', fontSize: '11px', padding: '2px 6px',
                          fontFamily: 'var(--ff)', outline: 'none',
                        }}
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-2)', fontSize: '12px' }}>
            No users found.
          </div>
        )}
      </div>
    </>
  );
}
