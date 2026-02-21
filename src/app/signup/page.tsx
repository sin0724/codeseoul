'use client';

import Link from 'next/link';
import { SignupForm } from '@/components/auth/SignupForm';
import { motion } from 'framer-motion';

export default function SignupPage() {
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
        <p className="mt-2 text-sm text-white/60">代理註冊</p>
      </motion.div>
      <SignupForm />
    </div>
  );
}
