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
    <div className="toc">
      <div
        className="toc-title"
        onClick={() => setCollapsed(!collapsed)}
        style={{ cursor: 'pointer' }}
      >
        Contents <span style={{ fontSize: '10px', fontWeight: '400', color: 'var(--text-2)' }}>
          [{collapsed ? 'show' : 'hide'}]
        </span>
      </div>

      {!collapsed && (
        <ol>
          {headings.map((h, i) => (
            <li key={`${h.id}-${i}`} style={{ marginLeft: `${(h.level - minLevel) * 16}px` }}>
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
                style={{
                  color: activeId === h.id ? 'var(--amber)' : 'var(--link)',
                  fontSize: '12px'
                }}
              >
                {h.text}
              </a>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}
