import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  // Get the user's name from Google or metadata
  const userName = user.user_metadata?.full_name || user.email;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-slate-900 mb-2">
        Welcome back, {userName}
      </h1>
      <p className="text-slate-500 mb-8">Here is what is happening with your growth strategy.</p>

      <a href="/dashboard/tactics" className="inline-flex items-center gap-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors">
        Go to Strategy Board &rarr;
      </a>
    </div>
  );
}