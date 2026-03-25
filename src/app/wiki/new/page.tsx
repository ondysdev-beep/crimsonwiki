'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
    let resolved = false;
    const done = (session: boolean) => {
      if (resolved) return;
      resolved = true;
      setIsAuthenticated(session);
      setAuthChecked(true);
    };

    // Primary: listen for auth state
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => done(!!session)
    );

    // Fallback: direct check
    supabase.auth.getSession()
      .then(({ data: { session } }) => done(!!session))
      .catch(() => done(false));

    // Timeout fallback
    const timeout = setTimeout(() => done(false), 5000);

    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
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
      try {
        await supabase.from('article_revisions').insert({
          article_id: data.id,
          content: content as unknown as Json,
          content_text: plainText,
          edited_by: session.user.id,
          edit_summary: editSummary.trim() || 'Initial version',
        });
      } catch { /* revision insert failed, article still created */ }

      try { localStorage.removeItem('autosave-new-article'); } catch { /* ignore */ }
      setSaving(false);
      setSavingDraft(false);
      router.push(`/wiki/${data.slug}`);
      return;
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

  const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: '10px 14px',
    background: 'var(--surface)',
    border: '1px solid var(--border)',
    borderRadius: 8,
    color: 'var(--text-primary)',
    fontSize: 14,
    fontFamily: 'inherit',
    outline: 'none',
  };
  const inputErrorStyle: React.CSSProperties = { ...inputStyle, borderColor: '#e05555' };
  const labelStyle: React.CSSProperties = { display: 'block', fontSize: 13, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 };
  const errorTextStyle: React.CSSProperties = { fontSize: 12, color: '#e05555', marginTop: 4 };

  return (
    <div className="page-enter" style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>
      <div className="section-title" style={{ marginBottom: 24 }}>Create New Article</div>

      {errors.form && (
        <div style={{
          background: 'rgba(155,32,32,0.15)',
          border: '1px solid rgba(155,32,32,0.3)',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 20,
          fontSize: 13,
          color: '#e05555',
        }}>
          {errors.form}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
        {/* Title */}
        <div>
          <label style={labelStyle}>Title *</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Stoneback Crab Boss Guide"
            style={errors.title ? inputErrorStyle : inputStyle}
          />
          {errors.title && <div style={errorTextStyle}>{errors.title}</div>}
        </div>

        {/* Slug */}
        <div>
          <label style={labelStyle}>
            URL Slug{' '}
            <button
              type="button"
              onClick={() => setAutoSlug(!autoSlug)}
              style={{ fontSize: 11, color: 'var(--crimson-bright)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}
            >
              {autoSlug ? '(auto - click to edit)' : '(manual - click for auto)'}
            </button>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>/wiki/</span>
            <input
              type="text"
              value={slug}
              onChange={(e) => { setAutoSlug(false); setSlug(e.target.value); }}
              disabled={autoSlug}
              style={{ ...inputStyle, flex: 1, opacity: autoSlug ? 0.5 : 1, ...(errors.slug ? { borderColor: '#e05555' } : {}) }}
            />
          </div>
          {errors.slug && <div style={errorTextStyle}>{errors.slug}</div>}
        </div>

        {/* Category */}
        <div>
          <label style={labelStyle}>Category *</label>
          <select
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
            style={{ ...inputStyle, ...(errors.category ? { borderColor: '#e05555' } : {}) }}
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
          {errors.category && <div style={errorTextStyle}>{errors.category}</div>}
        </div>

        {/* Excerpt */}
        <div>
          <label style={labelStyle}>Excerpt (short description)</label>
          <textarea
            value={excerpt}
            onChange={(e) => setExcerpt(e.target.value.slice(0, 300))}
            placeholder="A brief summary of the article (max 300 characters)"
            rows={3}
            maxLength={300}
            style={{ ...inputStyle, resize: 'none' as const }}
          />
          <div style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'right', marginTop: 4 }}>{excerpt.length}/300</div>
        </div>

        {/* Cover Image */}
        <div>
          <label style={labelStyle}>Cover Image (optional)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button
              type="button"
              onClick={() => coverInputRef.current?.click()}
              disabled={coverUploading}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                padding: '8px 14px', background: 'var(--surface)', border: '1px solid var(--border)',
                borderRadius: 8, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <Upload className="w-4 h-4" />
              {coverUploading ? 'Uploading...' : 'Upload image'}
            </button>
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>or</span>
            <input
              type="text"
              value={coverImageUrl}
              onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="Paste image URL..."
              style={{ ...inputStyle, flex: 1 }}
            />
          </div>
          <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
          {coverImageUrl && (
            <div style={{ marginTop: 12, position: 'relative', display: 'inline-block' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImageUrl} alt="Cover preview" width={320} height={180} style={{ borderRadius: 8, border: '1px solid var(--border)', objectFit: 'cover', display: 'block' }} />
              <button
                type="button"
                onClick={() => setCoverImageUrl('')}
                style={{
                  position: 'absolute', top: 4, right: 4, padding: 4,
                  background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%',
                  color: '#ccc', cursor: 'pointer', lineHeight: 0,
                }}
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {/* Edit Summary */}
        <div>
          <label style={labelStyle}>Edit Summary</label>
          <input
            type="text"
            value={editSummary}
            onChange={(e) => setEditSummary(e.target.value)}
            placeholder="What did you write? (e.g. Initial article about boss mechanics)"
            style={inputStyle}
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

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
        <button
          type="button"
          onClick={() => handleSave(false)}
          disabled={savingDraft || saving || !title.trim()}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 20px', background: 'var(--surface)', border: '1px solid var(--border)',
            borderRadius: 8, fontSize: 14, fontWeight: 600, color: 'var(--text-muted)',
            cursor: (savingDraft || saving || !title.trim()) ? 'not-allowed' : 'pointer',
            opacity: (savingDraft || saving || !title.trim()) ? 0.5 : 1,
            fontFamily: 'inherit', transition: 'background 0.2s',
          }}
        >
          <FileText className="w-4 h-4" />
          {savingDraft ? 'Saving...' : 'Save Draft'}
        </button>
        <button
          type="button"
          onClick={() => handleSave(true)}
          disabled={saving || savingDraft || !title.trim()}
          style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 24px', background: 'var(--crimson)', border: 'none',
            borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#fff',
            cursor: (saving || savingDraft || !title.trim()) ? 'not-allowed' : 'pointer',
            opacity: (saving || savingDraft || !title.trim()) ? 0.5 : 1,
            fontFamily: 'inherit', transition: 'background 0.2s',
          }}
        >
          <Save className="w-4 h-4" />
          {saving ? 'Publishing...' : 'Publish Article'}
        </button>
      </div>
    </div>
  );
}
