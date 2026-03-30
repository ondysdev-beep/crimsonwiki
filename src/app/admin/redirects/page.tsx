'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Plus, Trash2, ArrowRight } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { formatDateRelative } from '@/lib/utils';

interface RedirectRow {
  id: number;
  from_slug: string;
  to_slug: string;
  created_at: string;
}

export default function AdminRedirectsPage() {
  const [redirects, setRedirects] = useState<RedirectRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromSlug, setFromSlug] = useState('');
  const [toSlug, setToSlug] = useState('');
  const [adding, setAdding] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAccess();
    fetchRedirects();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login'); return; }
    const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    const role = (data as { role: string } | null)?.role;
    if (role !== 'admin' && role !== 'moderator') router.push('/');
  };

  const fetchRedirects = async () => {
    const { data } = await supabase
      .from('redirects' as never)
      .select('id, from_slug, to_slug, created_at')
      .order('created_at', { ascending: false });
    if (data) setRedirects(data as RedirectRow[]);
    setLoading(false);
  };

  const addRedirect = async () => {
    setError('');
    const from = fromSlug.trim().replace(/^\/wiki\//, '');
    const to   = toSlug.trim().replace(/^\/wiki\//, '');
    if (!from || !to) { setError('Both fields are required.'); return; }
    if (from === to)  { setError('Source and destination cannot be the same.'); return; }
    setAdding(true);
    const { error: err } = await supabase.from('redirects' as never).insert({ from_slug: from, to_slug: to } as never);
    if (err) {
      setError(err.message.includes('unique') ? 'A redirect for that slug already exists.' : err.message);
    } else {
      setFromSlug('');
      setToSlug('');
      fetchRedirects();
    }
    setAdding(false);
  };

  const deleteRedirect = async (id: number) => {
    if (!confirm('Delete this redirect?')) return;
    await supabase.from('redirects' as never).delete().eq('id', id as never);
    setRedirects(prev => prev.filter(r => r.id !== id));
  };

  return (
    <>
      <div className="page-hd">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/admin" style={{ color: 'var(--text-2)', display: 'flex' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="page-hd-title">Redirect Management</div>
            <div className="page-hd-sub">{redirects.length} active redirects — applied automatically by middleware</div>
          </div>
        </div>
      </div>

      {/* ADD FORM */}
      <div className="wiki-box" style={{ marginBottom: '16px' }}>
        <div className="wiki-box-hd">Add Redirect</div>
        <div className="wiki-box-body">
          <p style={{ fontSize: '11px', color: 'var(--text-2)', marginBottom: '12px' }}>
            Use article slugs only (without <code>/wiki/</code> prefix). Example: <code>old-boss-name</code> → <code>new-boss-name</code>
          </p>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '180px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>/wiki/</span>
              <input
                type="text"
                placeholder="old-slug"
                value={fromSlug}
                onChange={e => setFromSlug(e.target.value)}
                style={{ flex: 1, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-0)', fontFamily: 'var(--ff)', fontSize: '12px', padding: '6px 10px', outline: 'none' }}
              />
            </div>
            <ArrowRight size={14} style={{ color: 'var(--text-3)', flexShrink: 0 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flex: 1, minWidth: '180px' }}>
              <span style={{ fontSize: '11px', color: 'var(--text-2)', whiteSpace: 'nowrap' }}>/wiki/</span>
              <input
                type="text"
                placeholder="new-slug"
                value={toSlug}
                onChange={e => setToSlug(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addRedirect()}
                style={{ flex: 1, background: 'var(--bg-3)', border: '1px solid var(--border)', color: 'var(--text-0)', fontFamily: 'var(--ff)', fontSize: '12px', padding: '6px 10px', outline: 'none' }}
              />
            </div>
            <button
              onClick={addRedirect}
              disabled={adding}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 16px', background: 'var(--amber-dim)', border: '1px solid var(--amber)', color: 'var(--text-0)', cursor: 'pointer', fontFamily: 'var(--ff)', fontSize: '12px', whiteSpace: 'nowrap' }}
            >
              <Plus size={13} /> Add
            </button>
          </div>
          {error && <p style={{ fontSize: '11px', color: 'var(--crimson)', marginTop: '8px' }}>{error}</p>}
        </div>
      </div>

      {/* LIST */}
      {loading ? (
        <div style={{ color: 'var(--text-2)', fontSize: '13px', padding: '20px' }}>Loading…</div>
      ) : redirects.length === 0 ? (
        <div className="wiki-box">
          <div className="wiki-box-body" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-2)', fontSize: '13px' }}>
            No redirects yet. Add one above.
          </div>
        </div>
      ) : (
        <div className="wiki-box">
          <table className="wiki-table">
            <thead>
              <tr>
                <th>From slug</th>
                <th></th>
                <th>To slug</th>
                <th>Added</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {redirects.map(r => (
                <tr key={r.id}>
                  <td style={{ fontSize: '12px', fontFamily: 'monospace', color: 'var(--text-2)' }}>
                    /wiki/{r.from_slug}
                  </td>
                  <td style={{ textAlign: 'center', color: 'var(--text-3)' }}>
                    <ArrowRight size={12} />
                  </td>
                  <td style={{ fontSize: '12px', fontFamily: 'monospace' }}>
                    <Link href={`/wiki/${r.to_slug}`} style={{ color: 'var(--link)' }}>
                      /wiki/{r.to_slug}
                    </Link>
                  </td>
                  <td style={{ fontSize: '11px', color: 'var(--text-3)', whiteSpace: 'nowrap' }}>
                    {formatDateRelative(r.created_at)}
                  </td>
                  <td>
                    <button
                      onClick={() => deleteRedirect(r.id)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--crimson)', padding: '4px', display: 'flex' }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
}
