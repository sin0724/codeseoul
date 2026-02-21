'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';

interface AuthGuardProps {
  children: React.ReactNode;
  requiredRole?: 'admin' | 'kol';
  adminEmail?: string;
}

export function AuthGuard({ children, requiredRole, adminEmail }: AuthGuardProps) {
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading');
  const [profileStatus, setProfileStatus] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.href = '/login';
        return;
      }

      const user = session.user;

      // 관리자 체크
      if (requiredRole === 'admin') {
        const isAdmin = user.email === adminEmail || user.email === process.env.NEXT_PUBLIC_CODESEUL_ADMIN_EMAIL;
        if (!isAdmin) {
          window.location.href = '/dashboard';
          return;
        }
        setStatus('authenticated');
        return;
      }

      // KOL 체크
      if (requiredRole === 'kol') {
        // 관리자는 admin으로 리다이렉트
        if (user.email === adminEmail || user.email === process.env.NEXT_PUBLIC_CODESEUL_ADMIN_EMAIL) {
          window.location.href = '/admin/codeseoul';
          return;
        }

        // profile status 체크
        const { data: profile } = await supabase
          .from('profiles')
          .select('status')
          .eq('id', user.id)
          .single();

        const pStatus = profile?.status;
        setProfileStatus(pStatus);

        if (pStatus !== 'approved') {
          window.location.href = '/waiting';
          return;
        }
      }

      setStatus('authenticated');
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'SIGNED_OUT') {
        window.location.href = '/login';
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase, requiredRole, adminEmail]);

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return <>{children}</>;
}
