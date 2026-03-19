'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ChevronLeft, Check, Instagram, MessageCircle } from 'lucide-react';
import { zhTW } from '@/messages/kol/zh-TW';
import { ProfileCompletionBar } from './ProfileCompletionBar';
import { parseFollowerCount } from '@/lib/codeseoul/follower-utils';
import type { OnboardingProfile, ProfileCompletionResult } from '@/hooks/useOnboarding';

interface OnboardingWizardProps {
  profile: OnboardingProfile | null;
  currentStep: number;
  completion: ProfileCompletionResult;
  saving: boolean;
  onSaveProgress: (step: number, data?: Partial<OnboardingProfile>) => Promise<void>;
  onComplete: () => Promise<void>;
  onSkip: () => void;
  onClose: () => void;
}

const TOTAL_STEPS = 4;

function getInstagramUrl(profile: OnboardingProfile | null): string {
  if (!profile) return '';
  const links = (profile as { sns_links?: { label: string; url: string }[] }).sns_links;
  if (Array.isArray(links)) {
    const ig = links.find(l => l.label?.toLowerCase().includes('instagram') || l.url?.includes('instagram.com'));
    if (ig) return ig.url;
    if (links.length > 0 && links[0].url) return links[0].url;
  }
  if (profile.sns_link) return profile.sns_link;
  return '';
}

