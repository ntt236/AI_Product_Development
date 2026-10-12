import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

/**
 * Updates user session and performs server-side route protection.
 * Follows official @supabase/ssr Next.js App Router middleware conventions.
 */
export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  });

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey =
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;

  if (!supabaseUrl || !supabaseKey) {
    // If Supabase environment is not set up, allow request to proceed
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(
        cookiesToSet: Array<{
          name: string;
          value: string;
          options?: Parameters<NextResponse['cookies']['set']>[2];
        }>
      ) {
        cookiesToSet.forEach(({ name, value }) =>
          request.cookies.set(name, value)
        );
        supabaseResponse = NextResponse.next({
          request,
        });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options)
        );
      },
    },
  });

  // IMPORTANT: Do NOT use getSession() for security critical checks.
  // getUser() sends a request to the Supabase Auth server every time to revalidate the Auth token.
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Protected paths requiring authentication
  const isProtectedPath =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/onboarding') ||
    pathname.startsWith('/settings') ||
    pathname.startsWith('/assessment') ||
    pathname.startsWith('/learning') ||
    pathname.startsWith('/practice') ||
    pathname.startsWith('/progress') ||
    pathname.startsWith('/tutor');

  // Auth pages (login, register)
  const isAuthPage =
    pathname === '/login' ||
    pathname === '/register';

  if (!user && isProtectedPath) {
    // User is unauthenticated, redirect to login while preserving refreshed cookies
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/login';
    redirectUrl.searchParams.set('redirectTo', pathname);
    const redirectResponse = NextResponse.redirect(redirectUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  if (user && isAuthPage) {
    // User is already logged in, redirect to dashboard while preserving refreshed cookies
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = '/dashboard';
    const redirectResponse = NextResponse.redirect(redirectUrl);
    supabaseResponse.cookies.getAll().forEach((cookie) => {
      redirectResponse.cookies.set(cookie);
    });
    return redirectResponse;
  }

  return supabaseResponse;
}
