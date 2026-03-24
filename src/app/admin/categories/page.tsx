'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Save, Trash2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { slugify } from '@/lib/utils';
import type { Category } from '@/lib/types/database';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNew, setShowNew] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ name: '', slug: '', icon: '', description: '', color: '#dc2626' });
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAccess();
    fetchCategories();
  }, []);

  const checkAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login'); return; }
    const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    const role = (data as { role: string } | null)?.role;
    if (role !== 'admin' && role !== 'moderator') router.push('/');
  };

  const fetchCategories = async () => {
    const { data } = await supabase.from('categories').select('*').order('name');
    if (data) setCategories(data as Category[]);
    setLoading(false);
  };

  const resetForm = () => {
    setForm({ name: '', slug: '', icon: '', description: '', color: '#dc2626' });
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
    });
    setShowNew(false);
  };

  const handleSave = async () => {
    if (!form.name.trim() || !form.slug.trim()) {
      alert('Name and slug are required.');
      return;
    }

    if (editId) {
      await supabase.from('categories').update({
        name: form.name.trim(),
        slug: form.slug.trim(),
        icon: form.icon || null,
        description: form.description || null,
        color: form.color || null,
      }).eq('id', editId);
    } else {
      await supabase.from('categories').insert({
        name: form.name.trim(),
        slug: form.slug.trim(),
        icon: form.icon || null,
        description: form.description || null,
        color: form.color || null,
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
        <h1 className="text-2xl font-bold text-dark-50">Manage Categories</h1>
        <button
          onClick={() => { resetForm(); setShowNew(true); }}
          className="ml-auto flex items-center gap-1.5 px-3 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-sm font-medium rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Category
        </button>
      </div>

      {/* New / Edit Form */}
      {(showNew || editId !== null) && (
        <div className="bg-dark-800/50 border border-dark-700 rounded-xl p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-medium text-dark-100">
              {editId ? 'Edit Category' : 'New Category'}
            </h2>
            <button onClick={resetForm} className="p-1 text-dark-400 hover:text-dark-200">
              <X className="w-5 h-5" />
            </button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1">Name</label>
              <input
                value={form.name}
                onChange={(e) => {
                  setForm((f) => ({ ...f, name: e.target.value, ...(editId ? {} : { slug: slugify(e.target.value) }) }));
                }}
                className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-sm text-dark-100 focus:outline-none focus:ring-2 focus:ring-crimson-500/50"
                placeholder="e.g. Bosses"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1">Slug</label>
              <input
                value={form.slug}
                onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-sm text-dark-100 focus:outline-none focus:ring-2 focus:ring-crimson-500/50"
                placeholder="e.g. bosses"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1">Icon (emoji)</label>
              <input
                value={form.icon}
                onChange={(e) => setForm((f) => ({ ...f, icon: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-sm text-dark-100 focus:outline-none focus:ring-2 focus:ring-crimson-500/50"
                placeholder="e.g. 🐉"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-dark-400 mb-1">Color</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="w-10 h-10 rounded border border-dark-600 cursor-pointer bg-transparent"
                />
                <input
                  value={form.color}
                  onChange={(e) => setForm((f) => ({ ...f, color: e.target.value }))}
                  className="flex-1 px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-sm text-dark-100 font-mono focus:outline-none focus:ring-2 focus:ring-crimson-500/50"
                />
              </div>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-dark-400 mb-1">Description</label>
              <input
                value={form.description}
                onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                className="w-full px-3 py-2 bg-dark-900 border border-dark-600 rounded-lg text-sm text-dark-100 focus:outline-none focus:ring-2 focus:ring-crimson-500/50"
                placeholder="Short description..."
              />
            </div>
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={handleSave}
              className="flex items-center gap-1.5 px-4 py-2 bg-crimson-600 hover:bg-crimson-700 text-white text-sm font-medium rounded-lg transition-colors"
            >
              <Save className="w-4 h-4" /> {editId ? 'Update' : 'Create'}
            </button>
          </div>
        </div>
      )}

      {/* List */}
      <div className="space-y-2">
        {categories.map((cat) => (
          <div
            key={cat.id}
            className="flex items-center gap-4 bg-dark-800/50 border border-dark-700 rounded-lg px-4 py-3"
          >
            <span className="text-2xl">{cat.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="text-dark-100 font-medium">{cat.name}</p>
              <p className="text-xs text-dark-500">/category/{cat.slug}</p>
            </div>
            <div
              className="w-4 h-4 rounded-full shrink-0"
              style={{ backgroundColor: cat.color || '#dc2626' }}
            />
            <button
              onClick={() => startEdit(cat)}
              className="px-3 py-1 text-xs text-dark-300 hover:text-dark-100 bg-dark-800 border border-dark-600 rounded-lg transition-colors"
            >
              Edit
            </button>
            <button
              onClick={() => handleDelete(cat.id, cat.name)}
              className="p-1.5 text-dark-400 hover:text-crimson-400 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
        {categories.length === 0 && (
          <p className="text-center text-dark-500 py-8 text-sm">No categories yet.</p>
        )}
      </div>
    </div>
  );
}
