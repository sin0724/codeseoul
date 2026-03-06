'use client';

import { User, Instagram, Phone, CreditCard, Check } from 'lucide-react';
import { zhTW } from '@/messages/kol/zh-TW';
import type { ProfileCompletionResult } from '@/hooks/useOnboarding';

interface ProfileCompletionBarProps {
  completion: ProfileCompletionResult;
  showDetails?: boolean;
  onComplete?: () => void;
}

const completionItems = [
  { key: 'fullName', icon: User, label: '姓名' },
  { key: 'followerCount', icon: User, label: '粉絲數' },
  { key: 'snsLinks', icon: Instagram, label: '社群連結' },
  { key: 'contact', icon: Phone, label: '聯繫方式' },
  { key: 'bankInfo', icon: CreditCard, label: '付款資訊' },
] as const;

export function ProfileCompletionBar({ completion, showDetails = false, onComplete }: ProfileCompletionBarProps) {
  const { percentage, checks } = completion;

  const getProgressColor = () => {
    if (percentage >= 100) return 'bg-green-500';
    if (percentage >= 60) return 'bg-yellow-500';
    return 'bg-[#FF0000]';
  };

  return (
    <div className="rounded border border-white/10 bg-white/5 p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-mono text-white/80">{zhTW.profileCompletion}</span>
        <span className={`text-sm font-mono font-bold ${percentage >= 100 ? 'text-green-400' : 'text-white'}`}>
          {percentage}%
        </span>
      </div>
      
      <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden mb-3">
        <div
          className={`h-full transition-all duration-500 ease-out ${getProgressColor()}`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {showDetails && (
        <div className="grid grid-cols-5 gap-2 mt-4">
          {completionItems.map(({ key, icon: Icon, label }) => {
            const isComplete = checks[key as keyof typeof checks];
            return (
              <div
                key={key}
                className={`flex flex-col items-center gap-1 p-2 rounded border transition-colors ${
                  isComplete
                    ? 'border-green-500/30 bg-green-500/10'
                    : 'border-white/10 bg-white/5'
                }`}
              >
                <div className={`relative ${isComplete ? 'text-green-400' : 'text-white/40'}`}>
                  <Icon className="w-4 h-4" />
                  {isComplete && (
                    <Check className="absolute -top-1 -right-1 w-3 h-3 text-green-400" />
                  )}
                </div>
                <span className={`text-[10px] font-mono ${isComplete ? 'text-green-400' : 'text-white/40'}`}>
                  {label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {percentage < 100 && onComplete && (
        <button
          onClick={onComplete}
          className="mt-3 w-full rounded border border-[#FF0000]/50 bg-[#FF0000]/10 px-4 py-2 text-sm font-mono text-[#FF0000] hover:bg-[#FF0000]/20 transition-colors"
        >
          {zhTW.profileCompletionBannerCta}
        </button>
      )}
    </div>
  );
}

interface ProfileCompletionBannerProps {
  completion: ProfileCompletionResult;
  onComplete: () => void;
  onDismiss?: () => void;
}

export function ProfileCompletionBanner({ completion, onComplete, onDismiss }: ProfileCompletionBannerProps) {
  const { percentage } = completion;

  if (percentage >= 100) return null;

  return (
    <div className="rounded border border-[#FF0000]/30 bg-[#FF0000]/5 p-4 mb-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[#FF0000] font-mono font-bold text-sm">⚠️ {zhTW.profileCompletionBannerTitle}</span>
            <span className="text-white/60 font-mono text-xs">({percentage}% {zhTW.profileCompletion})</span>
          </div>
          <p className="text-white/70 font-mono text-sm">{zhTW.profileCompletionBannerDesc}</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onComplete}
            className="rounded bg-[#FF0000] px-4 py-2 text-sm font-mono font-bold text-white hover:bg-[#cc0000] transition-colors"
          >
            {zhTW.profileCompletionBannerCta}
          </button>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-white/40 hover:text-white/60 p-2"
              aria-label={zhTW.close}
            >
              ✕
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
