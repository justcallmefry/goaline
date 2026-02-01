'use client';
import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

interface AdminToolModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (toolData: any) => Promise<void>;
  initialData: any | null;
}

export function AdminToolModal({ isOpen, onClose, onSave, initialData }: AdminToolModalProps) {
  const [formData, setFormData] = useState({
    name: '', description: '', affiliate_link: '', category: 'General', pricing: '', value_prop: ''
  });
  const [isSaving, setIsSaving] = useState(false);

  // Reset or Load Data when modal opens
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    } else {
      setFormData({ name: '', description: '', affiliate_link: '', category: 'General', pricing: '', value_prop: '' });
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
            <h3 className="text-sm font-black text-white uppercase tracking-widest">{initialData ? 'Edit Tool' : 'Add New Tool'}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tool Name</label>
                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        <option>General</option>
                        <option>Social Media</option>
                        <option>CRM</option>
                        <option>SEO</option>
                        <option>Content</option>
                        <option>Analytics</option>
                        <option>Design</option>
                    </select>
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Pricing</label>
                    <input type="text" placeholder="e.g. $29/mo" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.pricing} onChange={(e) => setFormData({...formData, pricing: e.target.value})} />
                </div>
                <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Affiliate Link</label>
                    <input type="url" placeholder="https://" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.affiliate_link} onChange={(e) => setFormData({...formData, affiliate_link: e.target.value})} />
                </div>
                <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                    <textarea rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>
                    <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Value Proposition</label>
                    <textarea rows={2} placeholder="Why should they use this?" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" value={formData.value_prop} onChange={(e) => setFormData({...formData, value_prop: e.target.value})} />
                </div>
            </div>
            <button type="submit" disabled={isSaving} className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-colors shadow-lg shadow-indigo-200 cursor-pointer">
                {isSaving ? 'Saving...' : (initialData ? 'Update Tool' : 'Create Tool')}
            </button>
        </form>
      </div>
    </div>
  );
}