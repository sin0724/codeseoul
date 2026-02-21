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
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="w-full max-w-md text-center space-y-4"
      >
        <p className="text-white/90 font-mono">{zhTW.signupSuccess}</p>
        <p className="text-sm text-white/60 font-mono">{zhTW.signupSuccessDesc}</p>
        <Link
          href="/login"
          className="inline-block mt-4 text-[#FF0000] hover:underline font-mono"
        >
          {zhTW.goToLoginPage}
        </Link>
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
