import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function logActivity(userId: string, action: string, details: any = {}) {
  try {
    // Fire and forget - don't await this, so the UI stays snappy
    supabase.from('activity_logs').insert({
      user_id: userId,
      action_type: action,
      details: details
    }).then(({ error }) => {
      if (error) console.error('Log error:', error);
    });
  } catch (error) {
    console.error('Logging failed:', error);
  }
}