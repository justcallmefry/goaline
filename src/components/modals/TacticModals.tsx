import React, { useState } from 'react';
import { X, Sparkles, Trash2, Wand2, ArrowRight } from 'lucide-react';

// --- ADD MODAL ---
export function TacticAddModal({ isOpen, onClose, onSubmit, name, setName, budget, setBudget }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-900">Add New Tactic</h3>
          <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600" /></button>
        </div>
        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Tactic Name</label>
            <input autoFocus type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none" placeholder="e.g., Instagram Ads" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Budget Allocation</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
              <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full pl-7 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none" placeholder="0" />
            </div>
          </div>
          <button type="submit" className="w-full bg-purple-600 text-white py-3 rounded-xl font-bold hover:bg-purple-700 transition-all mt-4">Create Tactic</button>
        </form>
      </div>
    </div>
  );
}

// --- EDIT MODAL (THE BIG UPDATE) ---
export function TacticEditModal({ 
  isOpen, onClose, onSubmit, 
  name, setName, 
  budget, setBudget, 
  content, setContent, 
  onAutoWrite, isWriting,
  // New Props for AI Data
  aiRationale, actionItem,
  onDelete // New Prop for handling delete
}: any) {
  
  // Local state for "Steering" the AI
  const [instructions, setInstructions] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-[32px] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white shrink-0">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center text-purple-600">
               <Sparkles size={20} />
             </div>
             <div>
               <h3 className="font-bold text-slate-900 text-lg leading-tight">Edit Tactic</h3>
               <p className="text-xs text-slate-400 font-medium">Refine your strategy</p>
             </div>
          </div>
          <button onClick={onClose}><X size={24} className="text-slate-400 hover:text-slate-600" /></button>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-8 space-y-8">
          
          {/* 1. AI STRATEGY CONTEXT (Only shows if AI created it) */}
          {(aiRationale || actionItem) && (
            <div className="bg-purple-50 p-5 rounded-2xl border border-purple-100">
              <div className="flex items-center gap-2 text-purple-700 text-xs font-black uppercase tracking-widest mb-3">
                 <Sparkles size={12} /> AI Strategy Insight
              </div>
              
              {aiRationale && (
                <p className="text-sm text-purple-900 leading-relaxed font-medium mb-4">
                  {aiRationale}
                </p>
              )}

              {actionItem && (
                <div className="bg-white/60 p-3 rounded-xl border border-purple-100 flex items-start gap-3">
                   <div className="mt-0.5 bg-purple-200 p-1 rounded-full text-purple-700"><ArrowRight size={12} /></div>
                   <div>
                     <span className="text-[10px] font-bold text-purple-400 uppercase tracking-wider block mb-0.5">Recommended Action</span>
                     <span className="text-sm text-purple-900 font-bold">{actionItem}</span>
                   </div>
                </div>
              )}
            </div>
          )}

          {/* 2. Core Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Tactic Name</label>
              <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Budget</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 font-bold">$</span>
                <input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} className="w-full pl-7 p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-bold focus:ring-2 focus:ring-purple-500 outline-none transition-all" />
              </div>
            </div>
          </div>

          {/* 3. "Steerable" Auto-Write Section */}
          <div className="space-y-3">
            <div className="flex justify-between items-end">
              <label className="block text-xs font-bold text-slate-500 uppercase">Execution Plan / Content</label>
              
              {/* Steerable Inputs */}
              <div className="flex items-center gap-2 w-full max-w-sm ml-auto">
                 <input 
                    type="text" 
                    placeholder="E.g., 'Focus on B2B' or 'Make it funny'" 
                    value={instructions}
                    onChange={(e) => setInstructions(e.target.value)}
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5 text-xs focus:ring-2 focus:ring-purple-500 outline-none"
                 />
                 <button 
                    type="button" 
                    onClick={() => onAutoWrite(instructions)} // Pass instructions to handler
                    disabled={isWriting}
                    className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-blue-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:opacity-90 transition-all disabled:opacity-50 whitespace-nowrap"
                  >
                    {isWriting ? <span className="animate-pulse">Thinking...</span> : <><Wand2 size={12} /> Auto-Write</>}
                 </button>
              </div>
            </div>
            
            <textarea 
              value={content} 
              onChange={(e) => setContent(e.target.value)} 
              className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl text-sm leading-relaxed h-40 focus:ring-2 focus:ring-purple-500 outline-none resize-none transition-all font-medium text-slate-700" 
              placeholder="Describe the tactics, steps, or copy..."
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-100 bg-slate-50 flex justify-between items-center shrink-0">
          <button 
            type="button" 
            onClick={onDelete} 
            className="text-slate-400 hover:text-red-500 text-sm font-bold flex items-center gap-2 transition-colors"
          >
            <Trash2 size={16} /> Delete
          </button>
          <div className="flex gap-3">
            <button onClick={onClose} className="px-6 py-2.5 rounded-xl text-slate-500 font-bold text-sm hover:bg-slate-200 transition-colors">Cancel</button>
            <button onClick={onSubmit} className="px-8 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 shadow-lg shadow-purple-200 transition-all active:scale-95">Save Changes</button>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- DELETE MODAL ---
export function DeleteModal({ isOpen, onClose, onConfirm }: any) {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-sm shadow-2xl p-8 text-center animate-in zoom-in-95">
        <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 text-red-500"><Trash2 size={32} /></div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">Delete Tactic?</h3>
        <p className="text-slate-500 text-sm mb-8">This action cannot be undone. Are you sure you want to remove this item?</p>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3 rounded-xl bg-slate-100 text-slate-700 font-bold hover:bg-slate-200 transition-colors">Cancel</button>
          <button onClick={onConfirm} className="flex-1 py-3 rounded-xl bg-red-500 text-white font-bold hover:bg-red-600 transition-colors shadow-lg shadow-red-200">Delete</button>
        </div>
      </div>
    </div>
  );
}