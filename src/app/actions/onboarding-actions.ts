'use server'

import { createClient } from '@supabase/supabase-js'
import { redirect } from 'next/navigation'
import { createClient as createServerSupabase } from '@/utils/supabase/server'

// Define the shape of the incoming data
interface OnboardingData {
  businessName: string;
  industry: string;
  businessModel: string;
  website: string;
  targetAudience: string;
  valueProposition: string;
  mainGoal: string;
  budget: string;
  timeCommitment: string;
}

export async function saveOnboardingData(data: OnboardingData) {
  // 1. Setup Admin Client (Bypasses RLS to ensure data is saved)
  const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  )

  // 2. Get the current user ID from session cookies
  const supabaseAuth = await createServerSupabase()
  const { data: { user } } = await supabaseAuth.auth.getUser()

  if (!user) return { error: "Not authenticated" };

  // --- START TRANSACTION-LIKE LOGIC ---

  // 3. Create the Team (using Business Name)
  const { data: team, error: teamError } = await supabaseAdmin
    .from('teams')
    .insert({ name: data.businessName })
    .select()
    .single();

  if (teamError) {
    console.error("Team Creation Failed:", teamError);
    return { error: "Failed to create team" };
  }

  // 4. Add User as Team Owner
  const { error: memberError } = await supabaseAdmin
    .from('team_members')
    .insert({
      team_id: team.id,
      user_id: user.id,
      role: 'owner'
    });

  if (memberError) {
    console.error("Member Assign Failed:", memberError);
    // Optional: Delete the team if member assign fails to keep data clean
    return { error: "Failed to assign team owner" };
  }

  // 5. Save the Plan (include plan_type + roadmap_data for current schema)
  const { data: plan, error: planError } = await supabaseAdmin
    .from('plans')
    .insert({
      user_id: user.id,
      business_name: data.businessName,
      industry: data.industry,
      business_model: data.businessModel,
      website: data.website,
      target_audience: data.targetAudience,
      value_proposition: data.valueProposition,
      main_goal: data.mainGoal,
      budget: data.budget,
      time_commitment: data.timeCommitment,
      plan_type: 'legacy',
      roadmap_data: {},
    })
    .select('id')
    .single();

  if (planError) {
    console.error("Plan Save Failed:", planError);
    return { error: "Failed to save plan. " + (planError.message || "") };
  }

  // 6. Redirect to plan detail (or list)
  redirect(plan?.id ? `/dashboard/plans/${plan.id}` : '/dashboard/plans');
}