'use client';

import React, { useState } from 'react';
import { Rocket, Sparkles, Loader2, ArrowRight, ArrowLeft, Building2, Users, Target } from 'lucide-react';

// Define the shape of the data we are collecting
export interface OnboardingData {
  businessName: string;
  industry: string;
  businessModel: string;
  website: string;
  targetAudience: string;
  valueProposition: string;
  mainGoal: string;
  budget: string;
  timeCommitment: string;
}

interface WelcomeWizardProps {
  show: boolean;
  onClose: () => void;
  // Updated onSubmit to pass the structured data back to the parent
  onSubmit: (data: OnboardingData) => void; 
  isGenerating: boolean;
}

export function WelcomeWizard({ 
  show, 
  onClose, 
  onSubmit, 
  isGenerating 
}: WelcomeWizardProps) {
  
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState<OnboardingData>({
    businessName: '',
    industry: '',
    businessModel: 'B2B_SERVICE',
    website: '',
    targetAudience: '',
    valueProposition: '',
    mainGoal: '',
    budget: '$100-500',
    timeCommitment: '2-5 hours'
  });

  if (!show) return null;

  const handleNext = () => setStep((prev) => prev + 1);
  const handleBack = () => setStep((prev) => prev - 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const updateField = (field: keyof OnboardingData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Helper to render the progress bar
  const Progress = () => (
    <div className="w-full bg-slate-100 h-1 mt-0">
      <div 
        className="bg-indigo-500 h-1 transition-all duration-500 ease-out" 
        style={{ width: `${(step / 3) * 100}%` }}
      />
    </div>
  );

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
       <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 relative flex flex-col max-h-[90vh]">
          
          {/* Header - Changes based on Step */}
          <div className="bg-slate-900 p-6 relative overflow-hidden shrink-0">
             <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black opacity-80"></div>
             <div className="relative z-10 flex items-center justify-between">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
                    {step === 1 && <Building2 size={20} className="text-indigo-400" />}
                    {step === 2 && <Users size={20} className="text-indigo-400" />}
                    {step === 3 && <Target size={20} className="text-indigo-400" />}
                  </div>
                  <div>
                    <h2 className="text-lg font-black text-white uppercase tracking-widest">
                      {step === 1 ? "The Basics" : step === 2 ? "The Strategy" : "The Constraints"}
                    </h2>
                    <p className="text-slate-400 text-xs font-medium">Step {step} of 3</p>
                  </div>
                </div>
                <button onClick={onClose} className="text-slate-500 hover:text-white text-xs uppercase tracking-widest">Skip</button>
             </div>
          </div>
          
          <Progress />

          {/* Scrollable Content Area */}
          <div className="p-8 overflow-y-auto">
            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* STEP 1: BUSINESS CONTEXT */}
              {step === 1 && (
                <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Name</label>
                        <input 
                          autoFocus
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                          placeholder="Acme Corp"
                          value={formData.businessName}
                          onChange={(e) => updateField('businessName', e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Industry</label>
                        <input 
                          required
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                          placeholder="e.g. Real Estate"
                          value={formData.industry}
                          onChange={(e) => updateField('industry', e.target.value)}
                        />
                      </div>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Business Model</label>
                      <select 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 outline-none transition-all cursor-pointer"
                        value={formData.businessModel}
                        onChange={(e) => updateField('businessModel', e.target.value)}
                      >
                        <option value="B2B_SERVICE">B2B Service (Agency, Consulting)</option>
                        <option value="B2C_PRODUCT">B2C Product (E-commerce, Retail)</option>
                        <option value="LOCAL_SERVICE">Local Service (Plumbing, Medical)</option>
                        <option value="SAAS">SaaS / Software</option>
                        <option value="CONTENT">Content Creator / Influencer</option>
                      </select>
                   </div>

                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Website (Optional)</label>
                      <input 
                        className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 outline-none transition-all"
                        placeholder="https://..."
                        value={formData.website}
                        onChange={(e) => updateField('website', e.target.value)}
                      />
                   </div>
                </div>
              )}

              {/* STEP 2: AUDIENCE & VALUE */}
              {step === 2 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Who is your ideal customer?</label>
                    <textarea 
                      autoFocus
                      required
                      className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-600 outline-none resize-none transition-all placeholder:text-slate-300"
                      placeholder="e.g. Busy moms in urban areas aged 30-45 who value organic food..."
                      value={formData.targetAudience}
                      onChange={(e) => updateField('targetAudience', e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">What main problem do you solve? (Value Prop)</label>
                    <textarea 
                      required
                      className="w-full h-24 bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-medium text-slate-800 focus:ring-2 focus:ring-indigo-600 outline-none resize-none transition-all placeholder:text-slate-300"
                      placeholder="e.g. We save them 2 hours a week on meal prep by delivering pre-cooked healthy meals."
                      value={formData.valueProposition}
                      onChange={(e) => updateField('valueProposition', e.target.value)}
                    />
                  </div>
                </div>
              )}

              {/* STEP 3: GOALS & CONSTRAINTS */}
              {step === 3 && (
                <div className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                   <div className="space-y-2">
                      <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Primary Goal (Next 90 Days)</label>
                      <div className="grid grid-cols-2 gap-3">
                        {['Get First 10 Customers', 'Scale Revenue', 'Brand Awareness', 'Launch New Product'].map((goal) => (
                           <button
                             type="button"
                             key={goal}
                             onClick={() => updateField('mainGoal', goal)}
                             className={`p-3 rounded-xl border text-xs font-bold transition-all text-left ${
                               formData.mainGoal === goal 
                               ? 'bg-indigo-50 border-indigo-500 text-indigo-700 shadow-sm' 
                               : 'bg-white border-slate-200 text-slate-500 hover:border-indigo-200'
                             }`}
                           >
                             {goal}
                           </button>
                        ))}
                      </div>
                   </div>

                   <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Monthly Budget</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 outline-none transition-all cursor-pointer"
                          value={formData.budget}
                          onChange={(e) => updateField('budget', e.target.value)}
                        >
                          <option value="$0 (Organic Only)">$0 (Organic Only)</option>
                          <option value="$100 - $500">$100 - $500</option>
                          <option value="$500 - $2,000">$500 - $2,000</option>
                          <option value="$2,000+">$2,000+</option>
                        </select>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Time Available</label>
                        <select 
                          className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-600 outline-none transition-all cursor-pointer"
                          value={formData.timeCommitment}
                          onChange={(e) => updateField('timeCommitment', e.target.value)}
                        >
                          <option value="< 2 hours/week">{'< 2 hours/week'}</option>
                          <option value="2-5 hours/week">2-5 hours/week</option>
                          <option value="10+ hours/week">10+ hours/week</option>
                        </select>
                      </div>
                   </div>
                </div>
              )}

              {/* FOOTER ACTIONS */}
              <div className="pt-4 flex gap-3">
                 {step > 1 && (
                    <button 
                      type="button"
                      onClick={handleBack}
                      className="px-6 py-4 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors"
                    >
                      <ArrowLeft size={16} />
                    </button>
                 )}
                 
                 {step < 3 ? (
                    <button 
                      type="button"
                      onClick={handleNext}
                      disabled={!formData.businessName && step === 1} // Basic validation example
                      className="flex-1 py-4 bg-indigo-600 text-white rounded-xl shadow-xl shadow-indigo-200 hover:bg-indigo-500 font-bold text-xs uppercase tracking-widest transition-all flex justify-center items-center gap-2 group"
                    >
                       Next Step <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform"/>
                    </button>
                 ) : (
                    <button 
                      type="submit"
                      disabled={isGenerating}
                      className="flex-1 py-4 bg-indigo-600 text-white rounded-xl shadow-xl shadow-indigo-200 hover:bg-indigo-500 font-bold text-xs uppercase tracking-widest transition-all flex justify-center items-center gap-2 cursor-pointer group"
                    >
                      {isGenerating ? (
                        <><Loader2 className="animate-spin" size={16}/> Designing Plan...</>
                      ) : (
                        <>
                          <Sparkles size={16} className="text-indigo-200 group-hover:text-white transition-colors" /> 
                          Generate 3-Month Plan
                        </>
                      )}
                    </button>
                 )}
              </div>

            </form>
          </div>
       </div>
    </div>
  );
}