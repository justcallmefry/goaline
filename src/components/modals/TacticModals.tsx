'use client';
import React from 'react';
import { X, AlertTriangle, Sparkles, Loader2, Share2, AlertCircle, CheckCircle } from 'lucide-react';

export function TacticAddModal({ isOpen, onClose, onSubmit, name, setName, budget, setBudget }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 bg-slate-900 flex justify-between items-center">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">New Tactic</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer"><X size={24} /></button>
        </div>
        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <input 
            autoFocus 
            type="text" 
            required 
            placeholder="Tactic Title" 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all" 
            value={name} 
            onChange={(e) => setName(e.target.value)} 
          />
          <input 
            type="number" 
            placeholder="Budget" 
            className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-slate-900 outline-none transition-all" 
            value={budget} 
            onFocus={(e) => e.target.select()} // <--- FIXED: Auto-selects 0
            onChange={(e) => setBudget(Number(e.target.value))} 
          />
          <button type="submit" className="w-full py-3 bg-slate-900 text-white hover:bg-black rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer transition-all">Save Changes</button>
        </form>
      </div>
    </div>
  );
}

export function TacticEditModal({ 
  isOpen, onClose, onSubmit, name, setName, budget, setBudget, 
  content, setContent, onAutoWrite, isWriting, 
  onSubmitLibrary, isSubmitting, submitError, submitSuccess // <--- NEW PROP
}: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 bg-slate-900 flex justify-between items-center">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Edit Tactic</h3>
            <button onClick={onClose} className="text-slate-400 hover:text-white transition-colors cursor-pointer"><X size={24} /></button>
        </div>
        
        {/* HTML ERROR ALERT */}
        {submitError && (
            <div className="bg-red-50 border-b border-red-100 px-6 py-3 flex items-center gap-3">
                <AlertCircle size={16} className="text-red-600 flex-shrink-0" />
                <p className="text-xs font-bold text-red-600">{submitError}</p>
            </div>
        )}

        {/* HTML SUCCESS ALERT */}
        {submitSuccess && (
            <div className="bg-emerald-50 border-b border-emerald-100 px-6 py-3 flex items-center gap-3">
                <CheckCircle size={16} className="text-emerald-600 flex-shrink-0" />
                <p className="text-xs font-bold text-emerald-600">{submitSuccess}</p>
            </div>
        )}

        <form onSubmit={onSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Title</label>
                <input type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold focus:ring-2 focus:ring-slate-900 outline-none transition-all" value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div className="col-span-2 sm:col-span-1">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Budget</label>
                <input 
                    type="number" 
                    className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono focus:ring-2 focus:ring-slate-900 outline-none transition-all" 
                    value={budget} 
                    onFocus={(e) => e.target.select()} // <--- FIXED: Auto-selects 0
                    onChange={(e) => setBudget(Number(e.target.value))} 
                />
            </div>
          </div>
          
          <div className="flex flex-col gap-4">
            <div className="flex justify-between items-center">
                <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Content</label>
                <button type="button" onClick={onAutoWrite} disabled={isWriting} className="text-[10px] bg-slate-100 text-slate-700 px-4 py-2 rounded-full font-bold uppercase hover:bg-slate-200 flex items-center justify-center gap-2 cursor-pointer transition-colors">
                {isWriting ? <Loader2 className="animate-spin" size={12}/> : <Sparkles size={12} />} {isWriting ? 'WRITING...' : 'AUTO-WRITE'}
                </button>
            </div>
            <textarea className="w-full h-40 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm leading-relaxed focus:ring-2 focus:ring-slate-900 outline-none transition-all resize-none" value={content} onChange={(e) => setContent(e.target.value)} />
          </div>
          
          <div className="flex gap-3 pt-2">
             <button 
                type="button" 
                onClick={onSubmitLibrary} 
                disabled={isSubmitting || !!submitSuccess} // Disable if submitting OR if success message is showing
                className={`flex-1 py-3 border rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer transition-all flex items-center justify-center gap-2 ${submitSuccess ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-white border-slate-200 text-slate-600 hover:text-indigo-600 hover:border-indigo-200'}`}
             >
                {isSubmitting ? <Loader2 className="animate-spin" size={16}/> : submitSuccess ? <CheckCircle size={16} /> : <Share2 size={16} />}
                <span>{submitSuccess ? 'Sent!' : 'Submit as Template'}</span>
             </button>
             
             <button type="submit" className="flex-[2] py-3 bg-slate-900 text-white hover:bg-black rounded-xl font-bold text-xs uppercase tracking-widest cursor-pointer transition-all">Save Changes</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export function DeleteModal({ isOpen, onClose, onConfirm }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm p-6 text-center animate-in fade-in zoom-in-95 duration-200">
        <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="text-red-500" size={24} />
        </div>
        <h3 className="text-lg font-black mb-2 text-slate-900">Delete Tactic?</h3>
        <p className="text-sm text-slate-500 mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-3 border rounded-lg font-bold text-xs hover:bg-slate-50 cursor-pointer transition-colors">Cancel</button>
            <button onClick={onConfirm} className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold text-xs hover:bg-red-700 cursor-pointer transition-colors">Delete</button>
        </div>
      </div>
    </div>
  );
}