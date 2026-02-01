'use client';
import React from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';

interface AIStrategistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  description: string;
  setDescription: (val: string) => void;
  isGenerating: boolean;
}

export function AIStrategistModal({ isOpen, onClose, onSubmit, description, setDescription, isGenerating }: AIStrategistModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
         <div className="px-6 py-5 bg-slate-900 flex justify-between items-center">
          <div className="flex items-center gap-3">
              <Sparkles size={18} className="text-indigo-400" />
              <h3 className="text-sm font-black text-white uppercase tracking-widest">AI Strategist</h3>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white cursor-pointer p-2"><X size={24} /></button>
        </div>
        <div className="p-6 sm:p-8">
            <p className="text-slate-500 text-sm font-medium mb-6">Describe your business. I will build your Q1 roadmap.</p>
            <form onSubmit={onSubmit}>
                <textarea autoFocus required className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none resize-none mb-6" value={description} onChange={(e) => setDescription(e.target.value)} />
                <button type="submit" disabled={isGenerating} className="w-full py-4 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-500 font-bold text-xs uppercase tracking-widest transition-all flex justify-center items-center gap-2 cursor-pointer">
                    {isGenerating ? <><Loader2 className="animate-spin" size={14}/> THINKING...</> : 'GENERATE STRATEGY'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}