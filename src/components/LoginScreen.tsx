'use client';

import React, { useState } from 'react';
import { Loader2, Target, Lock } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export function LoginScreen() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleGoogleLogin = async () => {
    setIsRedirecting(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
       <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="p-8 text-center">
             <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
                <Target size={32} className="text-white" />
             </div>
             <h1 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-2">GoaLine</h1>
             <p className="text-slate-500 mb-8 text-sm font-medium">Build your growth strategy. Find trusted experts.</p>
             <button onClick={handleGoogleLogin} disabled={isRedirecting} className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-indigo-200 hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-xl transition-all shadow-sm group cursor-pointer relative">
                {isRedirecting ? <Loader2 className="animate-spin text-indigo-600" size={20} /> : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    <span>Sign in with Google</span>
                  </>
                )}
             </button>
             <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest"><Lock size={10} /><span>Secure Authentication</span></div>
          </div>
          <div className="bg-slate-50 p-4 border-t border-slate-100 text-center"><p className="text-xs text-slate-400">By continuing, you agree to our Terms of Service.</p></div>
       </div>
    </div>
  );
}