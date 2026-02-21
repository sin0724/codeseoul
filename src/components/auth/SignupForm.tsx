'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { zhTW } from '@/messages/kol/zh-TW';
import { motion } from 'framer-motion';

export function SignupForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;
      setSuccess(true);
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : zhTW.signupFailed);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md text-center"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2, type: 'spring', stiffness: 200 }}
          className="mx-auto mb-6 w-20 h-20 rounded-full bg-gradient-to-br from-[#FF0000]/20 to-[#FF0000]/5 border border-[#FF0000]/30 flex items-center justify-center"
        >
          <svg
            className="w-10 h-10 text-[#FF0000]"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <motion.path
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M5 13l4 4L19 7"
            />
          </svg>
        </motion.div>

        <motion.h2
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-xl font-bold text-white mb-3 font-mono tracking-wide"
        >
          {zhTW.signupSuccess}
        </motion.h2>

        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="text-white/70 font-mono text-sm leading-relaxed mb-6"
        >
          {zhTW.signupSuccessDesc}
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white/5 border border-white/10 rounded-lg p-4 mb-6"
        >
          <div className="flex items-center justify-center gap-3 text-white/60 text-xs font-mono">
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#FF0000]"></span>
              註冊完成
            </span>
            <span className="text-white/30">→</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white/30 animate-pulse"></span>
              審核中
            </span>
            <span className="text-white/30">→</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-white/20"></span>
              開始任務
            </span>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
        >
          <Link
            href="/login"
            className="inline-flex items-center gap-2 px-6 py-3 rounded bg-[#FF0000] text-white font-mono font-bold transition-all hover:bg-[#cc0000] hover:scale-105"
          >
            {zhTW.goToLoginPage}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </motion.div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label htmlFor="fullName" className="block text-sm font-mono text-white/80 mb-2">
            {zhTW.name}
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded border border-white/20 bg-black/50 px-4 py-3 font-mono text-white placeholder:text-white/40 focus:border-[#FF0000] focus:outline-none focus:ring-1 focus:ring-[#FF0000]"
            placeholder="홍길동"
          />
        </div>
        <div>
          <label htmlFor="email" className="block text-sm font-mono text-white/80 mb-2">
            {zhTW.email}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded border border-white/20 bg-black/50 px-4 py-3 font-mono text-white placeholder:text-white/40 focus:border-[#FF0000] focus:outline-none focus:ring-1 focus:ring-[#FF0000]"
            placeholder="agent@codeseoul.kr"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-sm font-mono text-white/80 mb-2">
            {zhTW.password}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
            className="w-full rounded border border-white/20 bg-black/50 px-4 py-3 font-mono text-white placeholder:text-white/40 focus:border-[#FF0000] focus:outline-none focus:ring-1 focus:ring-[#FF0000]"
          />
        </div>
        {error && (
          <p className="text-sm text-[#FF0000] font-mono">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading}
          className="w-full rounded bg-[#FF0000] px-4 py-3 font-mono font-bold text-white transition-colors hover:bg-[#cc0000] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? zhTW.signingUp : zhTW.signup}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-white/60">
        {zhTW.haveAccount}{' '}
        <Link href="/login" className="text-[#FF0000] hover:underline">
          {zhTW.login}
        </Link>
      </p>
    </motion.div>
  );
}
