import React from 'react';
import { redirect } from 'next/navigation';
import Sidebar from '@/components/layout/Sidebar';
import DashboardHeader from '@/components/layout/DashboardHeader';
import { createClient } from '@/utils/supabase/server';

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_name, logo_url')
    .eq('id', user.id)
    .single();

  const headerUser = {
    email: user.email ?? null,
    fullName: user.user_metadata?.full_name ?? null,
    avatarUrl: user.user_metadata?.avatar_url ?? null,
  };

  const headerProfile = {
    businessName: profile?.business_name ?? null,
    logoUrl: profile?.logo_url ?? null,
  };

  return (
    <div className="flex h-screen bg-[#F8F9FC] overflow-hidden">
      <aside className="w-[280px] flex-shrink-0 hidden md:block border-r border-slate-100 bg-white z-50">
        <Sidebar />
      </aside>

      <div className="flex-1 flex flex-col min-w-0 overflow-x-auto">
        <DashboardHeader user={headerUser} profile={headerProfile} />

        <main className="flex-1 p-10 pt-4 overflow-y-auto">
          <div className="min-w-[1200px] max-w-[1600px] mx-auto pb-20">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}