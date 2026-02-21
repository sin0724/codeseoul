import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

export async function updateSession(request: NextRequest) {
  let response = NextResponse.next({ request });

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

  const { data: { user } } = await supabase.auth.getUser();
  const pathname = request.nextUrl.pathname;
  const adminEmail = process.env.CODESEUL_ADMIN_EMAIL || process.env.NEXT_PUBLIC_CODESEUL_ADMIN_EMAIL;

  const redirectTo = (path: string) => {
    const redirectResp = NextResponse.redirect(new URL(path, request.url));
    response.cookies.getAll().forEach((c) =>
      redirectResp.cookies.set(c.name, c.value, { path: '/' })
    );
    return redirectResp;
  };

  // 로그인/회원가입 페이지는 인증 불필요
  if (pathname === '/login' || pathname === '/signup') {
    return response;
  }

  // 보호된 경로 - 로그인 필요
  const isProtectedRoute = pathname.startsWith('/dashboard') || pathname.startsWith('/admin') || pathname === '/';
  if (isProtectedRoute && !user) {
    return redirectTo('/login');
  }

  // 사용자가 있을 때만 처리
  if (!user) return response;

  // 관리자 체크 (DB 조회 없이 빠르게 처리)
  const isAdmin = user.email === adminEmail;

  // 관리자 페이지 접근 제한
  if (pathname.startsWith('/admin/codeseoul') && !isAdmin) {
    return redirectTo('/dashboard');
  }

  // 관리자는 dashboard 대신 admin으로
  if (isAdmin && (pathname.startsWith('/dashboard') || pathname === '/')) {
    return redirectTo('/admin/codeseoul');
  }

  // KOL: profile 조회가 필요한 경우만 (관리자 제외)
  if (!isAdmin && (pathname.startsWith('/dashboard') || pathname === '/' || pathname === '/waiting' || pathname === '/rejected')) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('status')
      .eq('id', user.id)
      .single();

    const status = profile?.status;

    if (pathname === '/' || pathname.startsWith('/dashboard')) {
      if (status !== 'approved') return redirectTo('/waiting');
      if (status === 'approved' && pathname === '/') return redirectTo('/dashboard');
    }

    if (pathname === '/waiting' && status === 'approved') {
      return redirectTo('/dashboard');
    }

    if (pathname === '/rejected') {
      return redirectTo('/waiting');
    }
  }

  return response;
}
