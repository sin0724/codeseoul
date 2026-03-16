'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X, ChevronRight, ChevronLeft, Check, Plus, Trash2 } from 'lucide-react';
import { zhTW, t } from '@/messages/kol/zh-TW';
import { ProfileCompletionBar } from './ProfileCompletionBar';
import { parseFollowerCount } from '@/lib/codeseoul/follower-utils';
import type { OnboardingProfile, ProfileCompletionResult } from '@/hooks/useOnboarding';
import type { SnsLink } from '@/lib/codeseoul/types';

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

const TOTAL_STEPS = 5;

function parseSnsLinks(profile: OnboardingProfile | null): SnsLink[] {
  if (!profile) return [];
  const links = (profile as { sns_links?: SnsLink[] }).sns_links;
  if (Array.isArray(links) && links.length > 0) return links;
  if (profile.sns_link) return [{ label: 'SNS', url: profile.sns_link }];
  return [];
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
  const [step, setStep] = useState(currentStep);
  
  const [fullName, setFullName] = useState(profile?.full_name ?? '');
  const [followerInput, setFollowerInput] = useState(
    profile?.follower_count != null ? String(profile.follower_count) : ''
  );
  const [snsLinks, setSnsLinks] = useState<SnsLink[]>(() => parseSnsLinks(profile));
  const [lineId, setLineId] = useState(profile?.line_id ?? '');
  const [kakaoId, setKakaoId] = useState(profile?.kakao_id ?? '');
  const [beneficiaryName, setBeneficiaryName] = useState(profile?.bank_info?.beneficiary_name ?? '');
  const [addressEnglish, setAddressEnglish] = useState(profile?.bank_info?.address_english ?? '');
  const [phoneNumber, setPhoneNumber] = useState(profile?.bank_info?.phone_number ?? '');
  const [bankName, setBankName] = useState(profile?.bank_info?.bank_name ?? '');
  const [swiftCode, setSwiftCode] = useState(profile?.bank_info?.swift_code ?? '');
  const [bankAddress, setBankAddress] = useState(profile?.bank_info?.bank_address ?? '');
  const [accountNumber, setAccountNumber] = useState(profile?.bank_info?.account_number ?? '');
  const [iban, setIban] = useState(profile?.bank_info?.iban ?? '');
  const [skipBankInfo, setSkipBankInfo] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? '');
      setFollowerInput(profile.follower_count != null ? String(profile.follower_count) : '');
      setSnsLinks(parseSnsLinks(profile));
      setLineId(profile.line_id ?? '');
      setKakaoId(profile.kakao_id ?? '');
      setBeneficiaryName(profile.bank_info?.beneficiary_name ?? '');
      setAddressEnglish(profile.bank_info?.address_english ?? '');
      setPhoneNumber(profile.bank_info?.phone_number ?? '');
      setBankName(profile.bank_info?.bank_name ?? '');
      setSwiftCode(profile.bank_info?.swift_code ?? '');
      setBankAddress(profile.bank_info?.bank_address ?? '');
      setAccountNumber(profile.bank_info?.account_number ?? '');
      setIban(profile.bank_info?.iban ?? '');
    }
  }, [profile]);

  const addSnsLink = () => {
    setSnsLinks(prev => [...prev, { label: 'SNS', url: '' }]);
  };

  const updateSnsLink = (index: number, field: 'label' | 'url', value: string) => {
    setSnsLinks(prev => prev.map((l, i) => (i === index ? { ...l, [field]: value } : l)));
  };

  const removeSnsLink = (index: number) => {
    setSnsLinks(prev => prev.filter((_, i) => i !== index));
  };

  const saveCurrentStepData = async () => {
    const validLinks = snsLinks.filter(l => l.url?.trim());
    const parsedFollower = parseFollowerCount(followerInput);
    
    const data: Partial<OnboardingProfile> = {
      full_name: fullName,
      follower_count: parsedFollower ?? null,
      sns_links: validLinks.length > 0 ? validLinks : [],
      line_id: lineId.trim() || null,
      kakao_id: kakaoId.trim() || null,
    };

    if (!skipBankInfo) {
      data.bank_info = {
        beneficiary_name: beneficiaryName,
        address_english: addressEnglish,
        phone_number: phoneNumber,
        bank_name: bankName,
        swift_code: swiftCode.trim() || '',
        bank_address: bankAddress,
        account_number: accountNumber,
        iban: iban.trim() || undefined,
      };
    }

    await onSaveProgress(step, data);
  };

  const handleNext = async () => {
    try {
      await saveCurrentStepData();
      if (step < TOTAL_STEPS - 1) {
        setStep(step + 1);
        await onSaveProgress(step + 1);
      }
    } catch (err) {
      console.error('Error in handleNext:', err);
    }
  };

  const handlePrev = () => {
    if (step > 0) {
      setStep(step - 1);
    }
  };

  const handleFinish = async () => {
    try {
      await saveCurrentStepData();
      await onComplete();
    } catch (err) {
      console.error('Error in handleFinish:', err);
    }
  };

  const handleSkipStep = async () => {
    try {
      if (step < TOTAL_STEPS - 1) {
        setStep(step + 1);
        await onSaveProgress(step + 1);
      }
    } catch (err) {
      console.error('Error in handleSkipStep:', err);
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

      <p className="text-white/50 font-mono text-sm mb-6">{zhTW.onboardingWelcomeDesc}</p>
    </div>
  );

  const renderBasicInfoStep = () => (
    <div>
      <h2 className="text-xl font-bold font-mono mb-2">{zhTW.onboardingStepBasicInfo}</h2>
      <p className="text-white/60 font-mono text-sm mb-6">{zhTW.onboardingStepBasicInfoDesc}</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.name}</label>
          <input
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white"
          />
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.followerCount}</label>
          <input
            value={followerInput}
            onChange={(e) => setFollowerInput(e.target.value)}
            placeholder={zhTW.followerPlaceholder}
            className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
          />
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="block text-sm text-white/80 font-mono">{zhTW.snsLinks}</label>
            <button
              type="button"
              onClick={addSnsLink}
              className="flex items-center gap-1 text-xs text-[#FF0000] hover:underline font-mono"
            >
              <Plus className="w-3 h-3" />
              {zhTW.add}
            </button>
          </div>
          <div className="space-y-2">
            {snsLinks.map((link, index) => (
              <div key={index} className="flex gap-2">
                <input
                  value={link.label}
                  onChange={(e) => updateSnsLink(index, 'label', e.target.value)}
                  placeholder="예: Instagram"
                  className="flex-1 min-w-0 rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-white text-sm placeholder:text-white/40"
                />
                <input
                  type="url"
                  value={link.url}
                  onChange={(e) => updateSnsLink(index, 'url', e.target.value)}
                  placeholder="https://..."
                  className="flex-[2] min-w-0 rounded border border-white/20 bg-black/50 px-3 py-2 font-mono text-white text-sm placeholder:text-white/40"
                />
                <button
                  type="button"
                  onClick={() => removeSnsLink(index)}
                  className="p-2 text-white/50 hover:text-[#FF0000] shrink-0"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))}
            {snsLinks.length === 0 && (
              <button
                type="button"
                onClick={addSnsLink}
                className="w-full rounded border border-dashed border-white/20 bg-black/30 px-4 py-3 text-sm font-mono text-white/50 hover:border-white/40"
              >
                + 新增社群連結
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const renderContactStep = () => (
    <div>
      <h2 className="text-xl font-bold font-mono mb-2">{zhTW.onboardingStepContact}</h2>
      <p className="text-white/60 font-mono text-sm mb-2">{zhTW.onboardingStepContactDesc}</p>
      <p className="text-white/40 font-mono text-xs mb-6">{zhTW.onboardingStepContactHint}</p>

      <div className="space-y-4">
        <div>
          <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.lineId}</label>
          <input
            value={lineId}
            onChange={(e) => setLineId(e.target.value)}
            placeholder="예: line_id123"
            className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
          />
        </div>

        <div>
          <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.kakaoId}</label>
          <input
            value={kakaoId}
            onChange={(e) => setKakaoId(e.target.value)}
            placeholder="예: kakao_id123"
            className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
          />
        </div>
      </div>
    </div>
  );

  const renderPaymentStep = () => (
    <div>
      <h2 className="text-xl font-bold font-mono mb-2">{zhTW.onboardingStepPayment}</h2>
      <p className="text-white/60 font-mono text-sm mb-4">{zhTW.onboardingStepPaymentDesc}</p>

      <label className="flex items-center gap-2 mb-4 cursor-pointer">
        <input
          type="checkbox"
          checked={skipBankInfo}
          onChange={(e) => setSkipBankInfo(e.target.checked)}
          className="w-4 h-4 rounded border-white/20 bg-black/50"
        />
        <span className="text-sm font-mono text-white/70">{zhTW.onboardingStepPaymentSkip}</span>
      </label>

      {skipBankInfo && (
        <p className="text-white/40 font-mono text-xs mb-4">{zhTW.onboardingStepPaymentSkipHint}</p>
      )}

      {!skipBankInfo && (
        <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
          <div className="rounded border border-[#FF0000]/30 bg-[#FF0000]/5 px-4 py-3 font-mono text-sm">
            <p className="text-[#FF0000] font-medium">※ 注意</p>
            <p className="text-white/90 mt-1">{zhTW.bankNote}</p>
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.beneficiaryName}</label>
            <input
              value={beneficiaryName}
              onChange={(e) => setBeneficiaryName(e.target.value)}
              placeholder="e.g. WANG MING-CHEN"
              className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.addressEnglish}</label>
            <input
              value={addressEnglish}
              onChange={(e) => setAddressEnglish(e.target.value)}
              placeholder="e.g. No.123, Section 1, Zhongxiao E. Rd., Taipei"
              className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.phoneNumber}</label>
            <input
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="e.g. +886-2-12345678"
              className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.bankName}</label>
            <input
              value={bankName}
              onChange={(e) => setBankName(e.target.value)}
              placeholder="e.g. CTBC Bank"
              className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.swiftCode}</label>
            <input
              value={swiftCode}
              onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
              placeholder="e.g. CTCBTWTP"
              className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.bankAddress}</label>
            <input
              value={bankAddress}
              onChange={(e) => setBankAddress(e.target.value)}
              placeholder="e.g. No.123, Xinyi Rd., Taipei, Taiwan"
              className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.accountNumber}</label>
            <input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder="e.g. 12345678901234"
              className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
            />
          </div>

          <div>
            <label className="block text-sm text-white/80 mb-1 font-mono">{zhTW.iban}</label>
            <input
              value={iban}
              onChange={(e) => setIban(e.target.value.toUpperCase())}
              placeholder="e.g. TW1234567890123456789012"
              className="w-full rounded border border-white/20 bg-black/50 px-4 py-2 font-mono text-white placeholder:text-white/40"
            />
          </div>
        </div>
      )}
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
        return renderBasicInfoStep();
      case 2:
        return renderContactStep();
      case 3:
        return renderPaymentStep();
      case 4:
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
          onClick={handleSkipStep}
          className="rounded border border-white/20 px-4 py-2 font-mono text-white/60 hover:bg-white/5 transition-colors"
        >
          {zhTW.onboardingLater}
        </button>
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
          {step > 0 && step < TOTAL_STEPS - 1 && (
            <p className="text-center text-white/40 font-mono text-xs mb-4">
              {t('onboardingStep', { current: step, total: TOTAL_STEPS - 2 })}
            </p>
          )}
          {renderStep()}
          {renderButtons()}
        </div>
      </div>
    </div>
  );

  return createPortal(modal, document.body);
}
