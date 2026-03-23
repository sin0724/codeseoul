'use client';

import Link from 'next/link';
import { LogOut, Shield } from 'lucide-react';
import { AuthGuard } from '@/components/auth/AuthGuard';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_CODESEUL_ADMIN_EMAIL;

export function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthGuard requiredRole="admin" adminEmail={ADMIN_EMAIL}>
      <div className="min-h-screen bg-[#080808] text-white">
        <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[#080808]/95 backdrop-blur">
          <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-6">
            <div className="flex items-center gap-3">
              <Link
                href="/admin/codeseoul"
                className="font-mono text-base font-bold tracking-[0.15em] text-white hover:text-white/80 transition-colors"
              >
                codeseoul
              </Link>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#E11D48]/10 border border-[#E11D48]/20">
                <Shield className="w-3 h-3 text-[#E11D48]" />
                <span className="text-xs font-medium text-[#E11D48]">관리자</span>
              </div>
            </div>
            <Link
              href="/auth/logout"
              className="flex items-center gap-1.5 text-sm text-white/40 hover:text-white/70 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              로그아웃
            </Link>
          </div>
        </nav>

        <main className="mx-auto max-w-7xl px-6 py-8">
          {children}
        </main>
      </div>
    </AuthGuard>
  );
}
