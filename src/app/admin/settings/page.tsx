'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Save, CheckCircle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface SettingDef {
  key: string;
  label: string;
  description: string;
  type: 'text' | 'textarea' | 'toggle' | 'number';
}

const SETTING_DEFS: SettingDef[] = [
  { key: 'site_notice_enabled', label: 'Show notice banner', description: 'Toggle the yellow announcement banner on the homepage.', type: 'toggle' },
  { key: 'site_notice_text',    label: 'Notice banner text', description: 'Text shown in the yellow banner at the top of the homepage.', type: 'textarea' },
  { key: 'discord_url',         label: 'Discord invite URL', description: 'Full Discord invite link used in the footer and About page.', type: 'text' },
  { key: 'stats_min_articles',  label: 'Stats strip minimum articles', description: 'Minimum number of published articles required to show the stats strip on the homepage.', type: 'number' },
  { key: 'stub_threshold',      label: 'Stub word threshold', description: 'Articles with fewer words than this will show the stub banner.', type: 'number' },
  { key: 'footer_tagline',      label: 'Footer tagline', description: 'Short tagline shown in the site footer.', type: 'text' },
];

export default function AdminSettingsPage() {
  const [values, setValues] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savedKey, setSavedKey] = useState<string | null>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAccess();
    fetchSettings();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login'); return; }
    const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    const role = (data as { role: string } | null)?.role;
    if (role !== 'admin' && role !== 'moderator') router.push('/');
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('site_settings' as never).select('key, value');
    if (data) {
      const map: Record<string, string> = {};
      (data as { key: string; value: string }[]).forEach(r => { map[r.key] = r.value; });
      setValues(map);
    }
    setLoading(false);
  };

  const saveSetting = async (key: string, value: string) => {
    setSaving(true);
    await supabase.from('site_settings' as never).upsert({ key, value, updated_at: new Date().toISOString() } as never);
    setSaving(false);
    setSavedKey(key);
    setTimeout(() => setSavedKey(null), 2000);
  };

  const handleChange = (key: string, val: string) => {
    setValues(prev => ({ ...prev, [key]: val }));
  };

  if (loading) return <div style={{ color: 'var(--text-2)', fontSize: '13px', padding: '20px' }}>Loading…</div>;

  return (
    <>
      <div className="page-hd">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/admin" style={{ color: 'var(--text-2)', display: 'flex' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="page-hd-title">Site Settings</div>
            <div className="page-hd-sub">Configure global wiki behaviour</div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {SETTING_DEFS.map(def => {
          const val = values[def.key] ?? '';
          const isSaved = savedKey === def.key;
          return (
            <div key={def.key} className="wiki-box">
              <div className="wiki-box-hd" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{def.label}</span>
                {isSaved && (
                  <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--green, #33cc77)' }}>
                    <CheckCircle size={12} /> Saved
                  </span>
                )}
              </div>
              <div className="wiki-box-body" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <p style={{ fontSize: '11px', color: 'var(--text-2)', margin: 0 }}>{def.description}</p>

                {def.type === 'toggle' ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <button
                      onClick={() => {
                        const next = val === 'true' ? 'false' : 'true';
                        handleChange(def.key, next);
                        saveSetting(def.key, next);
                      }}
                      style={{
                        width: '40px', height: '22px', borderRadius: '11px', border: 'none', cursor: 'pointer',
                        background: val === 'true' ? 'var(--amber)' : 'var(--bg-3)',
                        position: 'relative', transition: 'background 0.2s',
                      }}
                    >
                      <span style={{
                        position: 'absolute', top: '3px',
                        left: val === 'true' ? '21px' : '3px',
                        width: '16px', height: '16px', borderRadius: '50%',
                        background: 'white', transition: 'left 0.2s',
                      }} />
                    </button>
                    <span style={{ fontSize: '12px', color: 'var(--text-1)' }}>{val === 'true' ? 'Enabled' : 'Disabled'}</span>
                  </div>
                ) : def.type === 'textarea' ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    <textarea
                      value={val}
                      onChange={e => handleChange(def.key, e.target.value)}
                      rows={3}
                      style={{ background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-0)', fontFamily: 'var(--ff)', fontSize: '12px', padding: '8px', resize: 'vertical', outline: 'none', width: '100%', boxSizing: 'border-box' }}
                    />
                    <button
                      onClick={() => saveSetting(def.key, val)}
                      disabled={saving}
                      style={{ alignSelf: 'flex-end', display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 14px', background: 'var(--amber-dim)', border: '1px solid var(--amber)', color: 'var(--text-0)', cursor: 'pointer', fontFamily: 'var(--ff)', fontSize: '12px' }}
                    >
                      <Save size={12} /> Save
                    </button>
                  </div>
                ) : (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <input
                      type={def.type === 'number' ? 'number' : 'text'}
                      value={val}
                      onChange={e => handleChange(def.key, e.target.value)}
                      style={{ flex: 1, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-0)', fontFamily: 'var(--ff)', fontSize: '12px', padding: '6px 10px', outline: 'none' }}
                    />
                    <button
                      onClick={() => saveSetting(def.key, val)}
                      disabled={saving}
                      style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '5px 14px', background: 'var(--amber-dim)', border: '1px solid var(--amber)', color: 'var(--text-0)', cursor: 'pointer', fontFamily: 'var(--ff)', fontSize: '12px', whiteSpace: 'nowrap' }}
                    >
                      <Save size={12} /> Save
                    </button>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
