'use client';

import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { Profile, SnsLink } from '@/lib/codeseoul/types';

export interface OnboardingProfile extends Profile {
  onboarding_completed?: boolean;
  onboarding_completed_at?: string | null;
  onboarding_step?: number;
  first_login_at?: string | null;
}

export interface ProfileCompletionResult {
  percentage: number;
  checks: {
    snsLinks: boolean;
    followerCount: boolean;
    contact: boolean;
  };
  missingFields: string[];
}

export function calculateProfileCompletion(profile: OnboardingProfile | null): ProfileCompletionResult {
  if (!profile) {
    return {
      percentage: 0,
      checks: {
        snsLinks: false,
        followerCount: false,
        contact: false,
      },
      missingFields: ['snsLinks', 'followerCount', 'contact'],
    };
  }

  const snsLinks = (profile as { sns_links?: SnsLink[] }).sns_links;
  const hasSnsLinks = Array.isArray(snsLinks) && snsLinks.length > 0 && snsLinks.some(l => l.url?.trim());
  const hasContact = !!(profile.line_id?.trim() || profile.kakao_id?.trim());

  const checks = {
    snsLinks: hasSnsLinks,
    followerCount: profile.follower_count != null && profile.follower_count > 0,
    contact: hasContact,
  };

  const totalItems = 3;
  const completedCount = Object.values(checks).filter(Boolean).length;
  const percentage = Math.round((completedCount / totalItems) * 100);

  const missingFields: string[] = [];
  if (!checks.snsLinks) missingFields.push('snsLinks');
  if (!checks.followerCount) missingFields.push('followerCount');
  if (!checks.contact) missingFields.push('contact');

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
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const updateData: Record<string, unknown> = {
        onboarding_step: step,
        ...data,
      };

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id);

      if (error) {
        console.error('Failed to save onboarding progress:', error);
        throw new Error(error.message);
      }

      setCurrentStep(step);
      if (data) {
        setProfile(prev => prev ? { ...prev, ...data, onboarding_step: step } : null);
      }
    } finally {
      setSaving(false);
    }
  }, [supabase]);

  const completeOnboarding = useCallback(async () => {
    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        throw new Error('User not authenticated');
      }

      const { error } = await supabase
        .from('profiles')
        .update({
          onboarding_completed: true,
          onboarding_completed_at: new Date().toISOString(),
        })
        .eq('id', user.id);

      if (error) {
        console.error('Failed to complete onboarding:', error);
        throw new Error(error.message);
      }

      setProfile(prev => prev ? {
        ...prev,
        onboarding_completed: true,
        onboarding_completed_at: new Date().toISOString(),
      } : null);
      setShowOnboarding(false);
    } finally {
      setSaving(false);
    }
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
