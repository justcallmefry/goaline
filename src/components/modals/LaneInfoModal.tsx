'use client';
import React from 'react';
import { Info } from 'lucide-react';

interface LaneInfoModalProps {
  title: string | null;
  onClose: () => void;
  description: string;
}

export function LaneInfoModal({ title, onClose, description }: LaneInfoModalProps) {
  if (!title) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
       <div className="bg-white rounded-xl shadow-2xl w-full max-sm overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6 text-center">
             <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                <Info size={24} />
             </div>
             <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-wide">{title}</h3>
             <p className="text-sm text-slate-500 leading-relaxed mb-6">{description}</p>
             <button onClick={onClose} className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors cursor-pointer">Got it</button>
          </div>
       </div>
    </div>
  );
}