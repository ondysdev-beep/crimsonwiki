'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Save, Trash2, X, Download, Upload, Copy, BarChart2, ChevronDown, ChevronRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import type { Category } from '@/lib/types/database';

interface CategoryWithStats extends Category {
  article_count?: number;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<CategoryWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: '', description: '', color: '#dc2626', parent_id: '' });
  const [viewMode, setViewMode] = useState<'list' | 'tree'>('list');
  const [collapsed, setCollapsed] = useState<Set<number>>(new Set());
  const [importError, setImportError] = useState('');
  const [importSuccess, setImportSuccess] = useState('');
  const [statsLoaded, setStatsLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAccess();
    fetchCategories();
  }, []);

  const checkAccess = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user || error) { router.push('/auth/login'); return; }
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const role = (data as { role: string } | null)?.role;
    if (role !== 'admin' && role !== 'moderator') router.push('/');
  };

  const fetchCategories = async () => {
    const { data: cats } = await supabase.from('categories').select('*').order('name');
    if (!cats) { setLoading(false); return; }

    const { data: artStats } = await supabase
      .from('articles')
      .select('category_id')
      .not('category_id', 'is', null);

    const countMap: Record<number, number> = {};
    if (artStats) {
      artStats.forEach((a: { category_id: number | null }) => {
        if (a.category_id) countMap[a.category_id] = (countMap[a.category_id] || 0) + 1;
      });
    }

    setCategories((cats as Category[]).map(c => ({ ...c, article_count: countMap[c.id] || 0 })));
    setStatsLoaded(true);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ name: '', slug: '', icon: '', description: '', color: '#dc2626', parent_id: '' });
    setShowNew(false);
    setEditId(null);
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({
      name: cat.name,
      slug: cat.slug,
      icon: cat.icon || '',
      description: cat.description || '',
      color: cat.color || '#dc2626',
      parent_id: cat.parent_id ? String(cat.parent_id) : '',
    });
    setShowNew(false);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) { alert('Name and slug are required.'); return; }
    const parentId = form.parent_id ? parseInt(form.parent_id) : null;
    if (editId) {
      await supabase.from('categories').update({
        name: form.name.trim(), slug: form.slug.trim(),
        icon: form.icon || null, description: form.description || null,
        color: form.color || null, parent_id: parentId,
      }).eq('id', editId);
    } else {
      await supabase.from('categories').insert({
        name: form.name.trim(), slug: form.slug.trim(),
        icon: form.icon || null, description: form.description || null,
        color: form.color || null, parent_id: parentId,
      });
    }
    resetForm();
    fetchCategories();
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"? Articles in this category will lose their category.`)) return;
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) {
      if (error.message.includes('referenced') || error.code === '23503') {
        alert(`Cannot delete "${name}" — it is still referenced by articles.\n\nFix: Run this SQL in Supabase SQL Editor:\n\nALTER TABLE public.articles DROP CONSTRAINT articles_category_id_fkey, ADD CONSTRAINT articles_category_id_fkey FOREIGN KEY (category_id) REFERENCES public.categories(id) ON DELETE SET NULL;`);
      } else {
        alert(`Failed to delete: ${error.message}`);
      }
      return;
    }
    fetchCategories();
  };

  const handleCopy = async (cat: CategoryWithStats) => {
    const newName = `${cat.name} (Copy)`;
    const newSlug = slugify(newName);
    await supabase.from('categories').insert({
      name: newName, slug: newSlug,
      icon: cat.icon || null, description: cat.description || null,
      color: cat.color || null, parent_id: cat.parent_id || null,
    });
    fetchCategories();
  };

  const handleExport = () => {
    const exportData = categories.map(({ article_count: _ac, ...c }) => c);
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `categories-export-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setImportError('');
    setImportSuccess('');
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!Array.isArray(parsed)) throw new Error('File must be a JSON array of categories.');
      let imported = 0;
      for (const cat of parsed) {
        if (!cat.name || !cat.slug) continue;
        const { error } = await supabase.from('categories').upsert({
          name: cat.name, slug: cat.slug,
          icon: cat.icon || null, description: cat.description || null,
          color: cat.color || null,
        }, { onConflict: 'slug' });
        if (!error) imported++;
      }
      setImportSuccess(`Imported ${imported} categories successfully.`);
      fetchCategories();
    } catch (err: unknown) {
      setImportError(err instanceof Error ? err.message : 'Import failed.');
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const toggleCollapse = (id: number) => {
    setCollapsed(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const topLevel = categories.filter(c => !c.parent_id);
  const getChildren = (id: number) => categories.filter(c => c.parent_id === id);

  const inputStyle = {
    width: '100%', height: '28px',
    background: 'var(--bg-2)', border: '1px solid var(--border-2)',
    color: 'var(--text-0)', fontSize: '12px', padding: '0 8px',
    outline: 'none', fontFamily: 'var(--ff)',
  };

  const btnSm = {
    padding: '2px 10px', fontSize: '11px',
    background: 'var(--bg-3)', border: '1px solid var(--border-2)',
    color: 'var(--text-1)', cursor: 'pointer', fontFamily: 'var(--ff)',
  };

  if (loading) {
    return <div className="settings-page"><div className="settings-loading">Loading...</div></div>;
  }

  const renderCatRow = (cat: CategoryWithStats, depth = 0) => {
    const children = getChildren(cat.id);
    const isCollapsed = collapsed.has(cat.id);
    return (
      <div key={cat.id}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          padding: '7px 12px', paddingLeft: `${12 + depth * 20}px`,
          border: '1px solid var(--border)', background: depth > 0 ? 'var(--bg-1)' : 'var(--bg-2)',
          marginBottom: '3px',
        }}>
          {children.length > 0 ? (
            <button type="button" onClick={() => toggleCollapse(cat.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: 0, lineHeight: 0, flexShrink: 0 }}>
              {isCollapsed ? <ChevronRight style={{ width: 13, height: 13 }} /> : <ChevronDown style={{ width: 13, height: 13 }} />}
            </button>
          ) : <span style={{ width: 13, flexShrink: 0 }} />}
          <span style={{ fontSize: '15px', flexShrink: 0, minWidth: '18px', textAlign: 'center' }}>{cat.icon}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-0)' }}>{cat.name}</div>
            <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>/category/{cat.slug}</div>
          </div>
          {statsLoaded && (
            <span style={{ fontSize: '11px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
              {cat.article_count} article{cat.article_count !== 1 ? 's' : ''}
            </span>
          )}
          <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color || '#dc2626', flexShrink: 0 }} />
          <button type="button" onClick={() => startEdit(cat)} style={btnSm}>Edit</button>
          <button type="button" onClick={() => handleCopy(cat)} title="Duplicate category" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: '2px', lineHeight: 0 }}>
            <Copy style={{ width: 13, height: 13 }} />
          </button>
          <button type="button" onClick={() => handleDelete(cat.id, cat.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: '2px', lineHeight: 0 }}>
            <Trash2 style={{ width: 13, height: 13 }} />
          </button>
        </div>
        {!isCollapsed && children.map(child => renderCatRow(child, depth + 1))}
      </div>
    );
  };

  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Manage Categories</div>
          <div className="page-hd-sub">
            <Link href="/admin" style={{ color: 'var(--link)' }}>← Admin</Link>
            &nbsp;· {categories.length} total
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
          {/* View toggle */}
          {(['list', 'tree'] as const).map(m => (
            <button key={m} type="button" onClick={() => setViewMode(m)} style={{
              padding: '3px 10px', fontSize: '11px', fontWeight: '600', cursor: 'pointer', fontFamily: 'var(--ff)',
              border: `1px solid ${viewMode === m ? 'rgba(155,32,32,0.4)' : 'var(--border-2)'}`,
              background: viewMode === m ? 'rgba(155,32,32,0.1)' : 'var(--bg-2)',
              color: viewMode === m ? 'var(--crimson-bright)' : 'var(--text-2)',
            }}>{m === 'list' ? 'List' : 'Tree'}</button>
          ))}
          {/* Export */}
          <button type="button" onClick={handleExport} style={{ ...btnSm, display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Download style={{ width: 12, height: 12 }} /> Export JSON
          </button>
          {/* Import */}
          <label style={{ ...btnSm, display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
            <Upload style={{ width: 12, height: 12 }} /> Import JSON
            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} style={{ display: 'none' }} />
          </label>
          {/* Add */}
          <button type="button" onClick={() => { resetForm(); setShowNew(true); }} className="btn-login"
            style={{ height: '26px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Plus style={{ width: 13, height: 13 }} /> Add Category
          </button>
        </div>
      </div>

      {/* IMPORT FEEDBACK */}
      {(importError || importSuccess) && (
        <div style={{ marginBottom: '12px', padding: '8px 12px', fontSize: '12px', background: importError ? 'rgba(155,32,32,0.1)' : 'rgba(51,204,119,0.1)', border: `1px solid ${importError ? 'rgba(155,32,32,0.3)' : 'rgba(51,204,119,0.3)'}`, color: importError ? 'var(--crimson-bright)' : '#33cc77' }}>
          {importError || importSuccess}
        </div>
      )}

      {/* STATS STRIP */}
      {statsLoaded && (
        <div className="stats-strip" style={{ marginBottom: '16px' }}>
          <div className="stat-cell"><span className="stat-num">{categories.length}</span><div className="stat-label">Total</div></div>
          <div className="stat-cell"><span className="stat-num">{topLevel.length}</span><div className="stat-label">Top-level</div></div>
          <div className="stat-cell"><span className="stat-num">{categories.filter(c => c.parent_id).length}</span><div className="stat-label">Subcategories</div></div>
          <div className="stat-cell"><span className="stat-num">{categories.reduce((s, c) => s + (c.article_count || 0), 0)}</span><div className="stat-label">Total articles</div></div>
          <div className="stat-cell"><span className="stat-num">{categories.filter(c => (c.article_count || 0) === 0).length}</span><div className="stat-label">Empty</div></div>
        </div>
      )}

      {/* NEW / EDIT FORM */}
      {(showNew || editId !== null) && (
        <div className="wiki-box" style={{ marginBottom: '16px' }}>
          <div className="wiki-box-hd" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{editId ? 'Edit Category' : 'New Category'}</span>
            <button type="button" onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', lineHeight: 0 }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
          <div className="wiki-box-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="settings-field" style={{ margin: 0 }}>
                <label className="settings-label">Name</label>
                <input value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, ...(editId ? {} : { slug: slugify(e.target.value) }) }))} style={inputStyle} placeholder="e.g. Bosses" className="settings-input" />
              </div>
              <div className="settings-field" style={{ margin: 0 }}>
                <label className="settings-label">Slug</label>
                <input value={form.slug} onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))} style={inputStyle} placeholder="e.g. bosses" className="settings-input" />
              </div>
              <div className="settings-field" style={{ margin: 0 }}>
                <label className="settings-label">Icon (letter or emoji)</label>
                <input value={form.icon} onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))} style={inputStyle} placeholder="e.g. B" className="settings-input" />
              </div>
              <div className="settings-field" style={{ margin: 0 }}>
                <label className="settings-label">Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="color" value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} style={{ width: 28, height: 28, padding: 0, border: '1px solid var(--border-2)', background: 'transparent', cursor: 'pointer' }} />
                  <input value={form.color} onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))} style={{ ...inputStyle, flex: 1, fontFamily: 'var(--ff-mono)', width: 'auto' }} className="settings-input" />
                </div>
              </div>
              <div className="settings-field" style={{ margin: 0 }}>
                <label className="settings-label">Parent Category (optional)</label>
                <select value={form.parent_id} onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))} style={{ ...inputStyle, height: '28px' }} className="settings-input">
                  <option value="">— None (top-level) —</option>
                  {categories.filter(c => !editId || c.id !== editId).map(c => (<option key={c.id} value={c.id}>{c.name}</option>))}
                </select>
              </div>
              <div className="settings-field" style={{ margin: 0, gridColumn: '1 / -1' }}>
                <label className="settings-label">Description</label>
                <input value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} style={inputStyle} placeholder="Short description..." className="settings-input" />
              </div>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button type="button" onClick={handleSave} className="btn-login" style={{ height: '26px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Save style={{ width: 13, height: 13 }} /> {editId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIST or TREE */}
      <div className="wiki-box">
        <div className="wiki-box-hd" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart2 style={{ width: 13, height: 13 }} />
          Categories ({categories.length})
        </div>
        <div className="wiki-box-body" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {viewMode === 'tree'
            ? topLevel.map(cat => renderCatRow(cat, 0))
            : categories.map((cat) => (
              <div key={cat.id} style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '7px 12px', border: '1px solid var(--border)', background: 'var(--bg-2)' }}>
                <span style={{ fontSize: '15px', flexShrink: 0, minWidth: '18px', textAlign: 'center' }}>{cat.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-0)' }}>
                    {cat.parent_id && <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>{categories.find(p => p.id === cat.parent_id)?.name} › </span>}
                    {cat.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>/category/{cat.slug}</div>
                </div>
                {statsLoaded && (
                  <span style={{ fontSize: '11px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
                    {cat.article_count} art.
                  </span>
                )}
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color || '#dc2626', flexShrink: 0 }} />
                <button type="button" onClick={() => startEdit(cat)} style={btnSm}>Edit</button>
                <button type="button" onClick={() => handleCopy(cat)} title="Duplicate" style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', padding: '2px', lineHeight: 0 }}>
                  <Copy style={{ width: 13, height: 13 }} />
                </button>
                <button type="button" onClick={() => handleDelete(cat.id, cat.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: '2px', lineHeight: 0 }}>
                  <Trash2 style={{ width: 13, height: 13 }} />
                </button>
              </div>
            ))
          }
          {categories.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-2)', fontSize: '12px' }}>No categories yet.</div>
          )}
        </div>
      </div>
    </>
  );
}
