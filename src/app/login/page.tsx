'use client';

import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 overflow-hidden">
      {/* 배경 그라디언트 */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(225,29,72,0.06)_0%,_transparent_60%)] pointer-events-none" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,_rgba(225,29,72,0.04)_0%,_transparent_50%)] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: 'easeOut' }}
        className="mb-10 text-center"
      >
        <Link href="/" className="font-mono text-3xl font-bold tracking-[0.2em] text-white hover:text-white/80 transition-colors">
          codeseoul
        </Link>
        <p className="mt-2 text-xs font-mono text-white/30 tracking-widest">任務存取</p>
      </motion.div>

      <LoginForm />
    </div>
  );
}