export function OnboardingWizard({
  profile,
  currentStep,
  completion,
  saving,
  onSaveProgress,
  onComplete,
  onSkip,
  onClose,
}: OnboardingWizardProps) {
  const [mounted, setMounted] = useState(false);
  const [step, setStep] = useState(Math.min(currentStep, TOTAL_STEPS - 1));
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [instagramUrl, setInstagramUrl] = useState(() => getInstagramUrl(profile));
  const [followerInput, setFollowerInput] = useState(
    profile?.follower_count != null ? String(profile.follower_count) : ''
  );
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [lineId, setLineId] = useState(profile?.line_id ?? '');
  const [kakaoId, setKakaoId] = useState(profile?.kakao_id ?? '');

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (profile) {
      setInstagramUrl(getInstagramUrl(profile));
      setFollowerInput(profile.follower_count != null ? String(profile.follower_count) : '');
      setFullName(profile.full_name ?? '');
      setLineId(profile.line_id ?? '');
      setKakaoId(profile.kakao_id ?? '');
    }
  }, [profile]);

  const saveCurrentStepData = async () => {
    const parsedFollower = parseFollowerCount(followerInput);
    const snsLinks = instagramUrl.trim()
      ? [{ label: 'Instagram', url: instagramUrl.trim() }]
      : [];

    const data: Partial<OnboardingProfile> = {
      full_name: fullName || null,
      follower_count: parsedFollower ?? null,
      sns_links: snsLinks,
      line_id: lineId.trim() || null,
      kakao_id: kakaoId.trim() || null,
    };

    await onSaveProgress(step, data);
  };

  const handleNext = async () => {
    setErrorMsg(null);
    try {
      await saveCurrentStepData();
      if (step < TOTAL_STEPS - 1) {
        const nextStep = step + 1;
        setStep(nextStep);
        await onSaveProgress(nextStep);
      }
    } catch (err) {
      console.error('Error in handleNext:', err);
      setErrorMsg('儲存失敗，請稍後再試');
    }
  };

  const handlePrev = () => {
    setErrorMsg(null);
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    setErrorMsg(null);
    try {
      await saveCurrentStepData();
      await onComplete();
    } catch (err) {
      console.error('Error in handleFinish:', err);
      setErrorMsg('儲存失敗，請稍後再試');
    }
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center gap-2 mb-6">
      {Array.from({ length: TOTAL_STEPS }).map((_, i) => (
        <div
          key={i}
          className={`w-3 h-3 rounded-full transition-colors ${
            i === step
              ? 'bg-[#FF0000]'
              : i < step
              ? 'bg-green-500'
              : 'bg-white/20'
          }`}
        />
      ))}
    </div>
  );

  const renderWelcomeStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold font-mono mb-2">{zhTW.onboardingWelcomeTitle}</h2>
      <p className="text-white/60 font-mono mb-6">{zhTW.onboardingWelcomeSubtitle}</p>

      <div className="space-y-3 mb-8">
        {[zhTW.onboardingFeature1, zhTW.onboardingFeature2, zhTW.onboardingFeature3].map((feature, i) => (
          <div key={i} className="flex items-center gap-3 justify-center text-white/80 font-mono">
            <span className="text-lg">{['📋', '💰', '📈'][i]}</span>
            <span>{feature}</span>
          </div>
        ))}
      </div>

      <div className="rounded border border-white/10 bg-white/5 px-4 py-3 mb-6">
        <p className="text-white/60 font-mono text-sm">
          只需填寫 Instagram 連結和粉絲數即可開始！
        </p>
      </div>
    </div>
  );

  const renderMainInfoStep = () => (
    <div>
      <h2 className="text-xl font-bold font-mono mb-1">填寫您的資料</h2>
      <p className="text-white/50 font-mono text-sm mb-6">只需 2 個必填項目，30 秒即可完成</p>

      <div className="space-y-5">
        <div className="rounded border border-[#FF0000]/40 bg-[#FF0000]/5 p-4">
          <div className="flex items-center gap-2 mb-3">
            <Instagram className="w-5 h-5 text-[#FF0000]" />
            <label className="text-sm font-bold text-white font-mono">
              Instagram 連結
              <span className="ml-1 text-[#FF0000]">*</span>
            </label>
          </div>
          <input
            value={instagramUrl}
            onChange={(e) => setInstagramUrl(e.target.value)}
            placeholder="https://www.instagram.com/yourname"
            className="w-full rounded border border-[#FF0000]/30 bg-black/50 px-4 py-3 font-mono text-white placeholder:text-white/30 focus:border-[#FF0000] focus:outline-none focus:ring-1 focus:ring-[#FF0000]"
          />
          <p className="text-xs text-white/40 font-mono mt-2">
            請貼上您的 Instagram 個人頁面網址
          </p>
        </div>

        <div className="rounded border border-[#FF0000]/40 bg-[#FF0000]/5 p-4">
          <label className="block text-sm font-bold text-white mb-3 font-mono">
            粉絲規模
            <span className="ml-1 text-[#FF0000]">*</span>
          </label>
          <input
            value={followerInput}
            onChange={(e) => setFollowerInput(e.target.value)}
            placeholder={zhTW.followerPlaceholder}
            className="w-full rounded border border-[#FF0000]/30 bg-black/50 px-4 py-3 font-mono text-white placeholder:text-white/30 focus:border-[#FF0000] focus:outline-none focus:ring-1 focus:ring-[#FF0000]"
          />
          <p className="text-xs text-white/40 font-mono mt-2">
            例：1萬、10000、10k
          </p>
        </div>

        <div className="border-t border-white/10 pt-4">
          <label className="block text-sm text-white/60 mb-1 font-mono">{zhTW.name} (選填)</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
          />
        </div>
      </div>
    </div>
  );

  const renderContactStep = () => (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <MessageCircle className="w-5 h-5 text-[#FF0000]" />
        <h2 className="text-xl font-bold font-mono">{zhTW.onboardingStepContact}</h2>
      </div>
      <p className="text-white/50 font-mono text-sm mb-2">{zhTW.onboardingStepContactDesc}</p>
      <p className="text-white/40 font-mono text-xs mb-6">{zhTW.onboardingStepContactHint}</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.lineId}</label>
          <input
            value={lineId}
            onChange={(e) => setLineId(e.target.value)}
            placeholder="예: line_id123"
            className="w-full rounded border border-white/20 bg-black/50 px-4 py-3 font-mono text-white placeholder:text-white/40 focus:border-[#FF0000] focus:outline-none focus:ring-1 focus:ring-[#FF0000]"
          />
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.kakaoId}</label>
          <input
            value={kakaoId}
            onChange={(e) => setKakaoId(e.target.value)}
            placeholder="예: kakao_id123"
            className="w-full rounded border border-white/20 bg-black/50 px-4 py-3 font-mono text-white placeholder:text-white/40 focus:border-[#FF0000] focus:outline-none focus:ring-1 focus:ring-[#FF0000]"
          />
        </div>
      </div>
    </div>
  );

  const renderCompleteStep = () => (
    <div className="text-center">
      <h2 className="text-2xl font-bold font-mono mb-2">{zhTW.onboardingCompleteTitle}</h2>
      <p className="text-white/60 font-mono mb-6">{zhTW.onboardingCompleteSubtitle}</p>

      <ProfileCompletionBar completion={completion} showDetails />

      <div className="mt-6 space-y-2 text-left">
        <p className="text-white/50 font-mono text-sm mb-2">💡 提示：</p>
        {[zhTW.onboardingCompleteTip1, zhTW.onboardingCompleteTip2, zhTW.onboardingCompleteTip3].map((tip, i) => (
          <div key={i} className="flex items-center gap-2 text-white/70 font-mono text-sm">
            <Check className="w-4 h-4 text-green-400 shrink-0" />
            <span>{tip}</span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStep = () => {
    switch (step) {
      case 0:
        return renderWelcomeStep();
      case 1:
        return renderMainInfoStep();
      case 2:
        return renderContactStep();
      case 3:
        return renderCompleteStep();
      default:
        return null;
    }
  };

  const renderButtons = () => {
    if (step === 0) {
      return (
        <div className="flex gap-3 mt-6">
          <button
            onClick={onSkip}
            className="flex-1 rounded border border-white/20 px-4 py-2 font-mono text-white/60 hover:bg-white/5 transition-colors"
          >
            {zhTW.onboardingSkip}
          </button>
          <button
            onClick={handleNext}
            disabled={saving}
            className="flex-1 rounded bg-[#FF0000] px-4 py-2 font-mono font-bold text-white hover:bg-[#cc0000] disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {zhTW.onboardingStart}
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      );
    }

    if (step === TOTAL_STEPS - 1) {
      return (
        <div className="flex gap-3 mt-6">
          <button
            onClick={handlePrev}
            className="flex items-center gap-1 rounded border border-white/20 px-4 py-2 font-mono text-white/60 hover:bg-white/5 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
            {zhTW.onboardingPrev}
          </button>
          <button
            onClick={handleFinish}
            disabled={saving}
            className="flex-1 rounded bg-[#FF0000] px-4 py-2 font-mono font-bold text-white hover:bg-[#cc0000] disabled:opacity-50"
          >
            {saving ? '...' : zhTW.onboardingCompleteCta}
          </button>
        </div>
      );
    }

    const handleSkipStep = async () => {
      setErrorMsg(null);
      try {
        if (step < TOTAL_STEPS - 1) {
          const nextStep = step + 1;
          setStep(nextStep);
          await onSaveProgress(nextStep);
        }
      } catch (err) {
        console.error('Error in handleSkipStep:', err);
        setErrorMsg('儲存失敗，請稍後再試');
      }
    };

    return (
      <div className="flex gap-3 mt-6">
        <button
          onClick={handlePrev}
          className="flex items-center gap-1 rounded border border-white/20 px-4 py-2 font-mono text-white/60 hover:bg-white/5 transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          {zhTW.onboardingPrev}
        </button>
        {step === 2 && (
          <button
            onClick={handleSkipStep}
            className="rounded border border-white/20 px-4 py-2 font-mono text-white/60 hover:bg-white/5 transition-colors"
          >
            {zhTW.onboardingLater}
          </button>
        )}
        <button
          onClick={handleNext}
          disabled={saving}
          className="flex-1 rounded bg-[#FF0000] px-4 py-2 font-mono font-bold text-white hover:bg-[#cc0000] disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {saving ? '...' : zhTW.onboardingNext}
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    );
  };

  if (!mounted) return null;

  const modal = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="relative w-full max-w-lg bg-[#0a0a0a] border border-white/10 rounded-lg shadow-2xl max-h-[90vh] overflow-hidden">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-white/40 hover:text-white/60 z-10"
          aria-label={zhTW.close}
        >
          <X className="w-5 h-5" />
        </button>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-2rem)]">
          {renderStepIndicator()}
          {errorMsg && (
            <div className="mb-4 rounded border border-red-500/50 bg-red-500/10 px-4 py-2 text-red-400 font-mono text-sm">
              {errorMsg}
            </div>
          )}
          {renderStep()}
          {renderButtons()}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
