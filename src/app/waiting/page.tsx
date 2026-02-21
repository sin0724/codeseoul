'use client';

import { useEffect, useState } from 'react';
import { CodeseoulLayout } from '@/components/layout/CodeseoulLayout';
import { motion } from 'framer-motion';
import { Clock } from 'lucide-react';
import { zhTW } from '@/messages/kol/zh-TW';
import { createClient } from '@/lib/supabase/client';

export default function WaitingPage() {
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const checkStatus = async () => {
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session?.user) {
          setChecking(false);
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
        } else if (profile?.status === 'rejected') {
          window.location.href = '/rejected';
          return;
        }
      } catch (err) {
        console.error('Status check error:', err);
      }
      setChecking(false);
    };
    
    checkStatus();
  }, []);

  if (checking) {
    return (
      <CodeseoulLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="w-8 h-8 border-2 border-white/20 border-t-white rounded-full animate-spin" />
        </div>
      </CodeseoulLayout>
    );
  }

  return (
    <CodeseoulLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          className="mb-6"
        >
          <Clock className="w-16 h-16 text-yellow-500" />
        </motion.div>
        <h1 className="text-xl font-bold text-white mb-4 font-mono tracking-wider">
          {zhTW.waitingTitle}
        </h1>
        <p className="text-white/80 max-w-md font-mono text-sm leading-relaxed">
          {zhTW.waitingDesc}
        </p>
        <p className="mt-4 text-white/50 text-xs font-mono">
          {zhTW.waitingNote}
        </p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 flex items-center gap-2 text-yellow-500/80 text-xs font-mono"
        >
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
          審核進行中
        </motion.div>
      </motion.div>
    </CodeseoulLayout>
  );
}
