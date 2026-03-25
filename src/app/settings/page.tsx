'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Upload } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import type { Profile } from '@/lib/types/database';

export default function SettingsPage() {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [twitterHandle, setTwitterHandle] = useState('');
  const [discordUsername, setDiscordUsername] = useState('');
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [themePreference, setThemePreference] = useState<'dark' | 'light'>('dark');
  const [languagePreference, setLanguagePreference] = useState('en');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [email, setEmail] = useState('');
  const [joinDate, setJoinDate] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteText, setDeleteText] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const load = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session?.user) {
          router.push('/auth/login');
          return;
        }

        setEmail(session.user.email || '');

        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (error) {
          console.error('Settings: profile fetch error', error.message);
          setMessage({ type: 'error', text: 'Failed to load profile: ' + error.message });
          setLoading(false);
          return;
        }

        if (data) {
          const p = data as Profile;
          setProfile(p);
          setUsername(p.username || '');
          setBio((p as Record<string, unknown>).bio as string || '');
          setWebsiteUrl((p as Record<string, unknown>).website_url as string || '');
          setTwitterHandle((p as Record<string, unknown>).twitter_handle as string || '');
          setDiscordUsername((p as Record<string, unknown>).discord_username as string || '');
          setEmailNotifications((p as Record<string, unknown>).email_notifications as boolean ?? true);
          setThemePreference(((p as Record<string, unknown>).theme_preference as string || 'dark') as 'dark' | 'light');
          setLanguagePreference((p as Record<string, unknown>).language_preference as string || 'en');
          setJoinDate(new Date(p.created_at).toLocaleDateString('en-US', {
            year: 'numeric', month: 'long', day: 'numeric',
          }));
        }
      } catch (err) {
        console.error('Settings: unexpected error', err);
        setMessage({ type: 'error', text: 'Something went wrong loading settings.' });
      }
      setLoading(false);
    };
    load();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !profile) return;
    setAvatarUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.url) {
        await supabase.from('profiles').update({ avatar_url: json.url }).eq('id', profile.id);
        setProfile({ ...profile, avatar_url: json.url });
      }
    } catch {
      setMessage({ type: 'error', text: 'Failed to upload avatar.' });
    }
    setAvatarUploading(false);
    if (avatarInputRef.current) avatarInputRef.current.value = '';
  };

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

    const updateData: Record<string, unknown> = {
      username: username.trim(),
    };
    // Only include extended fields if they exist on the profile (columns may not be added yet)
    if ('bio' in profile || bio) updateData.bio = bio.trim() || null;
    if ('website_url' in profile || websiteUrl) updateData.website_url = websiteUrl.trim() || null;
    if ('twitter_handle' in profile || twitterHandle) updateData.twitter_handle = twitterHandle.trim() || null;
    if ('discord_username' in profile || discordUsername) updateData.discord_username = discordUsername.trim() || null;
    if ('email_notifications' in profile) updateData.email_notifications = emailNotifications;
    if ('theme_preference' in profile) updateData.theme_preference = themePreference;
    if ('language_preference' in profile) updateData.language_preference = languagePreference;

    const { error } = await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', profile.id);

    if (error) {
      if (error.message.includes('unique') || error.code === '23505') {
        setMessage({ type: 'error', text: 'This username is already taken.' });
      } else {
        setMessage({ type: 'error', text: error.message });
      }
    } else {
      setProfile({
        ...profile,
        username: username.trim(),
        bio: bio.trim() || null,
        website_url: websiteUrl.trim() || null,
        twitter_handle: twitterHandle.trim() || null,
        discord_username: discordUsername.trim() || null,
        email_notifications: emailNotifications,
        theme_preference: themePreference,
        language_preference: languagePreference,
      });
      setMessage({ type: 'success', text: 'Settings saved successfully.' });
    }
    setSaving(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push('/');
    router.refresh();
  };

  const handleDeleteAccount = async () => {
    if (deleteText !== 'DELETE') return;
    setMessage({ type: 'error', text: 'Account deletion requires server-side admin action. Please contact an administrator.' });
    setShowDeleteConfirm(false);
    setDeleteText('');
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
              {profile.role} -- Joined {joinDate}
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
          <div className="settings-hint">3-30 characters. Must be unique.</div>
        </div>

        <div className="settings-field">
          <label className="settings-label">Bio / About me</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value.slice(0, 500))}
            rows={4}
            maxLength={500}
            placeholder="Tell the community about yourself..."
            className="settings-input"
            style={{ resize: 'vertical', minHeight: 80 }}
          />
          <div className="settings-hint">{bio.length}/500 characters</div>
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
          <div className="settings-hint" style={{ marginBottom: 8 }}>
            Your avatar is synced from Discord by default. You can upload a custom avatar below.
          </div>
          <button
            type="button"
            onClick={() => avatarInputRef.current?.click()}
            disabled={avatarUploading}
            className="settings-save-btn"
            style={{ maxWidth: 200 }}
          >
            <Upload className="w-4 h-4" style={{ display: 'inline', verticalAlign: 'middle', marginRight: 6 }} />
            {avatarUploading ? 'Uploading...' : 'Upload custom avatar'}
          </button>
          <input
            ref={avatarInputRef}
            type="file"
            accept="image/*"
            onChange={handleAvatarUpload}
            className="hidden"
            style={{ display: 'none' }}
          />
        </div>
      </div>

      {/* Social Links Card */}
      <div className="settings-card">
        <div className="settings-card-title">Social Links</div>

        <div className="settings-field">
          <label className="settings-label">Website URL</label>
          <input
            type="url"
            value={websiteUrl}
            onChange={(e) => setWebsiteUrl(e.target.value)}
            placeholder="https://yourwebsite.com"
            className="settings-input"
          />
        </div>

        <div className="settings-field">
          <label className="settings-label">Twitter / X</label>
          <input
            type="text"
            value={twitterHandle}
            onChange={(e) => setTwitterHandle(e.target.value)}
            placeholder="@username"
            className="settings-input"
          />
        </div>

        <div className="settings-field">
          <label className="settings-label">Discord Username</label>
          <input
            type="text"
            value={discordUsername}
            onChange={(e) => setDiscordUsername(e.target.value)}
            placeholder="username#0000"
            className="settings-input"
          />
        </div>
      </div>

      {/* Preferences Card */}
      <div className="settings-card">
        <div className="settings-card-title">Preferences</div>

        <div className="settings-field">
          <label className="settings-label">Email Notifications</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 4 }}>
            <button
              type="button"
              onClick={() => setEmailNotifications(!emailNotifications)}
              className="settings-toggle"
              style={{
                width: 44, height: 24, borderRadius: 12,
                background: emailNotifications ? 'var(--crimson-bright, #c42c2c)' : 'var(--surface, #1a1724)',
                border: '1px solid var(--border, #2a2035)',
                position: 'relative', cursor: 'pointer', transition: 'background 0.2s',
              }}
            >
              <span style={{
                display: 'block', width: 18, height: 18, borderRadius: '50%',
                background: '#fff', position: 'absolute', top: 2,
                left: emailNotifications ? 22 : 2, transition: 'left 0.2s',
              }} />
            </button>
            <span style={{ fontSize: 13, color: 'var(--text-muted, #7a7088)' }}>
              Notify me about new comments on my articles
            </span>
          </div>
        </div>

        <div className="settings-field">
          <label className="settings-label">Theme</label>
          <div style={{ display: 'flex', gap: 8, marginTop: 4 }}>
            {(['dark', 'light'] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setThemePreference(t)}
                className={themePreference === t ? 'settings-save-btn' : 'settings-signout-btn'}
                style={{ minWidth: 80, textTransform: 'capitalize' }}
              >
                {t}
              </button>
            ))}
          </div>
          <div className="settings-hint">Dark is the default theme.</div>
        </div>

        <div className="settings-field">
          <label className="settings-label">Language</label>
          <select
            value={languagePreference}
            onChange={(e) => setLanguagePreference(e.target.value)}
            className="settings-input"
          >
            <option value="en">English</option>
            <option value="cs">Cestina</option>
            <option value="de">Deutsch</option>
            <option value="es">Espanol</option>
            <option value="fr">Francais</option>
            <option value="ja">Japanese</option>
            <option value="ko">Korean</option>
            <option value="pt">Portugues</option>
            <option value="zh">Chinese</option>
          </select>
        </div>
      </div>

      {/* Save Button */}
      {message && (
        <div className={`settings-message ${message.type === 'error' ? 'settings-message-error' : 'settings-message-success'}`}>
          {message.text}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="settings-save-btn"
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

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
        <button onClick={handleSignOut} className="settings-signout-btn" style={{ marginBottom: 20 }}>
          Sign Out
        </button>

        <div style={{ borderTop: '1px solid var(--border, #2a2035)', paddingTop: 16 }}>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.6 }}>
            Permanently delete your account and all associated data. This action cannot be undone.
          </div>
          {!showDeleteConfirm ? (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              style={{
                padding: '8px 16px', fontSize: 13, fontWeight: 500,
                background: 'transparent', color: 'var(--crimson-bright, #c42c2c)',
                border: '1px solid var(--crimson-bright, #c42c2c)',
                borderRadius: 8, cursor: 'pointer',
              }}
            >
              Delete my account
            </button>
          ) : (
            <div>
              <div style={{ fontSize: 13, color: 'var(--crimson-bright)', marginBottom: 8 }}>
                Type DELETE to confirm:
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <input
                  type="text"
                  value={deleteText}
                  onChange={(e) => setDeleteText(e.target.value)}
                  placeholder="DELETE"
                  className="settings-input"
                  style={{ maxWidth: 200 }}
                />
                <button
                  onClick={handleDeleteAccount}
                  disabled={deleteText !== 'DELETE'}
                  style={{
                    padding: '8px 16px', fontSize: 13, fontWeight: 500,
                    background: deleteText === 'DELETE' ? 'var(--crimson-bright, #c42c2c)' : 'var(--surface)',
                    color: '#fff', border: 'none', borderRadius: 8, cursor: 'pointer',
                    opacity: deleteText === 'DELETE' ? 1 : 0.5,
                  }}
                >
                  Confirm Delete
                </button>
                <button
                  onClick={() => { setShowDeleteConfirm(false); setDeleteText(''); }}
                  className="settings-signout-btn"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
