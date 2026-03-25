'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Page error:', error);
  }, [error]);

  return (
    <div style={{
      minHeight: '60vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', padding: '0 16px', textAlign: 'center',
    }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, color: 'var(--crimson-bright)', marginBottom: 12 }}>
        Something went wrong
      </h1>
      <p style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 32, maxWidth: 420 }}>
        An unexpected error occurred. Please try again or go back to the homepage.
      </p>
      <div style={{ display: 'flex', gap: 12 }}>
        <button onClick={reset} className="btn-login">
          Try Again
        </button>
        <Link href="/" className="btn-login" style={{ background: 'var(--bg-card)', color: 'var(--text-primary)', border: '1px solid var(--border)' }}>
          Go Home
        </Link>
      </div>
    </div>
  );
}
