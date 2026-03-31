'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Pencil, AlertTriangle } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDateRelative } from '@/lib/utils';

interface StubRow {
  id: string;
  slug: string;
  title: string;
  content_text: string | null;
  updated_at: string;
  categories: { name: string; slug: string } | null;
  profiles: { username: string } | null;
}

function wordCount(text: string | null): number {
  if (!text) return 0;
  return text.trim().split(/\s+/).filter(Boolean).length;
}

export default function AdminStubsPage() {
  const [stubs, setStubs] = useState<StubRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [threshold, setThreshold] = useState(300);
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAccess();
    fetchStubs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAccess = async () => {
    const { data: { user }, error } = await supabase.auth.getUser();
    if (!user || error) { router.push('/auth/login'); return; }
    const { data } = await supabase.from('profiles').select('role').eq('id', user.id).single();
    const role = (data as { role: string } | null)?.role;
    if (role !== 'admin' && role !== 'moderator') router.push('/');
  };

  const fetchStubs = async () => {
    const { data } = await supabase
      .from('articles')
      .select('id, slug, title, content_text, updated_at, categories(name, slug), profiles!articles_updated_by_fkey(username)')
      .eq('is_published', true)
      .order('updated_at', { ascending: false });
    if (data) setStubs(data as unknown as StubRow[]);
    setLoading(false);
  };

  const filtered = stubs
    .filter(a => wordCount(a.content_text) < threshold)
    .sort((a, b) => wordCount(a.content_text) - wordCount(b.content_text));

  return (
    <>
      <div className="page-hd">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/admin" style={{ color: 'var(--text-2)', display: 'flex' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="page-hd-title">Stub Articles</div>
            <div className="page-hd-sub">{loading ? '…' : filtered.length} articles under {threshold} words</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '11px', color: 'var(--text-2)' }}>Threshold:</span>
          {[100, 200, 300, 500].map(n => (
            <button
              key={n}
              onClick={() => setThreshold(n)}
              style={{
                padding: '2px 8px', fontSize: '11px', cursor: 'pointer',
                background: threshold === n ? 'var(--amber-dim)' : 'var(--bg-3)',
                border: `1px solid ${threshold === n ? 'var(--amber)' : 'var(--border)'}`,
                color: threshold === n ? 'var(--text-0)' : 'var(--text-2)',
                fontFamily: 'var(--ff)',
              }}
            >
              {n}w
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div style={{ color: 'var(--text-2)', fontSize: '13px', padding: '20px' }}>Loading…</div>
      ) : filtered.length === 0 ? (
        <div className="wiki-box">
          <div className="wiki-box-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', color: 'var(--text-2)', gap: '8px' }}>
            <AlertTriangle size={32} />
            <p style={{ fontSize: '13px' }}>No stub articles — all articles meet the threshold!</p>
          </div>
        </div>
      ) : (
        <div className="wiki-box">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>Article</th>
                <th>Category</th>
                <th style={{ textAlign: 'right' }}>Words</th>
                <th>Last edited</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => {
                const wc = wordCount(a.content_text);
                const pct = Math.min(100, Math.round((wc / threshold) * 100));
                return (
                  <tr key={a.id}>
                    <td>
                      <Link href={`/wiki/${a.slug}`} style={{ color: 'var(--text-0)', fontSize: '12px', fontWeight: 500 }}>
                        {a.title}
                      </Link>
                    </td>
                    <td style={{ fontSize: '11px', color: 'var(--text-2)' }}>
                      {a.categories?.name ?? '—'}
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '3px' }}>
                        <span style={{ fontSize: '12px', color: wc < 100 ? 'var(--crimson)' : wc < 200 ? 'var(--amber)' : 'var(--text-1)', fontVariantNumeric: 'tabular-nums' }}>
                          {wc}
                        </span>
                        <div style={{ width: '60px', height: '3px', background: 'var(--bg-3)', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${pct}%`, height: '100%', background: wc < 100 ? 'var(--crimson)' : 'var(--amber)', borderRadius: '2px' }} />
                        </div>
                      </div>
                    </td>
                    <td style={{ fontSize: '11px', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                      {formatDateRelative(a.updated_at)}
                    </td>
                    <td>
                      <Link
                        href={`/wiki/${a.slug}/edit`}
                        style={{ color: 'var(--amber)', display: 'flex', padding: '4px' }}
                        title="Edit article"
                      >
                        <Pencil size={13} />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
