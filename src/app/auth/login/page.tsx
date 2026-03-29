'use client';

import { useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { SITE_URL } from '@/lib/utils';

function LoginContent() {
  const searchParams = useSearchParams();
  const errorFromCallback = searchParams.get('error');
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleDiscordLogin = async () => {
    setLoading(true);
    await supabase.auth.signInWithOAuth({
      provider: 'discord',
      options: {
        redirectTo: `${SITE_URL}/api/auth/callback`,
      },
    });
  };

  return (
    <div className="settings-page page-enter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <div style={{ width: '100%', maxWidth: 420, padding: '0 16px' }}>
        <div style={{
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          borderRadius: 12,
          padding: '40px 32px',
          textAlign: 'center',
        }}>
          {errorFromCallback && (
            <div style={{
              background: 'rgba(155,32,32,0.15)',
              border: '1px solid rgba(155,32,32,0.3)',
              borderRadius: 8,
              padding: '12px 16px',
              marginBottom: 20,
              fontSize: 13,
              color: '#e05555',
              lineHeight: 1.5,
            }}>
              Login failed: {decodeURIComponent(errorFromCallback)}
            </div>
          )}

          <div style={{
            fontFamily: "'Cinzel', serif",
            fontSize: 22,
            fontWeight: 700,
            color: 'var(--text-bright)',
            marginBottom: 8,
          }}>
            Sign in to CrimsonWiki
          </div>
          <div style={{
            fontSize: 13,
            color: 'var(--text-muted)',
            marginBottom: 32,
            lineHeight: 1.6,
          }}>
            Join the community and start contributing to the Crimson Desert wiki.
          </div>

          <button
            onClick={handleDiscordLogin}
            disabled={loading}
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 12,
              padding: '12px 24px',
              background: '#5865F2',
              color: '#fff',
              border: 'none',
              borderRadius: 8,
              fontSize: 14,
              fontWeight: 600,
              cursor: loading ? 'wait' : 'pointer',
              opacity: loading ? 0.5 : 1,
              transition: 'background 0.2s',
              fontFamily: 'inherit',
            }}
            onMouseEnter={(e) => { if (!loading) (e.target as HTMLButtonElement).style.background = '#4752C4'; }}
            onMouseLeave={(e) => { (e.target as HTMLButtonElement).style.background = '#5865F2'; }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="currentColor">
              <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
            </svg>
            {loading ? 'Redirecting...' : 'Continue with Discord'}
          </button>

          <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 24, lineHeight: 1.6 }}>
            By signing in, you agree to our{' '}
            <Link href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Terms of Service</Link>
            {' '}and{' '}
            <Link href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}>Privacy Policy</Link>.
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)' }}>
        Loading...
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
