'use client';

import { CodeseoulLayout } from '@/components/layout/CodeseoulLayout';
import { motion } from 'framer-motion';
import { ShieldAlert } from 'lucide-react';
import { zhTW } from '@/messages/kol/zh-TW';

export default function WaitingPage() {
  return (
    <CodeseoulLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4"
      >
        <ShieldAlert className="w-16 h-16 text-[#FF0000] mb-6" />
        <h1 className="text-xl font-bold text-white mb-4 font-mono tracking-wider">
          ACCESS DENIED
        </h1>
        <p className="text-white/80 max-w-md font-mono text-sm leading-relaxed">
          {zhTW.waitingDesc}
        </p>
        <p className="mt-4 text-white/50 text-xs font-mono">
          {zhTW.waitingNote}
        </p>
      </motion.div>
    </CodeseoulLayout>
  );
}
