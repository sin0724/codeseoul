'use client';

import { CodeseoulLayout } from '@/components/layout/CodeseoulLayout';
import { motion } from 'framer-motion';
import { Clock, AlertCircle } from 'lucide-react';

export function WaitingContent() {
  return (
    <CodeseoulLayout>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4 max-w-lg mx-auto"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className="mb-6 w-20 h-20 rounded-full bg-yellow-500/10 border border-yellow-500/30 flex items-center justify-center"
        >
          <Clock className="w-10 h-10 text-yellow-500" />
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="text-xl font-bold text-white mb-4 font-mono tracking-wider"
        >
          申請審核中
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-white/70 font-mono text-sm leading-relaxed mb-6"
        >
          感謝您申請加入 codeseoul。我們的團隊正在審核您的資料，審核完成後將以郵件通知您。
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="w-full p-4 rounded-lg bg-white/5 border border-white/10 mb-6"
        >
          <div className="flex items-start gap-3 text-left">
            <AlertCircle className="w-5 h-5 text-yellow-500/80 flex-shrink-0 mt-0.5" />
            <div className="text-white/50 text-xs font-mono leading-relaxed space-y-2">
              <p>審核通常需要 1-3 個工作日。</p>
              <p>若超過 7 個工作日仍未收到通知，表示本次申請未能通過審核，敬請見諒。</p>
              <p>如有疑問，歡迎聯繫客服團隊。</p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="flex items-center gap-2 text-yellow-500/80 text-xs font-mono mb-6"
        >
          <span className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></span>
          審核進行中
        </motion.div>

        <motion.a
          href="https://www.instagram.com/humbleb_tw/"
          target="_blank"
          rel="noopener noreferrer"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-white/20 text-white/70 text-sm font-mono hover:bg-white/5 transition-colors"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
          </svg>
          聯繫客服
        </motion.a>
      </motion.div>
    </CodeseoulLayout>
  );
}
