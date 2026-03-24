'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Save, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { extractTextFromJson } from '@/lib/utils';
import type { Category, Article, Json } from '@/lib/types/database';
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

    // Update article
    const { error } = await supabase
      .from('articles')
      .update({
        content: content as unknown as Json,
        content_text: plainText,
        excerpt: plainText.slice(0, 200),
        updated_by: session.user.id,
      })
      .eq('id', article.id);

    if (error) {
      alert('Failed to save: ' + error.message);
    } else {
      router.push(`/wiki/${slug}`);
      router.refresh();
    }
    setSaving(false);
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-dark-800 rounded w-1/3" />
          <div className="h-96 bg-dark-800 rounded" />
        </div>
      </div>
    );
  }

  if (!article) {
    return (
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8 text-center">
        <p className="text-dark-400">Article not found.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-4 mb-6">
        <Link
          href={`/wiki/${slug}`}
          className="flex items-center gap-1 text-sm text-dark-400 hover:text-dark-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to article
        </Link>
        <h1 className="text-2xl font-bold text-dark-50">
          Editing: {article.title}
        </h1>
      </div>

      <TiptapEditor
        content={content}
        onChange={(json, text) => {
          setContent(json);
          setContentText(text);
        }}
      />

      <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <input
          type="text"
          placeholder="Edit summary (e.g. Fixed typo, Added boss strategy)"
          value={editSummary}
          onChange={(e) => setEditSummary(e.target.value)}
          className="flex-1 w-full px-4 py-2 bg-dark-800 border border-dark-600 rounded-lg text-sm text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-crimson-500/50"
        />
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-6 py-2.5 bg-crimson-600 hover:bg-crimson-700 disabled:opacity-50 text-white font-medium rounded-lg transition-colors shrink-0"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
}
