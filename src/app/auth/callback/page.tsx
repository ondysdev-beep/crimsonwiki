'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

function CallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const errorDesc = searchParams.get('error_description');

    if (errorDesc) {
      setError(errorDesc);
      return;
    }

    const supabase = createClient();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_IN') {
        router.push('/');
      }
    });

    return () => subscription.unsubscribe();
  }, [router, searchParams]);

  if (error) {
    return (
      <div className="settings-page page-enter" style={{ textAlign: 'center', paddingTop: 60 }}>
        <div className="section-title" style={{ marginBottom: 12, color: 'var(--crimson-bright)' }}>
          Login Failed
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted)', marginBottom: 8, lineHeight: 1.7 }}>
          {error}
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-dim)', marginBottom: 28, lineHeight: 1.6 }}>
          This usually means the database trigger failed during account creation.<br />
          Please contact an admin or try again later.
        </div>
        <Link href="/auth/login" className="btn-login">Try Again</Link>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '60vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'Cinzel', serif",
      fontSize: 13,
      letterSpacing: '0.15em',
      textTransform: 'uppercase' as const,
      color: 'var(--text-muted)',
    }}>
      Signing you in...
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div style={{
        minHeight: '60vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: "'Cinzel', serif",
        fontSize: 13,
        letterSpacing: '0.15em',
        textTransform: 'uppercase' as const,
        color: 'var(--text-muted)',
      }}>
        Signing you in...
      </div>
    }>
      <CallbackContent />
    </Suspense>
  );
}
