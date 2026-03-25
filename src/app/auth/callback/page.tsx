'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const [status, setStatus] = useState('Signing you in...');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const errorParam = params.get('error_description') || params.get('error');
    const code = params.get('code');

    if (errorParam) {
      window.location.href = `/auth/login?error=${encodeURIComponent(errorParam)}`;
      return;
    }

    if (!code) {
      window.location.href = '/auth/login?error=missing_code';
      return;
    }

    const supabase = createClient();
    let cancelled = false;

    setStatus('Exchanging authorization code...');

    supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
      if (cancelled) return;
      if (exchangeError) {
        console.error('exchangeCodeForSession error:', exchangeError);
        setError(exchangeError.message);
        setStatus('Login failed');
        setTimeout(() => {
          window.location.href = `/auth/login?error=${encodeURIComponent(exchangeError.message)}`;
        }, 2000);
      } else {
        setStatus('Success! Redirecting...');
        // Hard redirect to ensure fresh page load with new cookies
        window.location.href = '/';
      }
    }).catch((err) => {
      if (cancelled) return;
      console.error('exchangeCodeForSession exception:', err);
      setError(String(err));
      setStatus('Login failed');
    });

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (!cancelled && !error) {
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (cancelled) return;
          if (session) {
            window.location.href = '/';
          } else {
            setError('Login timed out. Please try again.');
            setStatus('Timed out');
            setTimeout(() => { window.location.href = '/auth/login?error=timeout'; }, 2000);
          }
        });
      }
    }, 10000);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, []);

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 16,
      color: 'var(--text-muted)',
    }}>
      {error ? (
        <>
          <div style={{ color: '#e05555', fontSize: 16, fontWeight: 600 }}>{status}</div>
          <div style={{ fontSize: 14 }}>{error}</div>
          <div style={{ fontSize: 12 }}>Redirecting to login page...</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
            {status}
          </div>
          <div style={{ fontSize: 13 }}>Please wait while we complete authentication.</div>
        </>
      )}
    </div>
  );
}
