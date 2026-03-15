'use client';

import React, { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { GrowthRoadmapWizard } from '@/components/modals/GrowthRoadmapWizard';
import { saveGrowthRoadmapAction } from '@/app/actions/growth-roadmap-actions';
import type { GoaLineOnboarding } from '@/types/goaline-onboarding';

const STORAGE_KEY = 'goaline_onboarding_draft';

export default function PlanPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const saveAfterAuth = searchParams.get('save') === '1';
  const [hasUser, setHasUser] = useState<boolean | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    supabase.auth.getUser().then(({ data: { user } }) => setHasUser(!!user));
  }, []);

  // After OAuth redirect: user is logged in, save draft from localStorage and go to plan
  useEffect(() => {
    if (!saveAfterAuth || hasUser !== true || saving) return;

    let raw: string | null = null;
    try {
      raw = localStorage.getItem(STORAGE_KEY);
    } catch (_) {}

    if (!raw) {
      router.replace('/plan');
      return;
    }

    setSaving(true);
    let parsed: GoaLineOnboarding;
    try {
      parsed = JSON.parse(raw) as GoaLineOnboarding;
    } catch {
      router.replace('/plan');
      setSaving(false);
      return;
    }

    saveGrowthRoadmapAction(parsed)
      .then((result) => {
        try {
          localStorage.removeItem(STORAGE_KEY);
        } catch (_) {}
        if (result?.planId) {
          router.replace(`/dashboard/plans/${result.planId}`);
        } else {
          router.replace('/plan');
        }
      })
      .catch(() => router.replace('/plan'))
      .finally(() => setSaving(false));
  }, [saveAfterAuth, hasUser, saving, router]);

  // Still determining auth or saving after auth
  if (hasUser === null || (saveAfterAuth && hasUser === true && saving)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-slate-500 font-medium">Loading…</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <GrowthRoadmapWizard
        onClose={() => router.push('/')}
        onSuccess={() => {}}
        requireAuthToSave={true}
        hasUser={hasUser}
        signInNextUrl="/plan?save=1"
      />
    </div>
  );
}
