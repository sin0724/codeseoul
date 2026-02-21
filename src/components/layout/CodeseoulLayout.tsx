'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { LogOut, Shield } from 'lucide-react';
import { NotificationBell } from '@/components/layout/NotificationBell';
import { createClient } from '@/lib/supabase/client';
import { zhTW } from '@/messages/kol/zh-TW';

interface CodeseoulLayoutProps {
  children: React.ReactNode;
  showNav?: boolean;
}

export function CodeseoulLayout({ children, showNav = true }: CodeseoulLayoutProps) {
  const pathname = usePathname();
  const supabase = createClient();
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const check = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      const adminEmail = process.env.NEXT_PUBLIC_CODESEUL_ADMIN_EMAIL;
      setIsAdmin(!!user && !!adminEmail && user.email === adminEmail);
    };
    check();
  }, [supabase]);


  return (
    <div className="min-h-screen bg-black text-white">
      {/* 스캔 라인: 승인 검토중(waiting) 페이지에서만 표시 */}
      {pathname === '/waiting' && (
        <div className="scan-line opacity-30" aria-hidden />
      )}
      
      {showNav && (
        <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80">
          <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
            <Link
              href={isAdmin ? '/admin/codeseoul' : '/dashboard'}
              className="font-mono text-lg font-bold tracking-wider text-white"
            >
              codeseoul
            </Link>
            <div className="flex items-center gap-4">
              {!isAdmin && <NotificationBell />}
              {isAdmin && (
                <Link
                  href="/admin/codeseoul"
                  className="flex items-center gap-2 text-sm text-[#FF0000] hover:text-[#FF0000]/80 font-mono transition-colors"
                >
                  <Shield className="w-4 h-4" />
                  관리자
                </Link>
              )}
              <Link
                href="/auth/logout"
                className="flex items-center gap-2 text-sm text-white/70 hover:text-[#FF0000] transition-colors"
              >
                <LogOut className="w-4 h-4" />
                {isAdmin ? '로그아웃' : zhTW.logout}
              </Link>
            </div>
          </div>
        </nav>
      )}

      <main className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
