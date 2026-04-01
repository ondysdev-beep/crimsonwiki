'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Save, Trash2, X, FolderTree, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import type { Category } from '@/lib/types/database';

interface SubcatWithStats extends Category {
  article_count: number;
}

export default function AdminSubcategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [subcats, setSubcats] = useState<SubcatWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: '', description: '', color: '#4a9eff', parent_id: '' });
  const [bulkSelected, setBulkSelected] = useState<Set<number>>(new Set());
  const [bulkTarget, setBulkTarget] = useState('');
  const [mergeFrom, setMergeFrom] = useState('');
  const [mergeTo, setMergeTo] = useState('');
  const [mergeError, setMergeError] = useState('');
  const [mergeSuccess, setMergeSuccess] = useState('');
  const [filterParent, setFilterParent] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAccess();
    fetchData();
  }, []);

  const checkAccess = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user || error) { router.push('/auth/login'); return; }
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const role = (data as { role: string } | null)?.role;
    if (role !== 'admin' && role !== 'moderator') router.push('/');
  };

  const fetchData = async () => {
    const { data: cats } = await supabase.from('categories').select('*').order('name');
    if (!cats) { setLoading(false); return; }
    const allCats = cats as Category[];
    setCategories(allCats);

    const subOnly = allCats.filter(c => c.parent_id !== null);

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

    setSubcats(subOnly.map(c => ({ ...c, article_count: countMap[c.id] || 0 })));
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ name: '', slug: '', icon: '', description: '', color: '#4a9eff', parent_id: '' });
    setShowNew(false);
    setEditId(null);
  };

  const startEdit = (cat: Category) => {
    setEditId(cat.id);
    setForm({
      name: cat.name, slug: cat.slug,
      icon: cat.icon || '', description: cat.description || '',
      color: cat.color || '#4a9eff',
      parent_id: cat.parent_id ? String(cat.parent_id) : '',
    });
    setShowNew(false);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) { alert('Name and slug are required.'); return; }
    if (!form.parent_id) { alert('A parent category is required for subcategories.'); return; }
    const parentId = parseInt(form.parent_id);
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
    fetchData();
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete subcategory "${name}"? Articles in it will lose their category.`)) return;
    await supabase.from('categories').delete().eq('id', id);
    fetchData();
  };

  const toggleSelect = (id: number) => {
    setBulkSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const handleBulkMove = async () => {
    if (bulkSelected.size === 0 || !bulkTarget) { alert('Select subcategories and a target parent.'); return; }
    const targetId = parseInt(bulkTarget);
    for (const id of Array.from(bulkSelected)) {
      await supabase.from('categories').update({ parent_id: targetId }).eq('id', id);
    }
    setBulkSelected(new Set());
    setBulkTarget('');
    fetchData();
  };

  const handleBulkDelete = async () => {
    if (bulkSelected.size === 0) return;
    if (!confirm(`Delete ${bulkSelected.size} selected subcategories? Articles will lose their category.`)) return;
    for (const id of Array.from(bulkSelected)) {
      await supabase.from('categories').delete().eq('id', id);
    }
    setBulkSelected(new Set());
    fetchData();
  };

  const handleMerge = async () => {
    setMergeError('');
    setMergeSuccess('');
    if (!mergeFrom || !mergeTo) { setMergeError('Select both subcategories.'); return; }
    if (mergeFrom === mergeTo) { setMergeError('Cannot merge a subcategory with itself.'); return; }
    const fromId = parseInt(mergeFrom);
    const toId = parseInt(mergeTo);
    const { error } = await supabase
      .from('articles')
      .update({ category_id: toId })
      .eq('category_id', fromId);
    if (error) { setMergeError(error.message); return; }
    await supabase.from('categories').delete().eq('id', fromId);
    setMergeSuccess(`Merged successfully. All articles moved to target subcategory.`);
    setMergeFrom('');
    setMergeTo('');
    fetchData();
  };

  const topLevelCats = categories.filter(c => !c.parent_id);
  const filtered = filterParent
    ? subcats.filter(s => String(s.parent_id) === filterParent)
    : subcats;

  const inputStyle = {
    width: '100%', height: '28px',
    background: 'var(--bg-2)', border: '1px solid var(--border-2)',
    color: 'var(--text-0)', fontSize: '12px', padding: '0 8px',
    outline: 'none', fontFamily: 'var(--ff)',
  };

  if (loading) return <div className="settings-page"><div className="settings-loading">Loading...</div></div>;

  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Manage Subcategories</div>
          <div className="page-hd-sub">
            <Link href="/admin" style={{ color: 'var(--link)' }}>← Admin</Link>
            &nbsp;·&nbsp;
            <Link href="/admin/categories" style={{ color: 'var(--link)' }}>Categories</Link>
            &nbsp;· {subcats.length} subcategories total
          </div>
        </div>
        <button type="button" onClick={() => { resetForm(); setShowNew(true); }} className="btn-login"
          style={{ height: '26px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
          <Plus style={{ width: 13, height: 13 }} /> Add Subcategory
        </button>
      </div>

      {/* STATS */}
      <div className="stats-strip" style={{ marginBottom: '16px' }}>
        <div className="stat-cell"><span className="stat-num">{subcats.length}</span><div className="stat-label">Subcategories</div></div>
        <div className="stat-cell"><span className="stat-num">{topLevelCats.length}</span><div className="stat-label">Parent cats</div></div>
        <div className="stat-cell"><span className="stat-num">{subcats.reduce((s, c) => s + c.article_count, 0)}</span><div className="stat-label">Articles</div></div>
        <div className="stat-cell"><span className="stat-num">{subcats.filter(c => c.article_count === 0).length}</span><div className="stat-label">Empty</div></div>
      </div>

      {/* NEW / EDIT FORM */}
      {(showNew || editId !== null) && (
        <div className="wiki-box" style={{ marginBottom: '16px' }}>
          <div className="wiki-box-hd" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span>{editId ? 'Edit Subcategory' : 'New Subcategory'}</span>
            <button type="button" onClick={resetForm} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', lineHeight: 0 }}>
              <X style={{ width: 14, height: 14 }} />
            </button>
          </div>
          <div className="wiki-box-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div className="settings-field" style={{ margin: 0 }}>
                <label className="settings-label">Name</label>
                <input value={form.name} onChange={(e) => setForm(f => ({ ...f, name: e.target.value, ...(editId ? {} : { slug: slugify(e.target.value) }) }))} style={inputStyle} placeholder="e.g. Field Bosses" className="settings-input" />
              </div>
              <div className="settings-field" style={{ margin: 0 }}>
                <label className="settings-label">Slug</label>
                <input value={form.slug} onChange={(e) => setForm(f => ({ ...f, slug: e.target.value }))} style={inputStyle} placeholder="e.g. field-bosses" className="settings-input" />
              </div>
              <div className="settings-field" style={{ margin: 0 }}>
                <label className="settings-label">Parent Category *</label>
                <select value={form.parent_id} onChange={(e) => setForm(f => ({ ...f, parent_id: e.target.value }))} style={{ ...inputStyle, height: '28px' }} className="settings-input">
                  <option value="">— Select parent —</option>
                  {topLevelCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="settings-field" style={{ margin: 0 }}>
                <label className="settings-label">Icon (letter or emoji)</label>
                <input value={form.icon} onChange={(e) => setForm(f => ({ ...f, icon: e.target.value }))} style={inputStyle} placeholder="e.g. ⚔" className="settings-input" />
              </div>
              <div className="settings-field" style={{ margin: 0 }}>
                <label className="settings-label">Color</label>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input type="color" value={form.color} onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))} style={{ width: 28, height: 28, padding: 0, border: '1px solid var(--border-2)', background: 'transparent', cursor: 'pointer' }} />
                  <input value={form.color} onChange={(e) => setForm(f => ({ ...f, color: e.target.value }))} style={{ ...inputStyle, flex: 1, width: 'auto', fontFamily: 'var(--ff-mono)' }} className="settings-input" />
                </div>
              </div>
              <div className="settings-field" style={{ margin: 0 }}>
                <label className="settings-label">Description</label>
                <input value={form.description} onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))} style={inputStyle} placeholder="Short description..." className="settings-input" />
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

      {/* BULK ACTIONS */}
      {bulkSelected.size > 0 && (
        <div className="wiki-box" style={{ marginBottom: '12px', border: '1px solid rgba(74,158,255,0.3)', background: 'rgba(74,158,255,0.05)' }}>
          <div className="wiki-box-hd" style={{ color: '#4a9eff' }}>{bulkSelected.size} selected</div>
          <div className="wiki-box-body" style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={bulkTarget} onChange={e => setBulkTarget(e.target.value)} style={{ ...inputStyle, width: 'auto', flex: 1, minWidth: '180px', height: '28px' }}>
              <option value="">— Move to parent… —</option>
              {topLevelCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <button type="button" onClick={handleBulkMove} className="btn-login" style={{ height: '26px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ArrowRight style={{ width: 12, height: 12 }} /> Move
            </button>
            <button type="button" onClick={handleBulkDelete} style={{ height: '26px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '4px', background: 'rgba(155,32,32,0.1)', border: '1px solid rgba(155,32,32,0.3)', color: 'var(--crimson-bright)', cursor: 'pointer', fontFamily: 'var(--ff)', fontSize: '12px' }}>
              <Trash2 style={{ width: 12, height: 12 }} /> Delete selected
            </button>
            <button type="button" onClick={() => setBulkSelected(new Set())} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-2)', fontSize: '12px', fontFamily: 'var(--ff)' }}>
              Clear
            </button>
          </div>
        </div>
      )}

      {/* MERGE TOOL */}
      <div className="wiki-box" style={{ marginBottom: '16px' }}>
        <div className="wiki-box-hd" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <FolderTree style={{ width: 13, height: 13 }} /> Merge Subcategories
        </div>
        <div className="wiki-box-body">
          <p style={{ fontSize: '11px', color: 'var(--text-2)', marginBottom: '10px' }}>
            Move all articles from one subcategory into another, then delete the source.
          </p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <select value={mergeFrom} onChange={e => setMergeFrom(e.target.value)} style={{ ...inputStyle, width: 'auto', flex: 1, minWidth: '180px', height: '28px' }}>
              <option value="">— Source subcategory —</option>
              {subcats.map(c => <option key={c.id} value={c.id}>{categories.find(p => p.id === c.parent_id)?.name} › {c.name} ({c.article_count})</option>)}
            </select>
            <ArrowRight style={{ width: 14, height: 14, color: 'var(--text-3)', flexShrink: 0 }} />
            <select value={mergeTo} onChange={e => setMergeTo(e.target.value)} style={{ ...inputStyle, width: 'auto', flex: 1, minWidth: '180px', height: '28px' }}>
              <option value="">— Target subcategory —</option>
              {subcats.filter(c => String(c.id) !== mergeFrom).map(c => <option key={c.id} value={c.id}>{categories.find(p => p.id === c.parent_id)?.name} › {c.name}</option>)}
            </select>
            <button type="button" onClick={handleMerge} style={{ height: '26px', padding: '0 12px', background: 'rgba(200,130,10,0.1)', border: '1px solid rgba(200,130,10,0.3)', color: 'var(--amber)', cursor: 'pointer', fontFamily: 'var(--ff)', fontSize: '12px' }}>
              Merge &amp; Delete Source
            </button>
          </div>
          {mergeError && <p style={{ marginTop: '8px', fontSize: '11px', color: 'var(--crimson-bright)' }}>{mergeError}</p>}
          {mergeSuccess && <p style={{ marginTop: '8px', fontSize: '11px', color: '#33cc77' }}>{mergeSuccess}</p>}
        </div>
      </div>

      {/* FILTER + LIST */}
      <div className="wiki-box">
        <div className="wiki-box-hd" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <span>Subcategories ({filtered.length})</span>
          <select value={filterParent} onChange={e => setFilterParent(e.target.value)} style={{ ...inputStyle, width: 'auto', minWidth: '160px', height: '24px', fontSize: '11px' }}>
            <option value="">All parents</option>
            {topLevelCats.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
        <div className="wiki-box-body" style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
          {filtered.map(cat => {
            const parent = categories.find(p => p.id === cat.parent_id);
            const isSelected = bulkSelected.has(cat.id);
            return (
              <div key={cat.id} style={{
                display: 'flex', alignItems: 'center', gap: '10px',
                padding: '7px 12px', border: `1px solid ${isSelected ? 'rgba(74,158,255,0.4)' : 'var(--border)'}`,
                background: isSelected ? 'rgba(74,158,255,0.06)' : 'var(--bg-2)',
              }}>
                <input type="checkbox" checked={isSelected} onChange={() => toggleSelect(cat.id)}
                  style={{ width: 13, height: 13, cursor: 'pointer', flexShrink: 0, accentColor: '#4a9eff' }} />
                <span style={{ fontSize: '15px', flexShrink: 0, minWidth: '18px', textAlign: 'center' }}>{cat.icon}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-0)' }}>
                    <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>{parent?.name} › </span>
                    {cat.name}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>/category/{cat.slug}</div>
                </div>
                <span style={{ fontSize: '11px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>
                  {cat.article_count} article{cat.article_count !== 1 ? 's' : ''}
                </span>
                <div style={{ width: 10, height: 10, borderRadius: '50%', background: cat.color || '#4a9eff', flexShrink: 0 }} />
                <button type="button" onClick={() => startEdit(cat)} style={{ padding: '2px 10px', fontSize: '11px', background: 'var(--bg-3)', border: '1px solid var(--border-2)', color: 'var(--text-1)', cursor: 'pointer', fontFamily: 'var(--ff)' }}>Edit</button>
                <button type="button" onClick={() => handleDelete(cat.id, cat.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: '2px', lineHeight: 0 }}>
                  <Trash2 style={{ width: 13, height: 13 }} />
                </button>
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-2)', fontSize: '12px' }}>
              {filterParent ? 'No subcategories under this parent.' : 'No subcategories yet.'}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
