'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Briefcase, Image as ImageIcon, Loader2, Upload, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';

type Profile = {
  business_name: string | null;
  logo_url: string | null;
};

export default function SettingsForm({
  userId,
  initialProfile,
}: {
  userId: string;
  initialProfile: Profile;
}) {
  const router = useRouter();
  const [businessName, setBusinessName] = useState(initialProfile?.business_name ?? '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [currentLogoUrl, setCurrentLogoUrl] = useState<string | null>(initialProfile?.logo_url ?? null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    setBusinessName(initialProfile?.business_name ?? '');
    setCurrentLogoUrl(initialProfile?.logo_url ?? null);
  }, [initialProfile]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    try {
      let logoUrl = currentLogoUrl;

      if (logoFile) {
        const fileExt = logoFile.name.split('.').pop();
        const fileName = `${userId}-${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('logos')
          .upload(fileName, logoFile, { upsert: true });
        if (uploadError) throw uploadError;
        const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName);
        logoUrl = publicUrlData.publicUrl;
      }

      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          business_name: businessName || null,
          logo_url: logoUrl,
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setCurrentLogoUrl(logoUrl);
      setLogoFile(null);
      setSuccessMessage('Saved. Your company info may take a moment to update in the header.');
      router.refresh();
    } catch (err: unknown) {
      setErrorMessage(err instanceof Error ? err.message : 'Something went wrong.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-xl">
      <h2 className="text-2xl font-bold text-slate-900 mb-1">Account & company</h2>
      <p className="text-slate-500 text-sm mb-8">
        Update your business name and logo. They’ll appear in the dashboard and on your plans.
      </p>

      {errorMessage && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
          <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <p className="text-sm font-medium text-red-800">Update failed</p>
            <p className="text-sm text-red-600 mt-0.5">{errorMessage}</p>
          </div>
        </div>
      )}

      {successMessage && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl flex items-start gap-3">
          <CheckCircle2 className="text-green-500 shrink-0 mt-0.5" size={20} />
          <p className="text-sm font-medium text-green-800">{successMessage}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Company / business name
          </label>
          <div className="relative">
            <Briefcase size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="e.g. Acme Corp"
              className="w-full bg-white border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 focus:border-purple-500 outline-none"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Company logo
          </label>
          <div className="border-2 border-dashed border-slate-200 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-slate-50/50 transition-colors relative">
            <input
              type="file"
              accept="image/*"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              onChange={(e) => setLogoFile(e.target.files?.[0] ?? null)}
            />
            {logoFile ? (
              <div className="flex items-center gap-2 text-purple-600 font-semibold text-sm">
                <CheckCircle2 size={18} />
                <span>{logoFile.name}</span>
                <span className="text-slate-400 font-normal">(will save when you click Save)</span>
              </div>
            ) : currentLogoUrl ? (
              <div className="flex flex-col items-center gap-2">
                <img
                  src={currentLogoUrl}
                  alt="Company logo"
                  className="max-h-16 w-auto object-contain"
                />
                <p className="text-xs text-slate-500">Click to replace logo</p>
              </div>
            ) : (
              <>
                <div className="w-12 h-12 bg-purple-50 rounded-full flex items-center justify-center mb-3">
                  <ImageIcon size={24} className="text-purple-500" />
                </div>
                <p className="text-sm font-medium text-slate-600">Click to upload a logo</p>
                <p className="text-xs text-slate-400 mt-1">PNG, JPG, or SVG (max 2MB)</p>
              </>
            )}
          </div>
        </div>

        <button
          type="submit"
          disabled={isSaving}
          className="w-full sm:w-auto px-8 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm hover:bg-purple-700 transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
        >
          {isSaving ? (
            <Loader2 className="animate-spin" size={18} />
          ) : (
            <Upload size={18} />
          )}
          <span>{isSaving ? 'Saving…' : 'Save changes'}</span>
        </button>
      </form>
    </div>
  );
}
