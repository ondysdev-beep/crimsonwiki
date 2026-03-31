// FIXED: Added 2-second timeout to fetch request and proper error handling to prevent cache update on failure
import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

// ── DB-driven redirects cache (60 s TTL) ──────────────────────────────────────
let redirectCache: Record<string, string> = {};
let cacheExpiry = 0;

async function getDbRedirects(): Promise<Record<string, string>> {
  if (Date.now() < cacheExpiry) return redirectCache;
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/rest/v1/redirects?select=from_slug,to_slug`;
    const res = await fetch(url, {
      headers: {
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? '',
        Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''}`,
      },
      next: { revalidate: 0 },
      signal: AbortSignal.timeout(2000),
    });
    if (res.ok) {
      const rows: { from_slug: string; to_slug: string }[] = await res.json();
      redirectCache = Object.fromEntries(rows.map(r => [r.from_slug, r.to_slug]));
      cacheExpiry = Date.now() + 60_000;
    }
  } catch {
    /* ignore – fallback to empty cache, do not update cacheExpiry so it retries next time */
  }
  return redirectCache;
}
// ─────────────────────────────────────────────────────────────────────────────

export async function middleware(request: NextRequest) {
  const { searchParams, pathname } = request.nextUrl;

  // ── DB slug redirects (/wiki/old-slug → /wiki/new-slug) ───────────────────
  if (pathname.startsWith('/wiki/')) {
    const slug = pathname.slice(6); // strip leading /wiki/
    if (slug && !slug.includes('/')) {
      const dbRedirects = await getDbRedirects();
      if (dbRedirects[slug]) {
        const dest = request.nextUrl.clone();
        dest.pathname = `/wiki/${dbRedirects[slug]}`;
        return NextResponse.redirect(dest, { status: 301 });
      }
    }
  }

  // Catch OAuth errors that Supabase redirects to the homepage
  const oauthError = searchParams.get('error_description') || searchParams.get('error');
  if (oauthError && (pathname === '/' || pathname === '')) {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/auth/login';
    loginUrl.search = `?error=${encodeURIComponent(oauthError)}`;
    return NextResponse.redirect(loginUrl);
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? 'https://placeholder.supabase.co',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? 'placeholder-anon-key',
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  await supabase.auth.getUser();

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api/auth/callback|auth/callback|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
