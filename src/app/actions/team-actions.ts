'use server'

import { createClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!

/** Admin client bypasses RLS. Requires SUPABASE_SERVICE_ROLE_KEY in .env.local */
function getAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!key) throw new Error('SUPABASE_SERVICE_ROLE_KEY is not set. Add it to .env.local (Supabase → Settings → API → service_role).')
  return createClient(supabaseUrl, key, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  })
}

export async function createTeamAction(formData: FormData) {
  try {
    const teamName = (formData.get('teamName') as string)?.trim();
    if (!teamName) return { error: "Team name is required." };

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { error: "Server setup: Add SUPABASE_SERVICE_ROLE_KEY to .env.local (Supabase → Settings → API → service_role key)." };
    }

    const supabaseAuth = await createServerClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return { error: "You must be logged in to create a team." };

    const admin = getAdminClient();

    const { data: team, error: teamError } = await admin
      .from('teams')
      .insert({ name: teamName })
      .select()
      .single();

    if (teamError) return { error: teamError.message };

    const { error: memberError } = await admin
      .from('team_members')
      .insert({
        team_id: team.id,
        user_id: user.id,
        role: 'owner',
      });

    if (memberError) return { error: memberError.message };

    return { success: true, teamId: team.id };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to create team.";
    return { error: message };
  }
}

export async function inviteMemberAction(teamId: string, email: string, role: string) {
  try {
    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { error: "Server setup: Add SUPABASE_SERVICE_ROLE_KEY to .env.local." };
    }

    const supabaseAuth = await createServerClient();
    const { data: { user: currentUser } } = await supabaseAuth.auth.getUser();
    if (!currentUser) return { error: "You must be logged in to invite members." };

    const admin = getAdminClient();

    const { data: invitedUser } = await admin
      .from('profiles')
      .select('id')
      .eq('email', email)
      .single();

    if (!invitedUser) return { error: "User not found. They must sign up first." };

    const { error } = await admin
      .from('team_members')
      .insert({
        team_id: teamId,
        user_id: invitedUser.id,
        role: role || 'member',
      });

  if (error) return { error: error.message };
  return { success: true };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to invite member.";
    return { error: message };
  }
}

/** Fetch teams the current user belongs to (uses admin to bypass RLS, filters by membership). */
export async function getTeamsForUserAction(): Promise<{ data: any[] | null; error: string | null }> {
  try {
    const supabaseAuth = await createServerClient();
    const { data: { user } } = await supabaseAuth.auth.getUser();
    if (!user) return { data: null, error: "Not logged in." };

    if (!process.env.SUPABASE_SERVICE_ROLE_KEY) {
      return { data: [], error: null };
    }

    const admin = getAdminClient();

    const { data: memberships } = await admin
      .from('team_members')
      .select('team_id')
      .eq('user_id', user.id);

    const teamIds = (memberships ?? []).map((m: { team_id: string }) => m.team_id);
    if (teamIds.length === 0) return { data: [], error: null };

    const { data: teams, error } = await admin
      .from('teams')
      .select(`
        id,
        name,
        team_members (
          role,
          profiles (
            email,
            full_name
          )
        )
      `)
      .in('id', teamIds);

    if (error) return { data: null, error: error.message };
    return { data: teams ?? [], error: null };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to load teams.";
    return { data: null, error: message };
  }
}