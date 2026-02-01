import React from 'react';
import { Sparkles, X, Loader2 } from 'lucide-react';

export function AIStrategistModal({ isOpen, onClose, onSubmit, description, setDescription, isGenerating }: any) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="px-6 py-5 bg-indigo-600 flex justify-between items-center">
            <div className="flex items-center gap-2">
                <Sparkles className="text-white" size={20} />
                <h3 className="text-sm font-black text-white uppercase tracking-widest">AI Strategist</h3>
            </div>
            <button onClick={onClose} className="text-indigo-200 hover:text-white transition-colors cursor-pointer"><X size={24} /></button>
        </div>
        
        <div className="p-8">
            <div className="mb-6">
                <h4 className="text-lg font-bold text-slate-900 mb-2">Let's define your strategy.</h4>
                <p className="text-sm text-slate-600 leading-relaxed">
                    Tell me about your **ideal customer** and the **specific result** you want to achieve.
                    <br/><br/>
                    I will analyze your goals and generate a custom list of tactics to help you reach them.
                </p>
            </div>

            <form onSubmit={onSubmit} className="space-y-4">
                <textarea 
                    className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm focus:ring-2 focus:ring-indigo-500 outline-none transition-all resize-none text-slate-900" 
                    placeholder="e.g. We are trying to reach customers who are searching for specific keywords related to organic skincare. Our goal is to drive more traffic to our new product page..." 
                    value={description} 
                    onChange={(e) => setDescription(e.target.value)} 
                />
                
                <button 
                    type="submit" 
                    disabled={isGenerating}
                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold text-sm uppercase tracking-widest shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                >
                    {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Sparkles size={18} />}
                    {isGenerating ? 'Analyzing...' : 'Build My Plan'}
                </button>
            </form>
        </div>
      </div>
    </div>
  );
}