'use client';

import { useRouter } from 'next/navigation';
import { WelcomeWizard, OnboardingData } from '@/components/modals/WelcomeWizard';
import { saveOnboardingData } from '@/app/actions/onboarding-actions';
import { useState } from 'react';

export default function OnboardingWrapper() {
  const router = useRouter();
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleWizardSubmit = async (data: OnboardingData) => {
    setError(null);
    setIsGenerating(true);
    try {
      const result = await saveOnboardingData(data);
      if (result?.error) {
        setError(result.error);
        setIsGenerating(false);
        return;
      }
      router.push('/dashboard/plans');
    } catch (err: unknown) {
      if (err != null && typeof err === 'object' && 'digest' in err && String((err as { digest?: string }).digest) === 'NEXT_REDIRECT') {
        return;
      }
      setError('Something went wrong. Please try again.');
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4">
      {error && (
        <div className="mb-4 w-full max-w-2xl rounded-xl bg-red-50 border border-red-200 text-red-700 px-4 py-3 text-sm font-medium">
          {error}
        </div>
      )}
      <WelcomeWizard
        show={true}
        onClose={() => {}}
        onSubmit={handleWizardSubmit}
        isGenerating={isGenerating}
      />
    </div>
  );
}