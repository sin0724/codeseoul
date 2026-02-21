'use client';

import Link from 'next/link';
import { LoginForm } from '@/components/auth/LoginForm';
import { motion } from 'framer-motion';

export default function LoginPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="mb-8 text-center"
      >
        <Link href="/" className="font-mono text-2xl font-bold tracking-widest text-white">
          codeseoul
        </Link>
        <p className="mt-2 text-sm text-white/60">任務存取</p>
      </motion.div>
      <LoginForm />
    </div>
  );
}
