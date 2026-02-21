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
      if (status === 'pending') {
        window.location.href = '/waiting';
      } else if (status === 'rejected') {
        window.location.href = '/rejected';
      } else {
        window.location.href = '/dashboard';
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : zhTW.loginFailed);
      setLoading(false);
    }
  };

  const isFormValid = email.trim() && password.trim();

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="w-full max-w-md"
    >
      <form onSubmit={handleSubmit} className="space-y-6">
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
            className="w-full rounded border border-white/20 bg-black/50 px-4 py-3 font-mono text-white placeholder:text-white/40 focus:border-[#FF0000] focus:outline-none focus:ring-1 focus:ring-[#FF0000]"
          />
        </div>
        {error && (
          <p className="text-sm text-[#FF0000] font-mono">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !isFormValid}
          className="w-full rounded bg-[#FF0000] px-4 py-3 font-mono font-bold text-white transition-colors hover:bg-[#cc0000] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? zhTW.loggingIn : zhTW.login}
        </button>
      </form>
      <p className="mt-6 text-center text-sm text-white/60">
        {zhTW.noAccount}{' '}
        <Link href="/signup" className="text-[#FF0000] hover:underline">
          {zhTW.signup}
        </Link>
      </p>
    </motion.div>
  );
}
