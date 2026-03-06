'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, SnsLink, BankInfo } from '@/lib/codeseoul/types';

export interface OnboardingProfile extends Profile {
  onboarding_completed?: boolean;
  onboarding_completed_at?: string | null;
  onboarding_step?: number;
  first_login_at?: string | null;
}

export interface ProfileCompletionResult {
  percentage: number;
  checks: {
    fullName: boolean;
    followerCount: boolean;
    snsLinks: boolean;
    contact: boolean;
    bankInfo: boolean;
  };
  missingFields: string[];
}

export function calculateProfileCompletion(profile: OnboardingProfile | null): ProfileCompletionResult {
  if (!profile) {
    return {
      percentage: 0,
      checks: {
        fullName: false,
        followerCount: false,
        snsLinks: false,
        contact: false,
        bankInfo: false,
      },
      missingFields: ['fullName', 'followerCount', 'snsLinks', 'contact', 'bankInfo'],
    };
  }

  const snsLinks = (profile as { sns_links?: SnsLink[] }).sns_links;
  const hasSnsLinks = Array.isArray(snsLinks) && snsLinks.length > 0 && snsLinks.some(l => l.url?.trim());
  const hasContact = !!(profile.line_id?.trim() || profile.kakao_id?.trim());
  const bankInfo = profile.bank_info as BankInfo | undefined;
  const hasBankInfo = !!(
    bankInfo?.beneficiary_name?.trim() &&
    bankInfo?.bank_name?.trim() &&
    bankInfo?.account_number?.trim()
  );

  const checks = {
    fullName: !!profile.full_name?.trim(),
    followerCount: profile.follower_count != null && profile.follower_count > 0,
    snsLinks: hasSnsLinks,
    contact: hasContact,
    bankInfo: hasBankInfo,
  };

  const completedCount = Object.values(checks).filter(Boolean).length;
  const percentage = Math.round((completedCount / 5) * 100);

  const missingFields: string[] = [];
  if (!checks.fullName) missingFields.push('fullName');
  if (!checks.followerCount) missingFields.push('followerCount');
  if (!checks.snsLinks) missingFields.push('snsLinks');
  if (!checks.contact) missingFields.push('contact');
  if (!checks.bankInfo) missingFields.push('bankInfo');

  return { percentage, checks, missingFields };
}

export function useOnboarding() {
  const [profile, setProfile] = useState<OnboardingProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const supabase = createClient();

  const fetchProfile = useCallback(async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (profileData) {
      setProfile(profileData as OnboardingProfile);
      setCurrentStep(profileData.onboarding_step ?? 0);
      
      if (profileData.status === 'approved' && !profileData.onboarding_completed) {
        if (!profileData.first_login_at) {
          await supabase
            .from('profiles')
            .update({ first_login_at: new Date().toISOString() })
            .eq('id', user.id);
        }
        setShowOnboarding(true);
      }
    }
    setLoading(false);
  }, [supabase]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const saveProgress = useCallback(async (step: number, data?: Partial<OnboardingProfile>) => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    const updateData: Record<string, unknown> = {
      onboarding_step: step,
      ...data,
    };

    await supabase
      .from('profiles')
      .update(updateData)
      .eq('id', user.id);

    setCurrentStep(step);
    if (data) {
      setProfile(prev => prev ? { ...prev, ...data, onboarding_step: step } : null);
    }
    setSaving(false);
  }, [supabase]);

  const completeOnboarding = useCallback(async () => {
    setSaving(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setSaving(false);
      return;
    }

    await supabase
      .from('profiles')
      .update({
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      })
      .eq('id', user.id);

    setProfile(prev => prev ? {
      ...prev,
      onboarding_completed: true,
      onboarding_completed_at: new Date().toISOString(),
    } : null);
    setShowOnboarding(false);
    setSaving(false);
  }, [supabase]);

  const skipOnboarding = useCallback(async () => {
    setShowOnboarding(false);
  }, []);

  const reopenOnboarding = useCallback(() => {
    setShowOnboarding(true);
  }, []);

  const completion = calculateProfileCompletion(profile);

  return {
    profile,
    loading,
    showOnboarding,
    currentStep,
    setCurrentStep,
    saving,
    completion,
    saveProgress,
    completeOnboarding,
    skipOnboarding,
    reopenOnboarding,
    refetch: fetchProfile,
  };
}
