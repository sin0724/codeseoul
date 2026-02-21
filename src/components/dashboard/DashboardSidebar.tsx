'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Target, ListTodo, User, Shield, BookOpen, Banknote, ClipboardList } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TierBadge } from '@/components/dashboard/TierBadge';
import { zhTW } from '@/messages/kol/zh-TW';
import type { ProgramTier } from '@/lib/codeseoul/types';

export function DashboardSidebar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tier, setTier] = useState<ProgramTier | null>(null);

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { session } } = await supabase.auth.getSession();
      const user = session?.user;
      const adminEmail = process.env.NEXT_PUBLIC_CODESEUL_ADMIN_EMAIL;
      setIsAdmin(!!user && !!adminEmail && user.email === adminEmail);
      if (user && !(adminEmail && user.email === adminEmail)) {
        const { data: p } = await supabase.from('profiles').select('tier').eq('id', user.id).single();
        setTier((p as { tier?: ProgramTier })?.tier ?? null);
      }
    };
    check();
  }, []);

  if (isAdmin) {
    return (
      <aside className="w-full md:w-48 flex-shrink-0">
        <nav className="space-y-1">
          <Link
            href="/admin/codeseoul"
            className="flex items-center gap-2 px-4 py-2 rounded border border-[#FF0000]/50 bg-[#FF0000]/10 text-[#FF0000] font-mono text-sm"
          >
            <Shield className="w-4 h-4" />
            관리자 페이지
          </Link>
        </nav>
      </aside>
    );
  }

  return (
    <aside className="w-full md:w-48 flex-shrink-0">
      {tier && (
        <div className="mb-4">
          <TierBadge tier={tier} size="sm" />
        </div>
      )}
      <nav className="space-y-1">
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 rounded border border-white/10 hover:border-[#FF0000]/50 hover:bg-[#FF0000]/5 text-white/90 font-mono text-sm transition-colors"
        >
          <Target className="w-4 h-4" />
          {zhTW.newMissions}
        </Link>
        <Link
          href="/dashboard/my-missions"
          className="flex items-center gap-2 px-4 py-2 rounded border border-white/10 hover:border-[#FF0000]/50 hover:bg-[#FF0000]/5 text-white/90 font-mono text-sm transition-colors"
        >
          <ListTodo className="w-4 h-4" />
          {zhTW.myMissions}
        </Link>
        <Link
          href="/dashboard/applied-missions"
          className="flex items-center gap-2 px-4 py-2 rounded border border-white/10 hover:border-[#FF0000]/50 hover:bg-[#FF0000]/5 text-white/90 font-mono text-sm transition-colors"
        >
          <ClipboardList className="w-4 h-4" />
          {zhTW.appliedMissions}
        </Link>
        <Link
          href="/dashboard/payout-history"
          className="flex items-center gap-2 px-4 py-2 rounded border border-white/10 hover:border-[#FF0000]/50 hover:bg-[#FF0000]/5 text-white/90 font-mono text-sm transition-colors"
        >
          <Banknote className="w-4 h-4" />
          {zhTW.payoutHistory}
        </Link>
        <Link
          href="/dashboard/profile"
          className="flex items-center gap-2 px-4 py-2 rounded border border-white/10 hover:border-[#FF0000]/50 hover:bg-[#FF0000]/5 text-white/90 font-mono text-sm transition-colors"
        >
          <User className="w-4 h-4" />
          {zhTW.profile}
        </Link>
        <Link
          href="/dashboard/tier-guide"
          className="flex items-center gap-2 px-4 py-2 rounded border border-white/10 hover:border-[#FF0000]/50 hover:bg-[#FF0000]/5 text-white/90 font-mono text-sm transition-colors"
        >
          <BookOpen className="w-4 h-4" />
          {zhTW.tierGuide}
        </Link>
      </nav>
    </aside>
  );
}
