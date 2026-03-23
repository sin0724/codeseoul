'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { zhTW } from '@/messages/kol/zh-TW';
import { motion } from 'framer-motion';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_CODESEUL_ADMIN_EMAIL;

export function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const supabase = createClient();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const userEmail = data.user?.email;

      if (userEmail === ADMIN_EMAIL) {
        window.location.href = '/admin/codeseoul';
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('status')
        .eq('id', data.user.id)
        .single();

      const status = profile?.status;
      if (status === 'approved') {
        window.location.href = '/dashboard';
      } else {
        window.location.href = '/waiting';
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : zhTW.loginFailed);
      setLoading(false);
    }
  };

  const isFormValid = email.trim() && password.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="w-full max-w-sm"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-xs font-mono text-white/50 mb-2 tracking-wider uppercase">
            {zhTW.email}
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] backdrop-blur-sm px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[#E11D48]/60 focus:outline-none focus:ring-1 focus:ring-[#E11D48]/30 focus:bg-white/[0.06] transition-all"
            placeholder="agent@codeseoul.kr"
          />
        </div>
        <div>
          <label htmlFor="password" className="block text-xs font-mono text-white/50 mb-2 tracking-wider uppercase">
            {zhTW.password}
          </label>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="w-full rounded-lg border border-white/[0.1] bg-white/[0.04] backdrop-blur-sm px-4 py-3 text-sm text-white placeholder:text-white/25 focus:border-[#E11D48]/60 focus:outline-none focus:ring-1 focus:ring-[#E11D48]/30 focus:bg-white/[0.06] transition-all"
          />
        </div>

        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-xs text-[#E11D48] font-mono bg-[#E11D48]/5 border border-[#E11D48]/20 rounded-lg px-3 py-2"
          >
            {error}
          </motion.p>
        )}

        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full rounded-lg bg-[#E11D48] px-4 py-3 text-sm font-semibold text-white transition-all hover:bg-[#BE123C] active:scale-[0.99] disabled:opacity-40 disabled:cursor-not-allowed mt-2"
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-3.5 h-3.5 border border-white/30 border-t-white rounded-full animate-spin" />
              {zhTW.loggingIn}
            </span>
          ) : (
            zhTW.login
          )}
        </button>
      </form>

      <p className="mt-6 text-center text-xs text-white/35">
        {zhTW.noAccount}{' '}
        <Link href="/signup" className="text-[#E11D48]/80 hover:text-[#E11D48] transition-colors underline underline-offset-2">
          {zhTW.signup}
        </Link>
      </p>
    </motion.div>
  );
}
