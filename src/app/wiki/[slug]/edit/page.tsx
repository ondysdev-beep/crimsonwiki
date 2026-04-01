'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, Upload, X, Eye, EyeOff } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { extractTextFromJson, slugify } from '@/lib/utils';
import type { Article, Category, Json } from '@/lib/types/database';
import type { JSONContent } from '@tiptap/react';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const currentSlug = params.slug as string;
  const supabase = createClient();
  const coverInputRef = useRef<HTMLInputElement>(null);
  const handleSaveRef = useRef<((publish?: boolean) => void) | null>(null);

  const [article, setArticle] = useState<Article | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [saving, setSaving] = useState(false);

  // Form fields
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [autoSlug, setAutoSlug] = useState(false);
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [excerpt, setExcerpt] = useState('');
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [coverUploading, setCoverUploading] = useState(false);
  const [content, setContent] = useState<JSONContent>({});
  const [editSummary, setEditSummary] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setIsAuthenticated(!!user);
    };
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const [{ data: artData }, { data: catData }] = await Promise.all([
        supabase.from('articles').select('*').eq('slug', currentSlug).single(),
        supabase.from('categories').select('*').order('name'),
      ]);
      if (artData) {
        const a = artData as unknown as Article;
        setArticle(a);
        setTitle(a.title);
        setSlug(a.slug);
        setCategoryId(a.category_id ?? null);
        setExcerpt(a.excerpt ?? '');
        setCoverImageUrl(a.cover_image_url ?? '');
        setContent(a.content as JSONContent);
      }
      if (catData) setCategories(catData as Category[]);
      setLoading(false);
    };
    fetchData();
  }, [currentSlug]);

  useEffect(() => {
    if (autoSlug) setSlug(slugify(title));
  }, [title, autoSlug]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        handleSaveRef.current?.();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch('/api/upload', { method: 'POST', body: formData });
      const json = await res.json();
      if (json.url) return json.url as string;
    } catch { /* upload failed */ }
    return null;
  }, []);

  const handleCoverUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverUploading(true);
    const url = await uploadImage(file);
    if (url) setCoverImageUrl(url);
    setCoverUploading(false);
    if (coverInputRef.current) coverInputRef.current.value = '';
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!title.trim()) errs.title = 'Title is required.';
    if (!slug.trim()) errs.slug = 'Slug is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSave = async (publish?: boolean) => {
    if (!article || !validate()) return;
    setSaving(true);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      alert('You must be signed in to edit articles.');
      setSaving(false);
      return;
    }

    const plainText = extractTextFromJson(content);

    // Save revision of old content before overwriting
    await supabase.from('article_revisions').insert({
      article_id: article.id,
      content: article.content,
      content_text: article.content_text,
      edited_by: user.id,
      edit_summary: editSummary.trim() || 'No summary provided',
    });

    const newSlug = slug.trim();
    const updatePayload: Record<string, unknown> = {
      title: title.trim(),
      slug: newSlug,
      category_id: categoryId,
      excerpt: excerpt.trim() || plainText.slice(0, 200),
      cover_image_url: coverImageUrl || null,
      content: content as unknown as Json,
      content_text: plainText,
      updated_by: user.id,
    };

    if (publish !== undefined) {
      updatePayload.is_published = publish;
    }

    const { error } = await supabase
      .from('articles')
      .update(updatePayload)
      .eq('id', article.id);

    if (error) {
      if (error.message.includes('duplicate') || error.code === '23505') {
        setErrors({ slug: 'This slug is already taken by another article.' });
      } else {
        alert('Failed to save: ' + error.message);
      }
      setSaving(false);
      return;
    }

    try { localStorage.removeItem(`autosave-edit-${currentSlug}`); } catch { /* ignore */ }
    setSaving(false);
    router.push(`/wiki/${newSlug}`);
    router.refresh();
  };

  handleSaveRef.current = handleSave;

  const inputStyle: React.CSSProperties = {
    width: '100%', padding: '10px 14px',
    background: 'var(--surface)', border: '1px solid var(--border)',
    borderRadius: 8, color: 'var(--text-primary)',
    fontSize: 14, fontFamily: 'inherit', outline: 'none',
  };
  const inputErrStyle: React.CSSProperties = { ...inputStyle, borderColor: '#e05555' };
  const labelStyle: React.CSSProperties = {
    display: 'block', fontSize: 13, fontWeight: 600,
    color: 'var(--text-muted)', marginBottom: 6,
  };
  const errTextStyle: React.CSSProperties = { fontSize: 12, color: '#e05555', marginTop: 4 };

  if (loading) {
    return <div className="settings-page"><div className="settings-loading">Loading...</div></div>;
  }

  if (!isAuthenticated) {
    return (
      <div className="settings-page page-enter" style={{ textAlign: 'center', paddingTop: 80 }}>
        <div className="section-title" style={{ marginBottom: 16 }}>Sign In Required</div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 24, lineHeight: 1.7 }}>
          You need to be signed in to edit articles on CrimsonWiki.
        </div>
        <a href="/auth/login" className="btn-login">Login with Discord</a>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 16px', color: 'var(--text-2)' }}>
        Article not found.
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '32px 16px' }}>
      {/* PAGE HEADER */}
      <div className="page-hd" style={{ marginBottom: 24 }}>
        <div>
          <div className="page-hd-title">Edit Article</div>
          <div className="page-hd-sub">
            <Link href={`/wiki/${currentSlug}`} style={{ color: 'var(--link)' }}>← Back to article</Link>
          </div>
        </div>
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          {article.is_published ? (
            <button type="button" onClick={() => handleSave(false)} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(200,130,10,0.1)', border: '1px solid rgba(200,130,10,0.3)', borderRadius: 8, fontSize: 13, fontWeight: 600, color: 'var(--amber)', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.5 : 1 }}>
              <EyeOff style={{ width: 14, height: 14 }} /> Unpublish &amp; Save
            </button>
          ) : (
            <button type="button" onClick={() => handleSave(true)} disabled={saving}
              style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 16px', background: 'rgba(51,204,119,0.1)', border: '1px solid rgba(51,204,119,0.3)', borderRadius: 8, fontSize: 13, fontWeight: 600, color: '#33cc77', cursor: saving ? 'not-allowed' : 'pointer', fontFamily: 'inherit', opacity: saving ? 0.5 : 1 }}>
              <Eye style={{ width: 14, height: 14 }} /> Publish &amp; Save
            </button>
          )}
        </div>
      </div>

      {errors.form && (
        <div style={{ background: 'rgba(155,32,32,0.15)', border: '1px solid rgba(155,32,32,0.3)', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#e05555' }}>
          {errors.form}
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginBottom: 32 }}>
        {/* Title */}
        <div>
          <label style={labelStyle}>Title *</label>
          <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Stoneback Crab Boss Guide"
            style={errors.title ? inputErrStyle : inputStyle} />
          {errors.title && <div style={errTextStyle}>{errors.title}</div>}
        </div>

        {/* Slug */}
        <div>
          <label style={labelStyle}>
            URL Slug{' '}
            <button type="button" onClick={() => setAutoSlug(!autoSlug)}
              style={{ fontSize: 11, color: 'var(--crimson-bright)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit' }}>
              {autoSlug ? '(auto - click to edit)' : '(manual - click for auto)'}
            </button>
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>/wiki/</span>
            <input type="text" value={slug}
              onChange={(e) => { setAutoSlug(false); setSlug(e.target.value); }}
              disabled={autoSlug}
              style={{ ...inputStyle, flex: 1, opacity: autoSlug ? 0.5 : 1, ...(errors.slug ? { borderColor: '#e05555' } : {}) }} />
          </div>
          {errors.slug && <div style={errTextStyle}>{errors.slug}</div>}
          {slug !== currentSlug && (
            <div style={{ fontSize: 11, color: 'var(--amber)', marginTop: 4 }}>
              ⚠ Slug changed — the old URL <code>/wiki/{currentSlug}</code> will stop working unless you add a redirect in <Link href="/admin/redirects" style={{ color: 'var(--link)' }}>Admin → Redirects</Link>.
            </div>
          )}
        </div>

        {/* Category */}
        <div>
          <label style={labelStyle}>Category</label>
          <select value={categoryId ?? ''} onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)} style={inputStyle}>
            <option value="">No category</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>

        {/* Excerpt */}
        <div>
          <label style={labelStyle}>Excerpt (short description)</label>
          <textarea value={excerpt} onChange={(e) => setExcerpt(e.target.value.slice(0, 300))}
            placeholder="A brief summary of the article (max 300 characters)"
            rows={3} maxLength={300}
            style={{ ...inputStyle, resize: 'none' as const }} />
          <div style={{ fontSize: 11, color: 'var(--text-dim)', textAlign: 'right', marginTop: 4 }}>{excerpt.length}/300</div>
        </div>

        {/* Cover Image */}
        <div>
          <label style={labelStyle}>Cover Image (optional)</label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <button type="button" onClick={() => coverInputRef.current?.click()} disabled={coverUploading}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 14px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13, color: 'var(--text-muted)', cursor: 'pointer', fontFamily: 'inherit' }}>
              <Upload style={{ width: 16, height: 16 }} />
              {coverUploading ? 'Uploading...' : 'Upload image'}
            </button>
            <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>or</span>
            <input type="text" value={coverImageUrl} onChange={(e) => setCoverImageUrl(e.target.value)}
              placeholder="Paste image URL..."
              style={{ ...inputStyle, flex: 1 }} />
          </div>
          <input ref={coverInputRef} type="file" accept="image/*" onChange={handleCoverUpload} style={{ display: 'none' }} />
          {coverImageUrl && (
            <div style={{ marginTop: 12, position: 'relative', display: 'inline-block' }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={coverImageUrl} alt="Cover preview" style={{ width: 320, height: 180, borderRadius: 8, border: '1px solid var(--border)', objectFit: 'cover', display: 'block' }} />
              <button type="button" onClick={() => setCoverImageUrl('')}
                style={{ position: 'absolute', top: 4, right: 4, padding: 4, background: 'rgba(0,0,0,0.7)', border: 'none', borderRadius: '50%', color: '#ccc', cursor: 'pointer', lineHeight: 0 }}>
                <X style={{ width: 16, height: 16 }} />
              </button>
            </div>
          )}
        </div>

        {/* Edit Summary */}
        <div>
          <label style={labelStyle}>Edit Summary</label>
          <input type="text" value={editSummary} onChange={(e) => setEditSummary(e.target.value)}
            placeholder="What did you change? (e.g. Fixed typo, Added boss strategy)"
            style={inputStyle} />
        </div>
      </div>

      {/* Editor */}
      <TiptapEditor
        content={content}
        onChange={(json, text) => { setContent(json); void text; }}
        autosaveKey={`autosave-edit-${currentSlug}`}
        onImageUpload={uploadImage}
      />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
        <button type="button" onClick={() => handleSave(false)} disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 20px', background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 8, fontSize: 14, fontWeight: 600, color: 'var(--text-muted)', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1, fontFamily: 'inherit' }}>
          <Save style={{ width: 16, height: 16 }} />
          {saving ? 'Saving...' : 'Save Draft'}
        </button>
        <button type="button" onClick={() => handleSave(true)} disabled={saving}
          style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px', background: 'var(--crimson)', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, color: '#fff', cursor: saving ? 'not-allowed' : 'pointer', opacity: saving ? 0.5 : 1, fontFamily: 'inherit' }}>
          <Save style={{ width: 16, height: 16 }} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
