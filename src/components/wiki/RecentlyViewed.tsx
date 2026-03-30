'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface ViewedItem {
  slug: string;
  title: string;
  categoryName?: string;
  ts: number;
}

const STORAGE_KEY = 'cw-recently-viewed';

export function RecentlyViewed() {
  const [items, setItems] = useState<ViewedItem[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setItems(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  if (items.length === 0) return null;

  return (
    <div className="wiki-box">
      <div className="wiki-box-hd">Recently Viewed</div>
      <div>
        {items.map(item => (
          <div key={item.slug} className="contrib-row">
            <Link href={`/wiki/${item.slug}`} className="contrib-name" style={{ flex: 1 }}>
              {item.title}
            </Link>
            {item.categoryName && (
              <span className="contrib-edits" style={{ fontSize: '10px' }}>{item.categoryName}</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
