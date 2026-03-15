import React from 'react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import SettingsForm from '@/components/dashboard/SettingsForm';

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: profile } = await supabase
    .from('profiles')
    .select('business_name, logo_url')
    .eq('id', user.id)
    .single();

  const initialProfile = {
    business_name: profile?.business_name ?? null,
    logo_url: profile?.logo_url ?? null,
  };

  return (
    <div className="p-8">
      <SettingsForm userId={user.id} initialProfile={initialProfile} />
    </div>
  );
}
