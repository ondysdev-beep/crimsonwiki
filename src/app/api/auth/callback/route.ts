// FIXED: Removed all console.log statements, added production environment checks, and implemented open redirect protection
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import type { Database } from '@/lib/types/database';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const errorParam = searchParams.get('error_description') || searchParams.get('error');

  if (errorParam) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(errorParam)}`
    );
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/auth/login?error=missing_code`);
  }

  const cookieStore = cookies();
  const pendingCookies: { name: string; value: string; options: Record<string, unknown> }[] = [];

  const supabase = createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          const all = cookieStore.getAll();
          if (process.env.NODE_ENV !== 'production') {
            console.error('[auth/callback] cookies in request:', all.map(c => c.name));
          }
          return all;
        },
        setAll(cookiesToSet) {
          if (process.env.NODE_ENV !== 'production') {
            console.error('[auth/callback] setAll called with', cookiesToSet.map(c => c.name));
          }
          cookiesToSet.forEach(({ name, value, options }) => {
            pendingCookies.push({ name, value, options: (options ?? {}) as Record<string, unknown> });
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  if (process.env.NODE_ENV !== 'production') {
    console.error('[auth/callback] exchange result - error:', error?.message ?? null, 'user:', data?.user?.id ?? null, 'pendingCookies:', pendingCookies.length);
  }

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(error.message)}`
    );
  }

  if (data?.user) {
    const meta = data.user.user_metadata ?? {};
    const rawUsername =
      meta?.custom_claims?.global_name ??
      meta?.user_name ??
      meta?.name ??
      meta?.full_name ??
      data.user.email?.split('@')[0] ??
      'user_' + data.user.id.substring(0, 8);
    const username = (rawUsername ?? '').trim() || 'user_' + data.user.id.substring(0, 8);
    const { error: upsertError } = await supabase
      .from('profiles')
      .upsert(
        { id: data.user.id, username, avatar_url: meta?.avatar_url ?? null, discord_id: meta?.provider_id ?? null },
        { onConflict: 'id', ignoreDuplicates: true }
      );
    if (process.env.NODE_ENV !== 'production') {
      console.error('[auth/callback] profile upsert:', upsertError?.message ?? 'ok');
    }
  }

  // Protect against open redirect
  const ALLOWED_HOSTS = ['crimsonwiki.org', 'www.crimsonwiki.org'];
  const forwardedHost = request.headers.get('x-forwarded-host');
  const safeHost = forwardedHost && ALLOWED_HOSTS.some(h => forwardedHost.endsWith(h))
    ? forwardedHost
    : null;
  const redirectTo = safeHost ? `https://${safeHost}/` : `${origin}/`;

  const response = NextResponse.redirect(redirectTo);
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  });

  if (process.env.NODE_ENV !== 'production') {
    console.error('[auth/callback] redirecting to', redirectTo, 'with', pendingCookies.length, 'cookies');
  }

  return response;
}
