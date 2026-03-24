'use client';

import { useState, useEffect } from 'react';
import { List, ChevronDown, ChevronRight } from 'lucide-react';
import type { Json } from '@/lib/types/database';

interface TocItem {
  id: string;
  text: string;
  level: number;
}

function extractHeadings(content: Json): TocItem[] {
  const headings: TocItem[] = [];

  function walk(node: unknown) {
    if (!node || typeof node !== 'object') return;
    const n = node as Record<string, unknown>;

    if (n.type === 'heading' && typeof n.attrs === 'object' && n.attrs) {
      const attrs = n.attrs as Record<string, unknown>;
      const level = (typeof attrs.level === 'number' ? attrs.level : 2) as number;
      const textParts: string[] = [];

      if (Array.isArray(n.content)) {
        for (const child of n.content) {
          const c = child as Record<string, unknown>;
          if (c.type === 'text' && typeof c.text === 'string') {
            textParts.push(c.text);
          }
        }
      }

      const text = textParts.join('');
      if (text) {
        const id = text
          .toLowerCase()
          .replace(/[^a-z0-9\s-]/g, '')
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')
          .trim();
        headings.push({ id, text, level });
      }
    }

    if (Array.isArray(n.content)) {
      for (const child of n.content) {
        walk(child);
      }
    }
  }

  walk(content);
  return headings;
}

export function TableOfContents({ content }: { content: Json }) {
  const [collapsed, setCollapsed] = useState(false);
  const [activeId, setActiveId] = useState<string>('');
  const headings = extractHeadings(content);

  useEffect(() => {
    if (headings.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            setActiveId(entry.target.id);
          }
        }
      },
      { rootMargin: '-80px 0px -70% 0px', threshold: 0 }
    );

    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }

    return () => observer.disconnect();
  }, [headings]);

  if (headings.length < 2) return null;

  const minLevel = Math.min(...headings.map((h) => h.level));

  return (
    <nav className="bg-dark-800/50 border border-dark-700 rounded-xl p-4 mb-8">
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="flex items-center gap-2 w-full text-left"
      >
        <List className="w-4 h-4 text-crimson-500" />
        <span className="text-sm font-semibold text-dark-200">Table of Contents</span>
        <span className="text-xs text-dark-500 ml-1">({headings.length})</span>
        <span className="ml-auto text-dark-400">
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </span>
      </button>

      {!collapsed && (
        <ol className="mt-3 space-y-0.5">
          {headings.map((h, i) => {
            const indent = (h.level - minLevel) * 16;
            return (
              <li key={`${h.id}-${i}`} style={{ paddingLeft: `${indent}px` }}>
                <a
                  href={`#${h.id}`}
                  onClick={(e) => {
                    e.preventDefault();
                    const el = document.getElementById(h.id);
                    if (el) {
                      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                      setActiveId(h.id);
                    }
                  }}
                  className={`block text-sm py-1 px-2 rounded transition-colors ${
                    activeId === h.id
                      ? 'text-crimson-400 bg-crimson-600/10'
                      : 'text-dark-400 hover:text-dark-200 hover:bg-dark-700/50'
                  }`}
                >
                  {h.text}
                </a>
              </li>
            );
          })}
        </ol>
      )}
    </nav>
  );
}
