'use client';

import { CodeseoulLayout } from '@/components/layout/CodeseoulLayout';
import { motion } from 'framer-motion';
import { Clock, Mail, AlertCircle } from 'lucide-react';

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
          href="mailto:support@codeseoul.kr"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded border border-white/20 text-white/70 text-sm font-mono hover:bg-white/5 transition-colors"
        >
          <Mail className="w-4 h-4" />
          聯繫客服
        </motion.a>
      </motion.div>
    </CodeseoulLayout>
  );
}
