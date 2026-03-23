'use client';

import { getTierInfo } from '@/lib/codeseoul/tier-program';
import type { ProgramTier } from '@/lib/codeseoul/types';

interface TierBadgeProps {
  tier: ProgramTier | null | undefined;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function TierBadge({ tier, size = 'md', className = '' }: TierBadgeProps) {
  const info = getTierInfo(tier as ProgramTier);
  if (!info) return null;

  const sizeClass =
    size === 'sm' ? 'px-2 py-0.5 text-xs' : size === 'lg' ? 'px-4 py-2 text-base' : 'px-3 py-1 text-sm';

  return (
    <span
      className={`inline-flex items-center rounded-full border border-[#E11D48]/40 bg-[#E11D48]/10 font-mono font-bold text-[#E11D48] ${sizeClass} ${className}`}
      title={info.id}
    >
      {info.id}
    </span>
  );
}
