'use client';

import React from 'react';
import { Rocket, Sparkles, Loader2 } from 'lucide-react';

interface WelcomeWizardProps {
  show: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  input: string;
  setInput: (val: string) => void;
  isGenerating: boolean;
}

export function WelcomeWizard({ 
  show, 
  onClose, 
  onSubmit, 
  input, 
  setInput, 
  isGenerating 
}: WelcomeWizardProps) {
  
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 relative">
          {/* Decorative Header */}
          <div className="h-32 bg-slate-900 relative overflow-hidden flex flex-col justify-center items-center text-center">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black opacity-80"></div>
             <div className="relative z-10 p-6">
                <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/20 shadow-lg">
                   <Rocket size={24} className="text-indigo-400" />
                </div>
                <h2 className="text-xl font-black text-white uppercase tracking-widest">Let's Build Your Plan</h2>
             </div>
          </div>

          {/* Content */}
          <div className="p-8">
             <p className="text-slate-600 text-sm font-medium mb-6 text-center leading-relaxed">
                Your board is empty. Tell me about your business, and I will generate a <strong>custom growth strategy</strong> for you instantly.
             </p>

             <form onSubmit={onSubmit}>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">What does your business do?</label>
                <textarea 
                    autoFocus 
                    required 
                    className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none resize-none mb-6 placeholder:text-slate-300" 
                    placeholder="e.g. I run a dental office in Utah looking to get more patients for teeth whitening."
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                />
                
                <div className="flex gap-3">
                    <button 
                        type="button" 
                        onClick={onClose} 
                        className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors cursor-pointer"
                    >
                        Skip for now
                    </button>
                    <button 
                        type="submit" 
                        disabled={isGenerating} 
                        className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl shadow-xl shadow-indigo-200 hover:bg-indigo-500 font-bold text-xs uppercase tracking-widest transition-all flex justify-center items-center gap-2 cursor-pointer group"
                    >
                        {isGenerating ? (
                            <><Loader2 className="animate-spin" size={16}/> Generating...</>
                        ) : (
                            <>
                                <Sparkles size={16} className="text-indigo-200 group-hover:text-white transition-colors" /> 
                                Generate Plan
                            </>
                        )}
                    </button>
                </div>
             </form>
          </div>
       </div>
    </div>
  );
}