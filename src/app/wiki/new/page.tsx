'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Save, FileText, Upload, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { slugify, extractTextFromJson } from '@/lib/utils';
import type { Category, Json } from '@/lib/types/database';
import type { JSONContent } from '@tiptap/react';

export default function NewArticlePage() {
  const router = useRouter();
  const supabase = createClient();
  const coverInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverUploading, setCoverUploading] = useState(false);
  const [content, setContent] = useState<JSONContent>({});
  const [contentText, setContentText] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [savingDraft, setSavingDraft] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
      setAuthChecked(true);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      const { data } = await supabase.from('categories').select('*').order('name');
      if (data) setCategories(data);
    };
    fetchCategories();
  }, []);

  useEffect(() => {
    if (autoSlug) setSlug(slugify(title));
  }, [title, autoSlug]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required.';
    if (!slug.trim()) errs.slug = 'Slug is required.';
    if (!categoryId) errs.category = 'Please select a category.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return null;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.url) return json.url as string;
    } catch {
      // upload failed
    }
    return null;
  }, [supabase]);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    const url = await uploadImage(file);
    if (url) setCoverImageUrl(url);
    setCoverUploading(false);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const handleSave = async (publish: boolean) => {
    if (!validate()) return;

    if (publish) setSaving(true);
    else setSavingDraft(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setErrors({ form: 'You must be signed in to create articles.' });
      setSaving(false);
      setSavingDraft(false);
      return;
    }

    const plainText = extractTextFromJson(content);
    const finalExcerpt = excerpt.trim() || plainText.slice(0, 200);

    const { data, error } = await supabase
      .from('articles')
      .insert({
        title: title.trim(),
        slug: slug.trim(),
        category_id: categoryId,
        content: content as unknown as Json,
        content_text: plainText,
        excerpt: finalExcerpt,
        cover_image_url: coverImageUrl || null,
        created_by: session.user.id,
        updated_by: session.user.id,
        is_published: publish,
      })
      .select()
      .single();

    if (error) {
      if (error.message.includes('duplicate') || error.code === '23505') {
        setErrors({ slug: 'This slug is already taken. Choose a different title or edit the slug.' });
      } else {
        setErrors({ form: 'Failed to create article: ' + error.message });
      }
    } else if (data) {
      await supabase.from('article_revisions').insert({
        article_id: data.id,
        content: content as unknown as Json,
        content_text: plainText,
        edited_by: session.user.id,
        edit_summary: editSummary.trim() || 'Initial version',
      });

      try { localStorage.removeItem('autosave-new-article'); } catch { /* ignore */ }
      router.push(`/wiki/${data.slug}`);
    }
    setSaving(false);
    setSavingDraft(false);
  };

  if (!authChecked) {
    return (
      <div className="settings-page">
        <div className="settings-loading">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="settings-page page-enter" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>Sign In Required</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.7 }}>
          You need to be signed in to create articles on CrimsonWiki.
        </div>
        <a href="/auth/login" className="btn-login">Login with Discord</a>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-dark-50 mb-6">Create New Article</h1>

      {errors.form && (
        <div className="mb-6 px-4 py-3 bg-red-500/10 border border-red-500/30 rounded-lg text-sm text-red-400">
          {errors.form}
        </div>
      )}

      <div className="space-y-5 mb-8">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Stoneback Crab Boss Guide"
            className={`w-full px-4 py-2.5 bg-dark-800 border rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-crimson-500/50 focus:border-crimson-500 ${errors.title ? 'border-red-500' : 'border-dark-600'}`}
          />
          {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title}</p>}
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">
            URL Slug
            <button
              type="button"
              onClick={() => setAutoSlug(!autoSlug)}
              className="ml-2 text-xs text-crimson-400 hover:text-crimson-300"
            >
              {autoSlug ? '(auto - click to edit)' : '(manual - click for auto)'}
            </button>
          </label>
          <div className="flex items-center gap-2">
            <span className="text-sm text-dark-500">/wiki/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => {
                setAutoSlug(false);
                setSlug(e.target.value);
              }}
              disabled={autoSlug}
              className={`flex-1 px-4 py-2.5 bg-dark-800 border rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-crimson-500/50 disabled:opacity-60 ${errors.slug ? 'border-red-500' : 'border-dark-600'}`}
            />
          </div>
          {errors.slug && <p className="mt-1 text-xs text-red-400">{errors.slug}</p>}
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Category *</label>
          <select
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
            className={`w-full px-4 py-2.5 bg-dark-800 border rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-crimson-500/50 focus:border-crimson-500 ${errors.category ? 'border-red-500' : 'border-dark-600'}`}
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
          {errors.category && <p className="mt-1 text-xs text-red-400">{errors.category}</p>}
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Excerpt (short description)</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value.slice(0, 300))}
            placeholder="A brief summary of the article (max 300 characters)"
            rows={3}
            maxLength={300}
            className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-crimson-500/50 resize-none"
          />
          <div className="mt-1 text-xs text-dark-500 text-right">{excerpt.length}/300</div>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Cover Image (optional)</label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading}
              className="flex items-center gap-2 px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm text-dark-300 hover:text-dark-100 hover:bg-dark-700 transition-colors"
            >
              <Upload className="w-4 h-4" />
              {coverUploading ? 'Uploading...' : 'Upload image'}
            </button>
            <span className="text-dark-500 text-xs">or</span>
            <input
              type="text"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="Paste image URL..."
              className="flex-1 px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-crimson-500/50"
            />
          </div>
          <input
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
            className="hidden"
          />
          {coverImageUrl && (
            <div className="mt-3 relative inline-block">
              <Image
                src={coverImageUrl}
                alt="Cover preview"
                width={320}
                height={180}
                className="rounded-lg border border-dark-600 object-cover"
              />
              <button
                type="button"
                onClick={() => setCoverImageUrl('')}
                className="absolute top-1 right-1 p-1 bg-dark-900/80 rounded-full text-dark-300 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Edit Summary */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Edit Summary</label>
          <input
            type="text"
            value={editSummary}
            onChange={(e) => setEditSummary(e.target.value)}
            placeholder="What did you write? (e.g. Initial article about boss mechanics)"
            className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-crimson-500/50"
          />
        </div>
      </div>

      {/* Editor */}
      <TiptapEditor
        onChange={(json, text) => {
          setContent(json);
          setContentText(text);
        }}
        autosaveKey="autosave-new-article"
        onImageUpload={uploadImage}
      />

      <div className="flex items-center justify-end gap-3 mt-6">
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={savingDraft || saving || !title.trim()}
          className="flex items-center gap-2 px-5 py-2.5 bg-dark-800 hover:bg-dark-700 border border-dark-600 disabled:opacity-50 disabled:cursor-not-allowed text-dark-200 font-medium rounded-lg transition-colors"
        >
          <FileText className="w-4 h-4" />
          {savingDraft ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={saving || savingDraft || !title.trim()}
          className="flex items-center gap-2 px-6 py-2.5 bg-crimson-600 hover:bg-crimson-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Publishing...' : 'Publish Article'}
        </button>
      </div>
    </div>
  );
}
