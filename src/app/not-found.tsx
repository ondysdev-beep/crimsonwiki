import Link from 'next/link';

export default function NotFound() {
  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '0 16px', textAlign: 'center',
    }}>
      <h1 style={{ fontFamily: "'Cinzel Decorative', 'Cinzel', serif", fontSize: 64, fontWeight: 700, color: 'var(--crimson-bright)', marginBottom: 8 }}>
        404
      </h1>
      <h2 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
        Page Not Found
      </h2>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32, maxWidth: 420 }}>
        This page doesn&apos;t exist in the archives. It may have been moved or deleted.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link href="/" className="btn-login">
          Return to Homepage
        </Link>
        <Link href="/search" className="btn-login" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          Search Wiki
        </Link>
      </div>
    </div>
  );
}
