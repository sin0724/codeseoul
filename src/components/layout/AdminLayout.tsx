'use client';

import Link from 'next/link';
import { LogOut, Shield } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_CODESEUL_ADMIN_EMAIL;

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="admin" adminEmail={ADMIN_EMAIL}>
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
    </AuthGuard>
  );
}
