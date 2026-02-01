'use client';
import React from 'react';
import { ShieldCheck, X } from 'lucide-react';

interface AdminLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  name: string; setName: (val: string) => void;
  budget: number; setBudget: (val: number) => void;
  category: string; setCategory: (val: string) => void;
  desc: string; setDesc: (val: string) => void;
}

export function AdminLibraryModal({ isOpen, onClose, onSubmit, name, setName, budget, setBudget, category, setCategory, desc, setDesc }: AdminLibraryModalProps) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-indigo-200 animate-in fade-in zoom-in-95 duration-200">
         <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <ShieldCheck size={18} className="text-indigo-600" />
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Admin: Add Template</h3>
            </div>
            <button onClick={onClose} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={20} /></button>
         </div>
         <form onSubmit={onSubmit} className="p-6 space-y-4">
            <div>
               <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tactic Name</label>
               <input required type="text" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Default Budget</label>
                    <input type="number" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" value={budget} onChange={(e) => setBudget(Number(e.target.value))} />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                    <select className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" value={category} onChange={(e) => setCategory(e.target.value)}>
                        <option value="Awareness">Awareness</option>
                        <option value="Consideration">Consideration</option>
                        <option value="Conversion">Conversion</option>
                        <option value="Retention">Retention</option>
                    </select>
                </div>
            </div>
            <div>
               <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
               <textarea className="w-full h-24 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" value={desc} onChange={(e) => setDesc(e.target.value)} />
            </div>
            <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-colors cursor-pointer">Add to Library</button>
         </form>
      </div>
    </div>
  );
}