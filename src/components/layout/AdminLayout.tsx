'use client';

import Link from 'next/link';
import { LogOut, Shield } from 'lucide-react';

/**
 * 관리자 페이지 전용 레이아웃.
 * zhTW 번역 모듈에 의존하지 않아, 번역 관련 이슈로부터 격리됨.
 */
export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-black text-white">
      <nav className="sticky top-0 z-50 border-b border-white/10 bg-black/95 backdrop-blur supports-[backdrop-filter]:bg-black/80">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link
            href="/admin/codeseoul"
            className="font-mono text-lg font-bold tracking-wider text-white"
          >
            codeseoul
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/codeseoul"
              className="flex items-center gap-2 text-sm text-[#FF0000] hover:text-[#FF0000]/80 font-mono transition-colors"
            >
              <Shield className="w-4 h-4" />
              관리자
            </Link>
            <Link
              href="/auth/logout"
              className="flex items-center gap-2 text-sm text-white/70 hover:text-[#FF0000] transition-colors"
            >
              <LogOut className="w-4 h-4" />
              로그아웃
            </Link>
          </div>
        </div>
      </nav>

      <main className="mx-auto max-w-6xl px-4 py-8">
        {children}
      </main>
    </div>
  );
}
