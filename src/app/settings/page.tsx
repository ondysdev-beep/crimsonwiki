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
    <div className="settings-page">
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Account Settings</div>
          <div className="page-hd-sub">Manage your profile and preferences</div>
        </div>
      </div>

      {/* PROFILE SECTION */}
      <div className="wiki-box">
        <div className="wiki-box-hd">Profile</div>
        <div className="wiki-box-body">
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
            <div>
              <div className="settings-profile-name">{profile.username}</div>
              <div className="settings-profile-meta">
                {profile.role} -- Joined {joinDate}
                {profile.is_founder && <span className="founder-tag">founder</span>}
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
              style={{ resize: 'vertical', minHeight: '80px' }}
            />
            <div className="settings-hint">{bio.length}/500 characters</div>
          </div>

          <div className="settings-field">
            <label className="settings-label">Email</label>
            <input
              type="text"
              value={email}
              disabled
              className="settings-input"
              style={{ opacity: '0.5', cursor: 'not-allowed' }}
            />
            <div className="settings-hint">Managed by Discord. Cannot be changed here.</div>
          </div>

          <div className="settings-field">
            <label className="settings-label">Avatar</label>
            <div className="settings-hint" style={{ marginBottom: '8px' }}>
              Your avatar is synced from Discord by default. You can upload a custom avatar below.
            </div>
            <button
              type="button"
              onClick={() => avatarInputRef.current?.click()}
              disabled={avatarUploading}
              className="btn-login"
              style={{ maxWidth: '200px', height: '28px' }}
            >
              <Upload className="w-4 h-4" style={{ display: 'inline', verticalAlign: 'middle', marginRight: '6px' }} />
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
      </div>

      {/* SOCIAL LINKS SECTION */}
      <div className="wiki-box">
        <div className="wiki-box-hd">Social Links</div>
        <div className="wiki-box-body">
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
      </div>

      {/* PREFERENCES SECTION */}
      <div className="wiki-box">
        <div className="wiki-box-hd">Preferences</div>
        <div className="wiki-box-body">
          <div className="settings-field">
            <label className="settings-label">Email Notifications</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '4px' }}>
              <button
                type="button"
                onClick={() => setEmailNotifications(!emailNotifications)}
                style={{
                  width: '44px',
                  height: '24px',
                  background: emailNotifications ? 'var(--amber)' : 'var(--bg-3)',
                  border: '1px solid var(--border)',
                  position: 'relative',
                  cursor: 'pointer',
                  transition: 'background 0.1s',
                }}
              >
                <span style={{
                  display: 'block',
                  width: '18px',
                  height: '18px',
                  background: 'var(--text-0)',
                  position: 'absolute',
                  top: '2px',
                  left: emailNotifications ? '22px' : '2px',
                  transition: 'left 0.1s',
                }} />
              </button>
              <span style={{ fontSize: '13px', color: 'var(--text-1)' }}>
                Notify me about new comments on my articles
              </span>
            </div>
          </div>

          <div className="settings-field">
            <label className="settings-label">Theme</label>
            <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
              {(['dark', 'light'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setThemePreference(t)}
                  className={themePreference === t ? 'btn-login' : 'btn-login'}
                  style={{
                    background: themePreference === t ? 'var(--amber)' : 'transparent',
                    borderColor: themePreference === t ? 'var(--amber)' : 'var(--border-2)',
                    color: themePreference === t ? 'var(--bg-0)' : 'var(--text-1)',
                    minWidth: '80px',
                    textTransform: 'capitalize',
                    height: '28px'
                  }}
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
              <option value="cs">Čeština</option>
              <option value="de">Deutsch</option>
              <option value="es">Español</option>
              <option value="fr">Français</option>
              <option value="ja">日本語</option>
              <option value="ko">한국어</option>
              <option value="pt">Português</option>
              <option value="zh">中文</option>
            </select>
          </div>
        </div>
      </div>

      {/* SAVE BUTTON */}
      {message && (
        <div style={{
          padding: '10px 14px',
          margin: '0 0 16px 0',
          border: message.type === 'error' ? '1px solid var(--red)' : '1px solid var(--green)',
          background: message.type === 'error' ? 'rgba(192,64,64,0.07)' : 'rgba(64,168,96,0.07)',
          color: message.type === 'error' ? 'var(--red-bright)' : 'var(--green-bright)',
          fontSize: '13px'
        }}>
          {message.text}
        </div>
      )}

      <button
        onClick={handleSave}
        disabled={saving}
        className="btn-login"
        style={{ height: '28px', padding: '0 16px', marginBottom: '20px' }}
      >
        {saving ? 'Saving...' : 'Save Changes'}
      </button>

      {/* ACCOUNT INFO SECTION */}
      <div className="wiki-box">
        <div className="wiki-box-hd">Account Information</div>
        <div className="wiki-box-body">
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <tbody>
              {[
                ['User ID', profile.id.slice(0, 8) + '...'],
                ['Role', profile.role],
                ['Discord ID', profile.discord_id || 'N/A'],
                ['Member Since', joinDate],
              ].map(([label, value]) => (
                <tr key={label}>
                  <td style={{
                    width: '120px',
                    padding: '4px 8px',
                    background: 'var(--bg-2)',
                    border: '1px solid var(--border)',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: 'var(--text-2)'
                  }}>
                    {label}
                  </td>
                  <td style={{
                    padding: '4px 8px',
                    border: '1px solid var(--border)',
                    fontSize: '11px',
                    fontFamily: 'var(--ff-mono)',
                    color: 'var(--text-1)'
                  }}>
                    {value}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* DANGER ZONE */}
      <div className="wiki-box" style={{ borderLeft: '3px solid var(--red-bright)' }}>
        <div className="wiki-box-hd" style={{ color: 'var(--red-bright)' }}>Danger Zone</div>
        <div className="wiki-box-body">
          <div style={{ fontSize: '13px', color: 'var(--text-1)', marginBottom: '16px', lineHeight: '1.6' }}>
            Sign out of your account on this device.
          </div>
          <button
            onClick={handleSignOut}
            className="btn-login"
            style={{
              background: 'transparent',
              borderColor: 'var(--border-2)',
              color: 'var(--text-1)',
              marginBottom: '20px'
            }}
          >
            Sign Out
          </button>

          <div style={{ borderTop: '1px solid var(--border)', paddingTop: '16px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-1)', marginBottom: '12px', lineHeight: '1.6' }}>
              Permanently delete your account and all associated data. This action cannot be undone.
            </div>
            {!showDeleteConfirm ? (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="btn-login"
                style={{
                  background: 'transparent',
                  borderColor: 'var(--red-bright)',
                  color: 'var(--red-bright)',
                }}
              >
                Delete my account
              </button>
            ) : (
              <div>
                <div style={{ fontSize: '13px', color: 'var(--red-bright)', marginBottom: '8px' }}>
                  Type DELETE to confirm:
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input
                    type="text"
                    value={deleteText}
                    onChange={(e) => setDeleteText(e.target.value)}
                    placeholder="DELETE"
                    className="settings-input"
                    style={{ maxWidth: '200px' }}
                  />
                  <button
                    onClick={handleDeleteAccount}
                    disabled={deleteText !== 'DELETE'}
                    className="btn-login"
                    style={{
                      background: deleteText === 'DELETE' ? 'var(--red-bright)' : 'transparent',
                      borderColor: deleteText === 'DELETE' ? 'var(--red-bright)' : 'var(--border-2)',
                      color: deleteText === 'DELETE' ? 'var(--bg-0)' : 'var(--text-1)',
                      opacity: deleteText === 'DELETE' ? 1 : 0.5,
                    }}
                  >
                    Confirm Delete
                  </button>
                  <button
                    onClick={() => { setShowDeleteConfirm(false); setDeleteText(''); }}
                    className="btn-login"
                    style={{ background: 'transparent', borderColor: 'var(--border-2)', color: 'var(--text-1)' }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
