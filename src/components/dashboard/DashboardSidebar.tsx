'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Target, ListTodo, User, Shield, BookOpen, Banknote, ClipboardList } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { TierBadge } from '@/components/dashboard/TierBadge';
import { ProfileCompletionBar } from '@/components/onboarding/ProfileCompletionBar';
import { useOnboardingContext } from '@/components/onboarding/OnboardingProvider';
import { zhTW } from '@/messages/kol/zh-TW';
import type { ProgramTier } from '@/lib/codeseoul/types';

const navItems = [
  { href: '/dashboard', label: (m: typeof zhTW) => m.newMissions, icon: Target, exact: true },
  { href: '/dashboard/my-missions', label: (m: typeof zhTW) => m.myMissions, icon: ListTodo, exact: false },
  { href: '/dashboard/applied-missions', label: (m: typeof zhTW) => m.appliedMissions, icon: ClipboardList, exact: false },
  { href: '/dashboard/payout-history', label: (m: typeof zhTW) => m.payoutHistory, icon: Banknote, exact: false },
  { href: '/dashboard/profile', label: (m: typeof zhTW) => m.profile, icon: User, exact: false },
  { href: '/dashboard/tier-guide', label: (m: typeof zhTW) => m.tierGuide, icon: BookOpen, exact: false },
];

export function DashboardSidebar() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [tier, setTier] = useState<ProgramTier | null>(null);
  const pathname = usePathname();

  let onboardingContext: ReturnType<typeof useOnboardingContext> | null = null;
  try {
    onboardingContext = useOnboardingContext();
  } catch {
    // Context not available (admin user)
  }

  useEffect(() => {
    const check = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
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
      <aside className="w-full md:w-52 flex-shrink-0">
        <nav className="space-y-1">
          <Link
            href="/admin/codeseoul"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg border border-[#E11D48]/40 bg-[#E11D48]/10 text-[#E11D48] text-sm font-medium transition-colors"
          >
            <Shield className="w-4 h-4" />
            관리자 페이지
          </Link>
        </nav>
      </aside>
    );
  }

  return (
    <aside className="w-full md:w-52 flex-shrink-0">
      {/* 브랜딩 */}
      <div className="mb-5 pb-4 border-b border-white/[0.06]">
        <p className="font-mono text-xs text-white/30 tracking-widest uppercase">codeseoul</p>
        <p className="font-mono text-[10px] text-white/20 tracking-wider mt-0.5">KOL Mission Platform</p>
      </div>

      {/* 티어 배지 */}
      {tier && (
        <div className="mb-4">
          <TierBadge tier={tier} size="sm" />
        </div>
      )}

      {/* 온보딩 프로필 완성 바 */}
      {onboardingContext && onboardingContext.completion.percentage < 100 && (
        <div className="mb-4">
          <ProfileCompletionBar
            completion={onboardingContext.completion}
            onComplete={onboardingContext.reopenOnboarding}
          />
        </div>
      )}

      {/* 네비게이션 */}
      <nav className="space-y-0.5">
        {navItems.map(({ href, label, icon: Icon, exact }) => {
          const isActive = exact ? pathname === href : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm transition-all duration-150 ${
                isActive
                  ? 'bg-[#E11D48]/12 border border-[#E11D48]/30 text-[#E11D48] font-medium'
                  : 'text-white/60 hover:text-white/90 hover:bg-white/[0.05] border border-transparent'
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${isActive ? 'text-[#E11D48]' : 'text-white/40'}`} />
              {label(zhTW)}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
