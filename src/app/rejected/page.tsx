'use client';

import { CodeseoulLayout } from '@/components/layout/CodeseoulLayout';
import { motion } from 'framer-motion';
import { Mail } from 'lucide-react';
import { zhTW } from '@/messages/kol/zh-TW';

export default function RejectedPage() {
  return (
    <CodeseoulLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mb-8 w-20 h-20 rounded-full bg-white/5 border border-white/10 flex items-center justify-center"
        >
          <svg className="w-10 h-10 text-white/40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </motion.div>
        
        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-white mb-4 font-mono tracking-wider"
        >
          {zhTW.rejectedTitle}
        </motion.h1>
        
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white/70 max-w-md font-mono text-sm leading-relaxed"
        >
          {zhTW.rejectedDesc}
        </motion.p>
        
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="mt-6 p-4 rounded-lg bg-white/5 border border-white/10 max-w-sm"
        >
          <p className="text-white/50 text-xs font-mono leading-relaxed">
            {zhTW.rejectedNote}
          </p>
        </motion.div>
        
        <motion.a
          href="mailto:support@codeseoul.kr"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-8 inline-flex items-center gap-2 px-6 py-3 rounded bg-white/10 text-white text-sm font-mono hover:bg-white/20 transition-colors"
        >
          <Mail className="w-4 h-4" />
          {zhTW.contactSupport}
        </motion.a>
      </motion.div>
    </CodeseoulLayout>
  );
}
