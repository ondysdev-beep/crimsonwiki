'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

interface SearchResult {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  categories: { name: string; slug: string } | null;
}

export function HeroSearch() {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!query.trim() || query.length < 2) {
      setResults([]);
      setOpen(false);
      return;
    }
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}&limit=6`);
        const data = await res.json();
        setResults(data.results || []);
        setOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 280);
  }, [query]);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setOpen(false);
      router.push(`/search?q=${encodeURIComponent(query.trim())}`);
    }
  };

  return (
    <div ref={wrapRef} className="hero-search-wrap">
      <form onSubmit={handleSubmit} className="hero-search-form">
        <input
          type="text"
          className="hero-search-input"
          placeholder="Search bosses, items, quests, locations..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => results.length > 0 && setOpen(true)}
          autoComplete="off"
        />
        <button type="submit" className="hero-search-btn">Search</button>
      </form>

      {open && (
        <div className="hero-search-dropdown">
          {loading && (
            <div className="hero-search-item" style={{ color: 'var(--text-2)', cursor: 'default' }}>
              Searching...
            </div>
          )}
          {!loading && results.length === 0 && query.length >= 2 && (
            <div className="hero-search-item" style={{ color: 'var(--text-2)', cursor: 'default' }}>
              No results for &ldquo;{query}&rdquo;
            </div>
          )}
          {!loading && results.map((r) => (
            <Link
              key={r.id}
              href={`/wiki/${r.slug}`}
              className="hero-search-item"
              onClick={() => { setOpen(false); setQuery(''); }}
            >
              <span className="hero-search-title">{r.title}</span>
              {r.categories && (
                <span className={`tag tag-${r.categories.slug}`} style={{ marginLeft: 6, fontSize: 10 }}>
                  {r.categories.name}
                </span>
              )}
              {r.excerpt && (
                <span className="hero-search-excerpt">{r.excerpt.slice(0, 80)}{r.excerpt.length > 80 ? '…' : ''}</span>
              )}
            </Link>
          ))}
          {!loading && results.length > 0 && (
            <Link
              href={`/search?q=${encodeURIComponent(query)}`}
              className="hero-search-item hero-search-all"
              onClick={() => setOpen(false)}
            >
              See all results for &ldquo;{query}&rdquo; →
            </Link>
          )}
        </div>
      )}
    </div>
  );
}
