'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Plus, Save, Trash2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import type { Category } from '@/lib/types/database';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: '', description: '', color: '#dc2626', parent_id: '' });
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
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data as Category[]);
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
    if (!form.name.trim() || !form.slug.trim()) {
      alert('Name and slug are required.');
      return;
    }

    const parentId = form.parent_id ? parseInt(form.parent_id) : null;
    if (editId) {
      await supabase.from('categories').update({
        name: form.name.trim(),
        slug: form.slug.trim(),
        icon: form.icon || null,
        description: form.description || null,
        color: form.color || null,
        parent_id: parentId,
      }).eq('id', editId);
    } else {
      await supabase.from('categories').insert({
        name: form.name.trim(),
        slug: form.slug.trim(),
        icon: form.icon || null,
        description: form.description || null,
        color: form.color || null,
        parent_id: parentId,
      });
    }
    resetForm();
    fetchCategories();
  };

  const handleDelete = async (id: number, name: string) => {
    if (!confirm(`Delete category "${name}"? Articles in this category will lose their category.`)) return;
    await supabase.from('categories').delete().eq('id', id);
    fetchCategories();
  };

  const inputStyle = {
    width: '100%', height: '28px',
    background: 'var(--bg-2)', border: '1px solid var(--border-2)',
    color: 'var(--text-0)', fontSize: '12px', padding: '0 8px',
    outline: 'none', fontFamily: 'var(--ff)',
  };

  if (loading) {
    return (
      <div className="settings-page">
        <div className="settings-loading">Loading...</div>
      </div>
    );
  }

  return (
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Manage Categories</div>
          <div className="page-hd-sub">
            <Link href="/admin" style={{ color: 'var(--link)' }}>← Admin</Link>
          </div>
        </div>
        <button
          type="button"
          onClick={() => { resetForm(); setShowNew(true); }}
          className="btn-login"
          style={{ height: '26px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
        >
          <Plus style={{ width: 13, height: 13 }} /> Add Category
        </button>
      </div>

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
                <input
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value, ...(editId ? {} : { slug: slugify(e.target.value) }) }))}
                  style={inputStyle}
                  placeholder="e.g. Bosses"
                  className="settings-input"
                />
              </div>
              <div className="settings-field" style={{ margin: 0 }}>
                <label className="settings-label">Slug</label>
                <input
                  value={form.slug}
                  onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                  style={inputStyle}
                  placeholder="e.g. bosses"
                  className="settings-input"
                />
              </div>
              <div className="settings-field" style={{ margin: 0 }}>
                <label className="settings-label">Icon (letter or emoji)</label>
                <input
                  value={form.icon}
                  onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                  style={inputStyle}
                  placeholder="e.g. B"
                  className="settings-input"
                />
              </div>
              <div className="settings-field" style={{ margin: 0 }}>
                <label className="settings-label">Color</label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="color"
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    style={{ width: 28, height: 28, padding: 0, border: '1px solid var(--border-2)', background: 'transparent', cursor: 'pointer' }}
                  />
                  <input
                    value={form.color}
                    onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                    style={{ ...inputStyle, flex: 1, fontFamily: 'var(--ff-mono)', width: 'auto' }}
                    className="settings-input"
                  />
                </div>
              </div>
              <div className="settings-field" style={{ margin: 0 }}>
                <label className="settings-label">Parent Category (optional)</label>
                <select
                  value={form.parent_id}
                  onChange={(e) => setForm((f) => ({ ...f, parent_id: e.target.value }))}
                  style={{ ...inputStyle, height: '28px' }}
                  className="settings-input"
                >
                  <option value="">— None (top-level) —</option>
                  {categories
                    .filter(c => !editId || c.id !== editId)
                    .map(c => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
              </div>
              <div className="settings-field" style={{ margin: 0, gridColumn: '1 / -1' }}>
                <label className="settings-label">Description</label>
                <input
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  style={inputStyle}
                  placeholder="Short description..."
                  className="settings-input"
                />
              </div>
            </div>
            <div style={{ marginTop: '12px', display: 'flex', justifyContent: 'flex-end' }}>
              <button
                type="button"
                onClick={handleSave}
                className="btn-login"
                style={{ height: '26px', padding: '0 12px', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Save style={{ width: 13, height: 13 }} /> {editId ? 'Update' : 'Create'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* LIST */}
      <div className="wiki-box">
        <div className="wiki-box-hd">Categories ({categories.length})</div>
        <div className="wiki-box-body" style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {categories.map((cat) => (
            <div
              key={cat.id}
              style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                padding: '8px 12px', border: '1px solid var(--border)', background: 'var(--bg-2)',
              }}
            >
              <span style={{ fontSize: '16px', flexShrink: 0, minWidth: '20px', textAlign: 'center' }}>{cat.icon}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '13px', fontWeight: '600', color: 'var(--text-0)' }}>
                  {cat.parent_id && <span style={{ color: 'var(--text-3)', fontWeight: 400 }}>{categories.find(p => p.id === cat.parent_id)?.name} › </span>}
                  {cat.name}
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-2)' }}>/category/{cat.slug}</div>
              </div>
              <div style={{ width: 12, height: 12, borderRadius: '50%', background: cat.color || '#dc2626', flexShrink: 0 }} />
              <button
                type="button"
                onClick={() => startEdit(cat)}
                style={{
                  padding: '2px 10px', fontSize: '11px',
                  background: 'var(--bg-3)', border: '1px solid var(--border-2)',
                  color: 'var(--text-1)', cursor: 'pointer', fontFamily: 'var(--ff)',
                }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={() => handleDelete(cat.id, cat.name)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--red)', padding: '2px', lineHeight: 0 }}
              >
                <Trash2 style={{ width: 14, height: 14 }} />
              </button>
            </div>
          ))}
          {categories.length === 0 && (
            <div style={{ textAlign: 'center', padding: '32px', color: 'var(--text-2)', fontSize: '12px' }}>
              No categories yet.
            </div>
          )}
        </div>
      </div>
    </>
  );
}
