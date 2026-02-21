import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({
    request,
  });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet: { name: string; value: string; options?: Record<string, unknown> }[]) {
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options as { path?: string })
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const pathname = request.nextUrl.pathname;

  // Public routes
  const isAuthPage = pathname === '/login' || pathname === '/signup';
  const isWaitingPage = pathname === '/waiting';
  const isRejectedPage = pathname === '/rejected';

  const redirectTo = (url: URL) => {
    const redirectResp = NextResponse.redirect(url);
    response.cookies.getAll().forEach((c) =>
      redirectResp.cookies.set(c.name, c.value, { path: '/' })
    );
    return redirectResp;
  };

  if (isAuthPage || isWaitingPage || isRejectedPage) {
    if (user && !isAuthPage) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', user.id)
        .single();

      if (profile) {
        if (profile.status === 'approved' && (isWaitingPage || isRejectedPage)) {
          return redirectTo(new URL('/dashboard', request.url));
        }
        if (profile.status === 'rejected' && !isRejectedPage && !isAuthPage) {
          return redirectTo(new URL('/rejected', request.url));
        }
        if (profile.status === 'pending' && !isWaitingPage && !isAuthPage) {
          return redirectTo(new URL('/waiting', request.url));
        }
      }
    }
  }

  // Protected routes - require login
  const isProtectedRoute =
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/admin') ||
    pathname === '/';

  const adminEmail = process.env.CODESEUL_ADMIN_EMAIL || process.env.NEXT_PUBLIC_CODESEUL_ADMIN_EMAIL;

  if (isProtectedRoute && !user) {
    return redirectTo(new URL('/login', request.url));
  }

  if (pathname.startsWith('/admin/codeseoul') && user && user.email !== adminEmail) {
    return redirectTo(new URL('/dashboard', request.url));
  }

  if (pathname.startsWith('/dashboard') && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', user.id)
      .single();

    if (profile && profile.status !== 'approved') {
      if (profile.status === 'pending') return redirectTo(new URL('/waiting', request.url));
      if (profile.status === 'rejected') return redirectTo(new URL('/rejected', request.url));
    }
  }

  if (pathname === '/' && user) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', user.id)
      .single();

    if (profile?.status === 'approved') return redirectTo(new URL('/dashboard', request.url));
    if (profile?.status === 'pending') return redirectTo(new URL('/waiting', request.url));
    if (profile?.status === 'rejected') return redirectTo(new URL('/rejected', request.url));
    if (user.email === adminEmail) return redirectTo(new URL('/admin/codeseoul', request.url));
  }

  return response;
}
