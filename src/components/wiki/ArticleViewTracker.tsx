'use client';

import { useEffect } from 'react';

interface Props {
  slug: string;
  title: string;
  categoryName?: string;
}

const STORAGE_KEY = 'cw-recently-viewed';
const MAX_ITEMS = 8;

export function ArticleViewTracker({ slug, title, categoryName }: Props) {
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      const existing: { slug: string; title: string; categoryName?: string; ts: number }[] =
        raw ? JSON.parse(raw) : [];

      const filtered = existing.filter(i => i.slug !== slug);
      const updated = [{ slug, title, categoryName, ts: Date.now() }, ...filtered].slice(0, MAX_ITEMS);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch { /* ignore */ }
  }, [slug, title, categoryName]);

  return null;
}
