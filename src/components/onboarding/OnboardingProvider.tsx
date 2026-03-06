'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useOnboarding, type OnboardingProfile, type ProfileCompletionResult } from '@/hooks/useOnboarding';
import { OnboardingWizard } from './OnboardingWizard';

interface OnboardingContextValue {
  profile: OnboardingProfile | null;
  loading: boolean;
  showOnboarding: boolean;
  currentStep: number;
  saving: boolean;
  completion: ProfileCompletionResult;
  reopenOnboarding: () => void;
  refetch: () => Promise<void>;
}

const OnboardingContext = createContext<OnboardingContextValue | null>(null);

export function useOnboardingContext() {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboardingContext must be used within OnboardingProvider');
  }
  return context;
}

interface OnboardingProviderProps {
  children: ReactNode;
}

export function OnboardingProvider({ children }: OnboardingProviderProps) {
  const {
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
    refetch,
  } = useOnboarding();

  return (
    <OnboardingContext.Provider
      value={{
        profile,
        loading,
        showOnboarding,
        currentStep,
        saving,
        completion,
        reopenOnboarding,
        refetch,
      }}
    >
      {children}
      {showOnboarding && (
        <OnboardingWizard
          profile={profile}
          currentStep={currentStep}
          completion={completion}
          saving={saving}
          onSaveProgress={saveProgress}
          onComplete={completeOnboarding}
          onSkip={skipOnboarding}
          onClose={skipOnboarding}
        />
      )}
    </OnboardingContext.Provider>
  );
}
