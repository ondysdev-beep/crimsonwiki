'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Copy, Trash2, Image as ImageIcon, Check } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

interface MediaFile {
  name: string;
  id: string;
  updated_at: string;
  metadata: { size: number; mimetype: string } | null;
  publicUrl: string;
}

const BUCKET = 'article-images';

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function AdminMediaPage() {
  const [files,    setFiles]    = useState<MediaFile[]>([]);
  const [loading,  setLoading]  = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [error,    setError]    = useState('');
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    checkAccess();
    fetchFiles();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const checkAccess = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) { router.push('/auth/login'); return; }
    const { data } = await supabase.from('profiles').select('role').eq('id', session.user.id).single();
    const role = (data as { role: string } | null)?.role;
    if (role !== 'admin' && role !== 'moderator') router.push('/');
  };

  const fetchFiles = async () => {
    setLoading(true);
    const { data, error: err } = await supabase.storage.from(BUCKET).list('', {
      limit: 200,
      sortBy: { column: 'updated_at', order: 'desc' },
    });
    if (err) {
      setError(`Could not load storage bucket "${BUCKET}". Make sure it exists in your Supabase project.`);
      setLoading(false);
      return;
    }
    const rows: MediaFile[] = (data || [])
      .filter(f => f.name !== '.emptyFolderPlaceholder')
      .map(f => {
        const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(f.name);
        return {
          name: f.name,
          id: f.id ?? f.name,
          updated_at: f.updated_at ?? '',
          metadata: f.metadata as MediaFile['metadata'],
          publicUrl: urlData.publicUrl,
        };
      });
    setFiles(rows);
    setLoading(false);
  };

  const copyUrl = (file: MediaFile) => {
    navigator.clipboard.writeText(file.publicUrl).then(() => {
      setCopiedId(file.id);
      setTimeout(() => setCopiedId(null), 2000);
    });
  };

  const deleteFile = async (file: MediaFile) => {
    if (!confirm(`Delete "${file.name}"? This cannot be undone.`)) return;
    const { error: err } = await supabase.storage.from(BUCKET).remove([file.name]);
    if (err) { alert(err.message); return; }
    setFiles(prev => prev.filter(f => f.id !== file.id));
  };

  const totalSize = files.reduce((s, f) => s + (f.metadata?.size || 0), 0);

  return (
    <>
      <div className="page-hd">
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Link href="/admin" style={{ color: 'var(--text-2)', display: 'flex' }}>
            <ArrowLeft size={16} />
          </Link>
          <div>
            <div className="page-hd-title">Media Library</div>
            <div className="page-hd-sub">
              {loading ? '…' : `${files.length} files · ${formatBytes(totalSize)} — bucket: ${BUCKET}`}
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="notice" style={{ marginBottom: '16px' }}>
          <strong>⚠</strong> {error}
        </div>
      )}

      {loading ? (
        <div style={{ color: 'var(--text-2)', fontSize: '13px', padding: '20px' }}>Loading…</div>
      ) : files.length === 0 && !error ? (
        <div className="wiki-box">
          <div className="wiki-box-body" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px', color: 'var(--text-2)', gap: '8px' }}>
            <ImageIcon size={32} />
            <p style={{ fontSize: '13px' }}>No files in the bucket yet.</p>
          </div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: '12px' }}>
          {files.map(file => {
            const isImage = file.metadata?.mimetype?.startsWith('image/');
            const isCopied = copiedId === file.id;
            return (
              <div
                key={file.id}
                style={{ border: '1px solid var(--border)', background: 'var(--bg-2)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
              >
                {/* PREVIEW */}
                <div style={{ height: '100px', background: 'var(--bg-3)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                  {isImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={file.publicUrl}
                      alt={file.name}
                      style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'cover' }}
                    />
                  ) : (
                    <ImageIcon size={28} style={{ color: 'var(--text-3)' }} />
                  )}
                </div>

                {/* INFO */}
                <div style={{ padding: '8px', flex: 1, display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <p style={{ fontSize: '11px', color: 'var(--text-0)', wordBreak: 'break-all', margin: 0, fontWeight: 500 }}>
                    {file.name.length > 28 ? '…' + file.name.slice(-24) : file.name}
                  </p>
                  {file.metadata?.size && (
                    <p style={{ fontSize: '10px', color: 'var(--text-3)', margin: 0 }}>
                      {formatBytes(file.metadata.size)} · {file.metadata.mimetype?.split('/')[1] ?? '?'}
                    </p>
                  )}
                </div>

                {/* ACTIONS */}
                <div style={{ display: 'flex', borderTop: '1px solid var(--border)' }}>
                  <button
                    onClick={() => copyUrl(file)}
                    title="Copy public URL"
                    style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', padding: '6px', background: 'none', border: 'none', cursor: 'pointer', fontSize: '11px', color: isCopied ? 'var(--green, #33cc77)' : 'var(--text-2)', fontFamily: 'var(--ff)' }}
                  >
                    {isCopied ? <><Check size={12} /> Copied</> : <><Copy size={12} /> Copy URL</>}
                  </button>
                  <button
                    onClick={() => deleteFile(file)}
                    title="Delete file"
                    style={{ padding: '6px 10px', background: 'none', border: 'none', borderLeft: '1px solid var(--border)', cursor: 'pointer', color: 'var(--crimson)', display: 'flex', alignItems: 'center' }}
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
