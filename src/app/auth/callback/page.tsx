'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const errorParam = searchParams.get('error_description') || searchParams.get('error');
    if (errorParam) {
      router.replace(`/auth/login?error=${encodeURIComponent(errorParam)}`);
      return;
    }

    const code = searchParams.get('code');
    if (!code) {
      router.replace('/auth/login?error=missing_code');
      return;
    }

    let cancelled = false;

    supabase.auth.exchangeCodeForSession(code).then(({ error: exchangeError }) => {
      if (cancelled) return;
      if (exchangeError) {
        setError(exchangeError.message);
        setTimeout(() => {
          router.replace(`/auth/login?error=${encodeURIComponent(exchangeError.message)}`);
        }, 2000);
      } else {
        router.replace('/');
      }
    });

    // Timeout fallback
    const timeout = setTimeout(() => {
      if (!cancelled) {
        // Check if we actually have a session despite no callback
        supabase.auth.getSession().then(({ data: { session } }) => {
          if (session) {
            router.replace('/');
          } else {
            setError('Login timed out. Please try again.');
            setTimeout(() => router.replace('/auth/login?error=timeout'), 2000);
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
          <div style={{ color: '#e05555', fontSize: 16, fontWeight: 600 }}>Login Failed</div>
          <div style={{ fontSize: 14 }}>{error}</div>
          <div style={{ fontSize: 12 }}>Redirecting to login page...</div>
        </>
      ) : (
        <>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)' }}>
            Signing you in...
          </div>
          <div style={{ fontSize: 13 }}>Please wait while we complete authentication.</div>
        </>
      )}
    </div>
  );
}
