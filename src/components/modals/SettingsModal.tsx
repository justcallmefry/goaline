'use client';

import React, { useState } from 'react';
import { X, AlertTriangle, Briefcase, CheckCircle2, Image as ImageIcon, Loader2, Upload } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  session: any;
  profile: any;
  onProfileUpdate: (updates: any) => void;
}

export function SettingsModal({ isOpen, onClose, session, profile, onProfileUpdate }: SettingsModalProps) {
  const [bizName, setBizName] = useState(profile?.business_name || '');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Update local state when profile changes (e.g. initial load)
  React.useEffect(() => {
    if (profile) setBizName(profile.business_name || '');
  }, [profile]);

  if (!isOpen) return null;

  const handleSave = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!session) return;
      setIsSaving(true);
      setErrorMessage(null);

      try {
          let logoUrl = profile?.logo_url;
          
          // 1. Upload Logo if changed
          if (logoFile) {
              const fileExt = logoFile.name.split('.').pop();
              const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
              const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, logoFile, { upsert: true });
              if (uploadError) throw uploadError;
              const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName);
              logoUrl = publicUrlData.publicUrl;
          }

          // 2. Update Profile
          const updates = {
              id: session.user.id,
              business_name: bizName,
              logo_url: logoUrl,
              updated_at: new Date().toISOString(),
          };

          const { error: profileError } = await supabase.from('profiles').upsert(updates);
          if (profileError) throw profileError;

          // 3. Notify Parent & Close
          onProfileUpdate(updates);
          onClose();
      } catch (error: any) {
          setErrorMessage(error.message || 'An unexpected error occurred.');
      } finally {
          setIsSaving(false);
      }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
         <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Account Settings</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={20} /></button>
         </div>
         
         {errorMessage && (
            <div className="px-6 pt-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
                    <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                    <div>
                        <h4 className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">Update Failed</h4>
                        <p className="text-xs text-red-600 font-medium leading-snug">{errorMessage}</p>
                    </div>
                </div>
            </div>
         )}

         <form onSubmit={handleSave} className="p-6 space-y-6">
            <div>
               <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Business Name</label>
               <div className="relative">
                  <Briefcase size={16} className="absolute left-3 top-3 text-slate-400" />
                  <input 
                    type="text" 
                    placeholder="e.g. Acme Corp" 
                    className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                    value={bizName}
                    onChange={(e) => setBizName(e.target.value)}
                  />
               </div>
            </div>

            <div>
               <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Business Logo</label>
               <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                  <input 
                    type="file" 
                    accept="image/*"
                    className="absolute inset-0 opacity-0 cursor-pointer"
                    onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                  />
                  {logoFile ? (
                      <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                         <CheckCircle2 size={16} />
                         <span>{logoFile.name}</span>
                      </div>
                  ) : (
                      <>
                         <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mb-2">
                            <ImageIcon size={20} className="text-indigo-500" />
                         </div>
                         <p className="text-xs font-bold text-slate-600">Click to upload logo</p>
                         <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, or SVG (Max 2MB)</p>
                      </>
                  )}
               </div>
            </div>

            <button 
              type="submit" 
              disabled={isSaving}
              className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
               {isSaving ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
               <span>Save Changes</span>
            </button>
         </form>
      </div>
    </div>
  );
}