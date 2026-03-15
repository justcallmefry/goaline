'use client';

import { WelcomeWizard, OnboardingData } from '@/components/modals/WelcomeWizard'; // Check path
import { saveOnboardingData } from '@/app/actions/onboarding-actions';
import { useState } from 'react';

export default function OnboardingWrapper() {
  const [isGenerating, setIsGenerating] = useState(false);

  const handleWizardSubmit = async (data: OnboardingData) => {
    setIsGenerating(true);
    // Call the Server Action we created in Step 2
    await saveOnboardingData(data); 
  };

  // We force 'show={true}' because on this page, the wizard is the ONLY thing to do
  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center">
      <WelcomeWizard 
        show={true} 
        onClose={() => {}} // User cannot close it, they must finish
        onSubmit={handleWizardSubmit}
        isGenerating={isGenerating}
      />
    </div>
  );
}