'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerSupabase } from '@/utils/supabase/server'
import type { RoadmapInputs } from '@/lib/growth-roadmap'
import { buildMoneyMapData } from '@/lib/growth-roadmap'
import { buildFullPlanFromRoadmap } from '@/lib/build-full-plan'
import type { GoaLineOnboarding } from '@/types/goaline-onboarding'
import { onboardingToRoadmapInputs } from '@/lib/onboarding-to-roadmap'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

function getAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set.')
  return createClient(supabaseUrl, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export async function saveGrowthRoadmapAction(
  payload: RoadmapInputs | GoaLineOnboarding
): Promise<{ error?: string; planId?: string }> {
  try {
    const supabaseAuth = await createServerSupabase()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    if (!user) return { error: 'You must be logged in to create a plan.' }

    const admin = getAdminClient()

    const isOnboarding = 'businessName' in payload && 'businessType' in payload
    const inputs: RoadmapInputs = isOnboarding
      ? onboardingToRoadmapInputs(payload as GoaLineOnboarding)
      : (payload as RoadmapInputs)
    const businessNameFromPayload = isOnboarding ? (payload as GoaLineOnboarding).businessName : null

    const view1 = buildMoneyMapData(inputs)

    const { data: profile } = await admin
      .from('profiles')
      .select('business_name')
      .eq('id', user.id)
      .single()

    const businessName = businessNameFromPayload || profile?.business_name || 'My Business'
    const fullPlan = buildFullPlanFromRoadmap(inputs, businessName, view1)

    const planPayload = {
      user_id: user.id,
      business_name: businessName,
      industry: '',
      business_model: '',
      website: isOnboarding ? (payload as GoaLineOnboarding).website ?? '' : '',
      target_audience: inputs.whoServedDescription || inputs.whoServed,
      value_proposition: inputs.whatCustomersLove,
      main_goal: inputs.winIn90Days,
      budget: inputs.monthlyBudget,
      time_commitment: inputs.weeklyHours,
      plan_type: 'growth_roadmap',
      roadmap_data: {
        inputs,
        view1,
        fullPlan,
        ...(isOnboarding && { onboarding: payload as GoaLineOnboarding }),
        updated_at: new Date().toISOString(),
      },
    }

    const { data: plan, error: planError } = await admin
      .from('plans')
      .insert(planPayload)
      .select('id')
      .single()

    if (planError) {
      if (planError.code === '42703' || planError.message?.includes('column')) {
        return {
          error:
            'Database needs plan_type and roadmap_data columns. In Supabase: Table Editor → plans → add columns plan_type (text), roadmap_data (jsonb).',
        }
      }
      return { error: planError.message }
    }

    return { planId: plan.id }
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to save plan.'
    return { error: message }
  }
}
