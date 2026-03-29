'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { extractTextFromJson } from '@/lib/utils';
import type { Article, Json } from '@/lib/types/database';
import type { JSONContent } from '@tiptap/react';

export default function EditArticlePage() {
  const router = useRouter();
  const params = useParams();
  const slug = params.slug as string;
  const supabase = createClient();

  const [article, setArticle] = useState<Article | null>(null);
  const [content, setContent] = useState<JSONContent>({});
  const [contentText, setContentText] = useState('');
  const [editSummary, setEditSummary] = useState('');
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  const uploadImage = useCallback(async (file: File): Promise<string | null> => {
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
  }, []);

  useEffect(() => {
    const fetchArticle = async () => {
      const { data } = await supabase
        .from('articles')
        .select('*')
        .eq('slug', slug)
        .single();
      if (data) {
        const article = data as unknown as Article;
        setArticle(article);
        setContent(article.content as JSONContent);
        setContentText(article.content_text || '');
      }
      setLoading(false);
    };
    fetchArticle();
  }, [slug]);

  const handleSave = async () => {
    if (!article) return;
    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('You must be signed in to edit articles.');
      setSaving(false);
      return;
    }

    const plainText = extractTextFromJson(content);

    // Save revision
    await supabase.from('article_revisions').insert({
      article_id: article.id,
      content: article.content,
      content_text: article.content_text,
      edited_by: session.user.id,
      edit_summary: editSummary || 'No summary provided',
    });

    // Update article — preserve existing excerpt, only update content
    const updatePayload: Record<string, unknown> = {
      content: content as unknown as Json,
      content_text: plainText,
      updated_by: session.user.id,
    };
    // Only auto-fill excerpt if the article currently has none
    if (!article.excerpt) {
      updatePayload.excerpt = plainText.slice(0, 200);
    }
    const { error } = await supabase
      .from('articles')
      .update(updatePayload)
      .eq('id', article.id);

    if (error) {
      alert('Failed to save: ' + error.message);
    } else {
      try { localStorage.removeItem(`autosave-edit-${slug}`); } catch { }
      router.push(`/wiki/${slug}`);
      router.refresh();
    }
    setSaving(false);
  };

  if (loading) {
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
    <>
      {/* PAGE HEADER */}
      <div className="page-hd">
        <div>
          <div className="page-hd-title">Editing Article</div>
          <div className="page-hd-sub">{article.title}</div>
        </div>
        <Link href={`/wiki/${slug}`} style={{ color: 'var(--link)', fontSize: '12px' }}>← Back to article</Link>
      </div>

      <TiptapEditor
        content={content}
        onChange={(json, text) => {
          setContent(json);
          setContentText(text);
        }}
        autosaveKey={`autosave-edit-${slug}`}
        onImageUpload={uploadImage}
      />

      <div style={{ marginTop: '16px', display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
        <input
          type="text"
          placeholder="Edit summary (e.g. Fixed typo, Added boss strategy)"
          value={editSummary}
          onChange={(e) => setEditSummary(e.target.value)}
          className="settings-input"
          style={{ flex: 1, minWidth: '200px', height: '32px' }}
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="btn-login"
          style={{ height: '32px', padding: '0 20px', display: 'flex', alignItems: 'center', gap: '6px', opacity: saving ? 0.6 : 1 }}
        >
          <Save style={{ width: 14, height: 14 }} />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </>
  );
}
