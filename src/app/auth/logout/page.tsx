'use client';

import { useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';

export default function LogoutPage() {
  useEffect(() => {
    const logout = async () => {
      const supabase = createClient();
      await supabase.auth.signOut();
      localStorage.removeItem('codeseoul-auth');
      window.location.href = '/login';
    };
    logout();
  }, []);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
    </div>
  );
}
