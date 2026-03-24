'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TiptapEditor } from '@/components/editor/TiptapEditor';
import { slugify, extractTextFromJson } from '@/lib/utils';
import type { Category, Json } from '@/lib/types/database';
import type { JSONContent } from '@tiptap/react';

export default function NewArticlePage() {
  const router = useRouter();
  const supabase = createClient();

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [categoryId, setCategoryId] = useState<number | null>(null);
  const [coverImageUrl, setCoverImageUrl] = useState('');
  const [content, setContent] = useState<JSONContent>({});
  const [contentText, setContentText] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [autoSlug, setAutoSlug] = useState(true);

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

  const handleSubmit = async () => {
    if (!title.trim() || !slug.trim()) {
      alert('Title and slug are required.');
      return;
    }

    setSaving(true);

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      alert('You must be signed in to create articles.');
      setSaving(false);
      return;
    }

    const plainText = extractTextFromJson(content);

    const { data, error } = await supabase
      .from('articles')
      .insert({
        title: title.trim(),
        slug: slug.trim(),
        category_id: categoryId,
        content: content as unknown as Json,
        content_text: plainText,
        excerpt: plainText.slice(0, 200),
        cover_image_url: coverImageUrl || null,
        created_by: session.user.id,
        updated_by: session.user.id,
      })
      .select()
      .single();

    if (error) {
      alert('Failed to create article: ' + error.message);
    } else if (data) {
      router.push(`/wiki/${data.slug}`);
    }
    setSaving(false);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <h1 className="text-2xl font-bold text-dark-50 mb-6">Create New Article</h1>

      <div className="space-y-5 mb-8">
        {/* Title */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Title</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Stoneback Crab Boss Guide"
            className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-crimson-500/50 focus:border-crimson-500"
          />
        </div>

        {/* Slug */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">
            URL Slug
            <button
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
              className="flex-1 px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 placeholder-dark-500 focus:outline-none focus:ring-2 focus:ring-crimson-500/50 disabled:opacity-60"
            />
          </div>
        </div>

        {/* Category */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Category</label>
          <select
            value={categoryId ?? ''}
            onChange={(e) => setCategoryId(e.target.value ? Number(e.target.value) : null)}
            className="w-full px-4 py-2.5 bg-dark-800 border border-dark-600 rounded-lg text-dark-100 focus:outline-none focus:ring-2 focus:ring-crimson-500/50 focus:border-crimson-500"
          >
            <option value="">Select a category...</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.icon} {cat.name}
              </option>
            ))}
          </select>
        </div>

        {/* Cover Image */}
        <div>
          <label className="block text-sm font-medium text-dark-300 mb-1.5">Cover Image URL (optional)</label>
          <input
            type="text"
            value={coverImageUrl}
            onChange={(e) => setCoverImageUrl(e.target.value)}
            placeholder="https://..."
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
      />

      <div className="flex justify-end mt-6">
        <button
          onClick={handleSubmit}
          disabled={saving || !title.trim()}
          className="flex items-center gap-2 px-6 py-2.5 bg-crimson-600 hover:bg-crimson-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-lg transition-colors"
        >
          <Save className="w-4 h-4" />
          {saving ? 'Publishing...' : 'Publish Article'}
        </button>
      </div>
    </div>
  );
}
