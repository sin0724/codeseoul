'use client';

import { CodeseoulLayout } from '@/components/layout/CodeseoulLayout';
import { motion } from 'framer-motion';
import { XCircle } from 'lucide-react';
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
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mb-6"
        >
          <XCircle className="w-16 h-16 text-[#FF0000]" />
        </motion.div>
        <h1 className="text-xl font-bold text-[#FF0000] mb-4 font-mono tracking-wider">
          {zhTW.rejectedTitle}
        </h1>
        <p className="text-white/80 max-w-md font-mono text-sm leading-relaxed">
          {zhTW.rejectedDesc}
        </p>
        <p className="mt-4 text-white/50 text-xs font-mono">
          {zhTW.rejectedNote}
        </p>
        <motion.a
          href="mailto:support@codeseoul.kr"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 inline-flex items-center gap-2 px-4 py-2 rounded border border-white/20 text-white/70 text-sm font-mono hover:bg-white/5 transition-colors"
        >
          聯繫客服
        </motion.a>
      </motion.div>
    </CodeseoulLayout>
  );
}
