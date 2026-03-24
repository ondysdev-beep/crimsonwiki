'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types/database';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [email, setEmail] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        router.push('/auth/login');
        return;
      }

      setEmail(session.user.email || '');

      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();

      if (data) {
        const p = data as Profile;
        setProfile(p);
        setUsername(p.username);
        setJoinDate(new Date(p.created_at).toLocaleDateString('en-US', {
          year: 'numeric', month: 'long', day: 'numeric',
        }));
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleSave = async () => {
    if (!profile) return;
    if (!username.trim()) {
      setMessage({ type: 'error', text: 'Username cannot be empty.' });
      return;
    }
    if (username.length < 3) {
      setMessage({ type: 'error', text: 'Username must be at least 3 characters.' });
      return;
    }
    if (username.length > 30) {
      setMessage({ type: 'error', text: 'Username must be 30 characters or less.' });
      return;
    }

    setSaving(true);
    setMessage(null);

    const { error } = await supabase
      .from('profiles')
      .update({ username: username.trim() })
      .eq('id', profile.id);

    if (error) {
      if (error.message.includes('unique') || error.code === '23505') {
        setMessage({ type: 'error', text: 'This username is already taken.' });
      } else {
        setMessage({ type: 'error', text: error.message });
      }
    } else {
      setProfile({ ...profile, username: username.trim() });
      setMessage({ type: 'success', text: 'Profile updated successfully.' });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">Loading settings...</div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="settings-page page-enter">
      <div className="settings-header">
        <div className="section-title">Account Settings</div>
      </div>

      {/* Profile Card */}
      <div className="settings-card">
        <div className="settings-card-title">Profile</div>
        <div className="settings-profile-row">
          <div className="settings-avatar">
            {profile.avatar_url ? (
              <Image
                src={profile.avatar_url}
                alt={profile.username}
                width={64}
                height={64}
                className="settings-avatar-img"
              />
            ) : (
              <span className="settings-avatar-fallback">
                {profile.username.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="settings-profile-info">
            <div className="settings-profile-name">{profile.username}</div>
            <div className="settings-profile-meta">
              {profile.role} · Joined {joinDate}
              {profile.is_founder && <span className="founder-badge">Founder</span>}
            </div>
          </div>
        </div>

        <div className="settings-field">
          <label className="settings-label">Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="settings-input"
            maxLength={30}
          />
          <div className="settings-hint">3–30 characters. Must be unique.</div>
        </div>

        <div className="settings-field">
          <label className="settings-label">Email</label>
          <input
            type="text"
            value={email}
            disabled
            className="settings-input settings-input-disabled"
          />
          <div className="settings-hint">Managed by Discord. Cannot be changed here.</div>
        </div>

        <div className="settings-field">
          <label className="settings-label">Avatar</label>
          <div className="settings-hint">Your avatar is synced from Discord. To change it, update your Discord profile picture.</div>
        </div>

        {message && (
          <div className={`settings-message ${message.type === 'error' ? 'settings-message-error' : 'settings-message-success'}`}>
            {message.text}
          </div>
        )}

        <button
          onClick={handleSave}
          disabled={saving || username === profile.username}
          className="settings-save-btn"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Account Info Card */}
      <div className="settings-card">
        <div className="settings-card-title">Account</div>
        <div className="settings-info-grid">
          <div className="settings-info-item">
            <div className="settings-info-label">User ID</div>
            <div className="settings-info-value">{profile.id.slice(0, 8)}...</div>
          </div>
          <div className="settings-info-item">
            <div className="settings-info-label">Role</div>
            <div className="settings-info-value" style={{ textTransform: 'capitalize' }}>{profile.role}</div>
          </div>
          <div className="settings-info-item">
            <div className="settings-info-label">Discord ID</div>
            <div className="settings-info-value">{profile.discord_id || 'N/A'}</div>
          </div>
          <div className="settings-info-item">
            <div className="settings-info-label">Member Since</div>
            <div className="settings-info-value">{joinDate}</div>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="settings-card settings-danger-card">
        <div className="settings-card-title" style={{ color: 'var(--crimson-bright)' }}>Danger Zone</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16, lineHeight: 1.6 }}>
          Sign out of your account on this device.
        </div>
        <button onClick={handleSignOut} className="settings-signout-btn">
          Sign Out
        </button>
      </div>
    </div>
  );
}
