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
          console.log('[auth/callback] cookies in request:', all.map(c => c.name));
          return all;
        },
        setAll(cookiesToSet) {
          console.log('[auth/callback] setAll called with', cookiesToSet.map(c => c.name));
          cookiesToSet.forEach(({ name, value, options }) => {
            pendingCookies.push({ name, value, options: (options ?? {}) as Record<string, unknown> });
          });
        },
      },
    }
  );

  const { data, error } = await supabase.auth.exchangeCodeForSession(code);

  console.log('[auth/callback] exchange result - error:', error?.message ?? null, 'user:', data?.user?.id ?? null, 'pendingCookies:', pendingCookies.length);

  if (error) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent(error.message)}`
    );
  }

  const forwardedHost = request.headers.get('x-forwarded-host');
  const redirectTo = forwardedHost ? `https://${forwardedHost}/` : `${origin}/`;

  const response = NextResponse.redirect(redirectTo);
  pendingCookies.forEach(({ name, value, options }) => {
    response.cookies.set(name, value, options as Parameters<typeof response.cookies.set>[2]);
  });
  console.log('[auth/callback] redirecting to', redirectTo, 'with', pendingCookies.length, 'cookies');
  return response;
}
