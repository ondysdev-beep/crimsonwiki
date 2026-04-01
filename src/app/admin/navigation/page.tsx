'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Trash2, GripVertical, ChevronDown, ChevronRight, RotateCcw } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import type { NavSection, NavLink } from '@/lib/nav-config';
import { DEFAULT_NAV } from '@/lib/nav-config';

export default function AdminNavigationPage() {
  const router = useRouter();
  const supabase = createClient();

  const [sections, setSections] = useState<NavSection[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [expandedSection, setExpandedSection] = useState<string | null>(null);

  // New section form
  const [newSectionName, setNewSectionName] = useState('');

  // New link forms per section
  const [newLinks, setNewLinks] = useState<Record<string, { name: string; href: string }>>({});

  const fetchNav = useCallback(async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { router.push('/'); return; }

    const { data: profile } = await supabase
      .from('profiles').select('role').eq('id', user.id).single();
    if (!profile || !['admin', 'moderator'].includes(profile.role)) {
      router.push('/'); return;
    }

    const { data } = await supabase
      .from('site_settings').select('value').eq('key', 'nav_config').single();

    if (data?.value && Array.isArray(data.value)) {
      setSections(data.value as NavSection[]);
    } else {
      setSections(DEFAULT_NAV);
    }
    setLoading(false);
  }, [supabase, router]);

  useEffect(() => { fetchNav(); }, [fetchNav]);

  const saveNav = async (newSections: NavSection[]) => {
    setSaving(true);
    setSaved(false);
    await supabase.from('site_settings').upsert(
      { key: 'nav_config', value: JSON.stringify(newSections) },
      { onConflict: 'key' }
    );
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  // Section operations
  const addSection = () => {
    const name = newSectionName.trim();
    if (!name) return;
    if (sections.find(s => s.name === name)) { alert('Section with this name already exists.'); return; }
    const updated = [...sections, { name, links: [] }];
    setSections(updated);
    setNewSectionName('');
    setExpandedSection(name);
  };

  const deleteSection = (name: string) => {
    if (!confirm(`Delete section "${name}" and all its links?`)) return;
    setSections(prev => prev.filter(s => s.name !== name));
  };

  const renameSection = (oldName: string, newName: string) => {
    if (!newName.trim()) return;
    setSections(prev => prev.map(s => s.name === oldName ? { ...s, name: newName.trim() } : s));
  };

  const moveSectionUp = (idx: number) => {
    if (idx === 0) return;
    setSections(prev => {
      const arr = [...prev];
      [arr[idx - 1], arr[idx]] = [arr[idx], arr[idx - 1]];
      return arr;
    });
  };

  const moveSectionDown = (idx: number) => {
    setSections(prev => {
      if (idx === prev.length - 1) return prev;
      const arr = [...prev];
      [arr[idx], arr[idx + 1]] = [arr[idx + 1], arr[idx]];
      return arr;
    });
  };

  // Link operations
  const addLink = (sectionName: string) => {
    const form = newLinks[sectionName] || { name: '', href: '' };
    if (!form.name.trim() || !form.href.trim()) return;
    setSections(prev => prev.map(s => s.name === sectionName
      ? { ...s, links: [...s.links, { name: form.name.trim(), href: form.href.trim() }] }
      : s
    ));
    setNewLinks(prev => ({ ...prev, [sectionName]: { name: '', href: '' } }));
  };

  const deleteLink = (sectionName: string, href: string) => {
    setSections(prev => prev.map(s => s.name === sectionName
      ? { ...s, links: s.links.filter(l => l.href !== href) }
      : s
    ));
  };

  const moveLinkUp = (sectionName: string, idx: number) => {
    if (idx === 0) return;
    setSections(prev => prev.map(s => {
      if (s.name !== sectionName) return s;
      const links = [...s.links];
      [links[idx - 1], links[idx]] = [links[idx], links[idx - 1]];
      return { ...s, links };
    }));
  };

  const moveLinkDown = (sectionName: string, idx: number) => {
    setSections(prev => prev.map(s => {
      if (s.name !== sectionName) return s;
      if (idx === s.links.length - 1) return s;
      const links = [...s.links];
      [links[idx], links[idx + 1]] = [links[idx + 1], links[idx]];
      return { ...s, links };
    }));
  };

  const updateLink = (sectionName: string, idx: number, field: keyof NavLink, value: string) => {
    setSections(prev => prev.map(s => {
      if (s.name !== sectionName) return s;
      const links = s.links.map((l, i) => i === idx ? { ...l, [field]: value } : l);
      return { ...s, links };
    }));
  };

  const resetToDefault = () => {
    if (!confirm('Reset navigation to default? All custom changes will be lost.')) return;
    setSections(DEFAULT_NAV);
  };

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px', background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 6, color: 'var(--text-primary)', fontSize: 13, fontFamily: 'inherit', outline: 'none',
  };

  if (loading) {
    return <div className="settings-page"><div className="settings-loading">Loading...</div></div>;
  }

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '32px 16px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <div className="page-hd-title">Navigation Editor</div>
          <div style={{ fontSize: 13, color: 'var(--text-dim)', marginTop: 4 }}>
            Manage sidebar sections and links
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={resetToDefault}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>
            <RotateCcw style={{ width: 14, height: 14 }} /> Reset to default
          </button>
          <button onClick={() => saveNav(sections)} disabled={saving}
            style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 20px', background: saved ? '#22863a' : 'var(--crimson)', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.6 : 1, transition: 'background 0.3s' }}>
            {saved ? '✓ Saved' : saving ? 'Saving...' : 'Save changes'}
          </button>
        </div>
      </div>

      <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 20, padding: '10px 14px', background: 'rgba(74,158,255,0.07)', border: '1px solid rgba(74,158,255,0.2)', borderRadius: 8 }}>
        Changes are previewed immediately. Click <strong>Save changes</strong> to apply to the live sidebar.
        Use <strong>↑ ↓</strong> arrows to reorder. Changes take effect after the next page load.
      </div>

      {/* Sections list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 20 }}>
        {sections.map((section, sIdx) => (
          <div key={section.name} style={{ border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden', background: 'var(--surface)' }}>
            {/* Section header */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 14px', background: 'var(--bg-2)', cursor: 'pointer' }}
              onClick={() => setExpandedSection(expandedSection === section.name ? null : section.name)}>
              <GripVertical style={{ width: 14, height: 14, color: 'var(--text-dim)', flexShrink: 0 }} />
              <button onClick={(e) => { e.stopPropagation(); moveSectionUp(sIdx); }}
                disabled={sIdx === 0}
                style={{ background: 'none', border: 'none', color: sIdx === 0 ? 'var(--text-dim)' : 'var(--text-muted)', cursor: sIdx === 0 ? 'default' : 'pointer', padding: 2, lineHeight: 0, fontSize: 10 }}>▲</button>
              <button onClick={(e) => { e.stopPropagation(); moveSectionDown(sIdx); }}
                disabled={sIdx === sections.length - 1}
                style={{ background: 'none', border: 'none', color: sIdx === sections.length - 1 ? 'var(--text-dim)' : 'var(--text-muted)', cursor: sIdx === sections.length - 1 ? 'default' : 'pointer', padding: 2, lineHeight: 0, fontSize: 10 }}>▼</button>

              <input
                value={section.name}
                onChange={(e) => renameSection(section.name, e.target.value)}
                onClick={(e) => e.stopPropagation()}
                style={{ ...inputStyle, flex: 1, fontWeight: 600, fontSize: 14, background: 'transparent', border: '1px solid transparent' }}
                onFocus={(e) => { e.currentTarget.style.border = '1px solid var(--border)'; e.currentTarget.style.background = 'var(--surface)'; }}
                onBlur={(e) => { e.currentTarget.style.border = '1px solid transparent'; e.currentTarget.style.background = 'transparent'; }}
              />

              <span style={{ fontSize: 11, color: 'var(--text-dim)', marginLeft: 4 }}>{section.links.length} links</span>

              <button onClick={(e) => { e.stopPropagation(); deleteSection(section.name); }}
                style={{ background: 'none', border: 'none', color: '#e05555', cursor: 'pointer', padding: 4, lineHeight: 0 }}>
                <Trash2 style={{ width: 14, height: 14 }} />
              </button>
              <span style={{ color: 'var(--text-dim)', fontSize: 12 }}>
                {expandedSection === section.name ? <ChevronDown style={{ width: 14, height: 14 }} /> : <ChevronRight style={{ width: 14, height: 14 }} />}
              </span>
            </div>

            {/* Links */}
            {expandedSection === section.name && (
              <div style={{ padding: '10px 14px', display: 'flex', flexDirection: 'column', gap: 6 }}>
                {section.links.length === 0 && (
                  <div style={{ fontSize: 12, color: 'var(--text-dim)', padding: '8px 0' }}>No links yet. Add one below.</div>
                )}
                {section.links.map((link, lIdx) => (
                  <div key={`${link.href}-${lIdx}`} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
                      <button onClick={() => moveLinkUp(section.name, lIdx)} disabled={lIdx === 0}
                        style={{ background: 'none', border: 'none', color: lIdx === 0 ? 'var(--text-dim)' : 'var(--text-muted)', cursor: lIdx === 0 ? 'default' : 'pointer', padding: 0, lineHeight: 1, fontSize: 9 }}>▲</button>
                      <button onClick={() => moveLinkDown(section.name, lIdx)} disabled={lIdx === section.links.length - 1}
                        style={{ background: 'none', border: 'none', color: lIdx === section.links.length - 1 ? 'var(--text-dim)' : 'var(--text-muted)', cursor: lIdx === section.links.length - 1 ? 'default' : 'pointer', padding: 0, lineHeight: 1, fontSize: 9 }}>▼</button>
                    </div>
                    <input value={link.name} onChange={(e) => updateLink(section.name, lIdx, 'name', e.target.value)}
                      placeholder="Link name" style={{ ...inputStyle, width: 180 }} />
                    <input value={link.href} onChange={(e) => updateLink(section.name, lIdx, 'href', e.target.value)}
                      placeholder="/path or https://..." style={{ ...inputStyle, flex: 1 }} />
                    <button onClick={() => deleteLink(section.name, link.href)}
                      style={{ background: 'none', border: 'none', color: '#e05555', cursor: 'pointer', padding: 4, lineHeight: 0, flexShrink: 0 }}>
                      <Trash2 style={{ width: 14, height: 14 }} />
                    </button>
                  </div>
                ))}

                {/* Add link row */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
                  <Plus style={{ width: 14, height: 14, color: 'var(--text-dim)', flexShrink: 0 }} />
                  <input
                    value={newLinks[section.name]?.name || ''}
                    onChange={(e) => setNewLinks(prev => ({ ...prev, [section.name]: { ...prev[section.name], name: e.target.value } }))}
                    placeholder="Link name"
                    style={{ ...inputStyle, width: 180 }}
                    onKeyDown={(e) => { if (e.key === 'Enter') addLink(section.name); }}
                  />
                  <input
                    value={newLinks[section.name]?.href || ''}
                    onChange={(e) => setNewLinks(prev => ({ ...prev, [section.name]: { ...prev[section.name], href: e.target.value } }))}
                    placeholder="/path or https://..."
                    style={{ ...inputStyle, flex: 1 }}
                    onKeyDown={(e) => { if (e.key === 'Enter') addLink(section.name); }}
                  />
                  <button onClick={() => addLink(section.name)}
                    style={{ padding: '6px 12px', background: 'var(--crimson)', border: 'none', borderRadius: 6, fontSize: 12, color: '#fff', cursor: 'pointer', fontFamily: 'inherit', flexShrink: 0 }}>
                    Add
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Add section */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 14px', border: '1px dashed var(--border)', borderRadius: 10 }}>
        <Plus style={{ width: 16, height: 16, color: 'var(--text-dim)', flexShrink: 0 }} />
        <input value={newSectionName} onChange={(e) => setNewSectionName(e.target.value)}
          placeholder="New section name (e.g. Endgame)"
          style={{ ...inputStyle, flex: 1 }}
          onKeyDown={(e) => { if (e.key === 'Enter') addSection(); }}
        />
        <button onClick={addSection} disabled={!newSectionName.trim()}
          style={{ padding: '7px 16px', background: 'var(--crimson)', border: 'none', borderRadius: 6, fontSize: 13, fontWeight: 600, color: '#fff', cursor: newSectionName.trim() ? 'pointer' : 'not-allowed', fontFamily: 'inherit', opacity: newSectionName.trim() ? 1 : 0.5 }}>
          Add section
        </button>
      </div>

      <div style={{ marginTop: 16, textAlign: 'right' }}>
        <Link href="/admin" style={{ fontSize: 12, color: 'var(--link)' }}>← Back to Admin Panel</Link>
      </div>
    </div>
  );
}
