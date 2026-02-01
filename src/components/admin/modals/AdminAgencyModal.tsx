'use client';
import React, { useState, useEffect } from 'react';
import { X, BadgeCheck } from 'lucide-react';

interface AdminAgencyModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (agencyData: any) => Promise<void>;
  initialData: any | null;
}

export function AdminAgencyModal({ isOpen, onClose, onSave, initialData }: AdminAgencyModalProps) {
  const [formData, setFormData] = useState({
    name: '', description: '', website_link: '', location: 'Remote / Global', pricing_model: '', is_verified: false, logo_url: '', category: 'General'
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || '',
        description: initialData.description || '',
        website_link: initialData.website_link || '',
        location: initialData.location || 'Remote / Global',
        pricing_model: initialData.pricing_model || '',
        is_verified: initialData.is_verified || false,
        logo_url: initialData.logo_url || '',
        category: initialData.category || 'General'
      });
    } else {
      setFormData({ name: '', description: '', website_link: '', location: 'Remote / Global', pricing_model: '', is_verified: false, logo_url: '', category: 'General' });
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
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-purple-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 bg-slate-900 flex justify-between items-center">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">{initialData ? 'Edit Agency' : 'Add New Agency'}</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Agency Name</label>
                    <input required type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} />
                </div>
                
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Location / Region</label>
                    <input type="text" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                </div>
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Pricing Model</label>
                    <input type="text" placeholder="e.g. $2k - $5k / mo" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none" value={formData.pricing_model} onChange={(e) => setFormData({...formData, pricing_model: e.target.value})} />
                </div>

                {/* NEW: Category Field */}
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                    <select className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                        <option>General</option>
                        <option>PPC / Ads</option>
                        <option>SEO / Content</option>
                        <option>Social Media</option>
                        <option>Web Design</option>
                        <option>Full Service</option>
                    </select>
                </div>

                {/* NEW: Logo URL Field */}
                <div>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Logo URL</label>
                    <input type="url" placeholder="https://..." className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none" value={formData.logo_url} onChange={(e) => setFormData({...formData, logo_url: e.target.value})} />
                </div>

                <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Website / Contact Link</label>
                    <input type="url" placeholder="https://" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-purple-500 outline-none" value={formData.website_link} onChange={(e) => setFormData({...formData, website_link: e.target.value})} />
                </div>

                <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description & Services</label>
                    <textarea rows={3} className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-purple-500 outline-none resize-none" value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} />
                </div>

                <div className="col-span-2 flex items-center gap-3 p-3 bg-purple-50 rounded-lg border border-purple-100 cursor-pointer" onClick={() => setFormData({...formData, is_verified: !formData.is_verified})}>
                    <div className={`w-5 h-5 rounded border flex items-center justify-center transition-all ${formData.is_verified ? 'bg-purple-600 border-purple-600' : 'bg-white border-slate-300'}`}>
                        {formData.is_verified && <BadgeCheck size={14} className="text-white" />}
                    </div>
                    <div>
                        <span className="block text-sm font-bold text-slate-900">Verified Partner Status</span>
                        <span className="text-[10px] text-slate-500">Show the "Verified" badge on this agency's profile.</span>
                    </div>
                </div>
            </div>

            <button type="submit" disabled={isSaving} className="w-full py-3 bg-purple-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-purple-500 transition-colors shadow-lg shadow-purple-200 cursor-pointer">
                {isSaving ? 'Saving...' : (initialData ? 'Update Agency' : 'Create Agency')}
            </button>
        </form>
      </div>
    </div>
  );
}