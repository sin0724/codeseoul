'use client';

import { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import { WaitingContent } from './WaitingContent';

export default function WaitingPage() {
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        window.location.href = '/login';
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', session.user.id)
        .single();

      if (profile?.status === 'approved') {
        window.location.href = '/dashboard';
        return;
      }

      setLoading(false);
    };

    checkAuth();
  }, [supabase]);

  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
      </div>
    );
  }

  return <WaitingContent />;
}
