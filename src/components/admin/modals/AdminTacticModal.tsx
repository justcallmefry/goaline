'use client';
import React, { useState, useEffect } from 'react';
import { X, FileText } from 'lucide-react';

interface AdminTacticModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (tacticData: any) => Promise<void>;
  initialData: any | null;
}

export function AdminTacticModal({ isOpen, onClose, onSave, initialData }: AdminTacticModalProps) {
  const [formData, setFormData] = useState({
    title: '', description: '', category: 'Awareness', default_budget: 0
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ title: '', description: '', category: 'Awareness', default_budget: 0 });
    }
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSaving(true);
    await onSave(formData);
    setIsSaving(false);
  }

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 bg-slate-900 flex justify-between items-center">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">{initialData ? 'Edit Tactic' : 'Add New Tactic'}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tactic Title</label>
                <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Phase / Category</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        <option value="Awareness">Awareness (See Me)</option>
                        <option value="Consideration">Consideration (Know Me)</option>
                        <option value="Conversion">Conversion (Buy Me)</option>
                        <option value="Retention">Retention (Love Me)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Avg Cost (Budget)</label>
                    <input type="number" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-emerald-500 outline-none" value={formData.default_budget} onChange={(e) => setFormData({...formData, default_budget: Number(e.target.value)})} />
                </div>
            </div>

            <div>
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description / Strategy</label>
                <textarea rows={5} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-emerald-500 outline-none resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
            </div>

            <button type="submit" disabled={isSaving} className="w-full py-3 bg-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-200 cursor-pointer">
                {isSaving ? 'Saving...' : (initialData ? 'Update Tactic' : 'Create Tactic')}
            </button>
        </form>
      </div>
    </div>
  );
}