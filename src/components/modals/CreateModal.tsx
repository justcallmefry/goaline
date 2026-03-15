"use client";
import React, { useState } from 'react';
import { 
  X, Sprout, Target, Megaphone, CheckSquare, Sparkles, Users, ArrowLeft, Loader2
} from 'lucide-react';
import { createTeamAction } from '@/app/actions/team-actions';
import { GrowthRoadmapWizard } from './GrowthRoadmapWizard';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId?: string;
  /** When set to 'create-team', the modal opens directly to the create-team form. */
  initialView?: 'menu' | 'create-team' | 'growth-roadmap';
}

export default function CreateModal({ isOpen, onClose, userId, initialView = 'menu' }: CreateModalProps) {
  const [view, setView] = useState<'menu' | 'create-team' | 'growth-roadmap'>(initialView);
  const [teamName, setTeamName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  React.useEffect(() => {
    if (isOpen) setView(initialView);
  }, [isOpen, initialView]);

  if (!isOpen) return null;

  if (view === 'growth-roadmap') {
    return (
      <GrowthRoadmapWizard
        onClose={() => setView('menu')}
        onSuccess={() => onClose()}
      />
    );
  }

  // Handle the specific "Create Team" submission
  const handleCreateTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userId) return setError("You must be logged in.");
    if (!teamName.trim()) return setError("Team name is required.");

    setIsLoading(true);
    setError('');

    const formData = new FormData();
    formData.append('teamName', teamName);
    formData.append('userId', userId);

    const result = await createTeamAction(formData);

    setIsLoading(false);

    if (result.success) {
      // Success! Reset and close
      setView('menu');
      setTeamName('');
      onClose();
      // Optional: Refresh page to see new team
      window.location.reload(); 
    } else {
      setError(result.error || "Something went wrong");
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div className="bg-white rounded-[32px] w-full max-w-5xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200 min-h-[600px] flex flex-col">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 z-10 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={24} />
        </button>

        {/* --- VIEW 1: THE MENU --- */}
        {view === 'menu' && (
          <div className="p-12 text-center flex-1 flex flex-col justify-center animate-in slide-in-from-left-4 duration-300">
            
            <h2 className="text-2xl font-bold text-slate-900 mb-10">
              Create Your Growth Plan, Strategy, Campaign or Action Plan with AI
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-10">
              <button
                onClick={() => setView('growth-roadmap')}
                className="flex flex-col items-center text-center p-6 rounded-3xl border border-slate-100 hover:border-green-300 hover:shadow-xl hover:shadow-green-50 transition-all group bg-white h-full"
              >
                <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                  <Sprout size={32} className="text-green-500" />
                </div>
                <h3 className="text-base font-bold text-slate-900 mb-2">Growth Plan</h3>
                <p className="text-[10px] text-slate-500 leading-relaxed px-1">Answer 12 questions, get a revenue path + roadmap</p>
              </button>
              <OptionCard 
                title="Strategy" 
                desc="Design a focused strategy"
                icon={<Target size={32} className="text-blue-500" />}
                color="bg-blue-50"
              />
              <OptionCard 
                title="Campaign" 
                desc="Design targeted marketing"
                icon={<Megaphone size={32} className="text-pink-500" />}
                color="bg-pink-50"
              />
              <OptionCard 
                title="Action Plan" 
                desc="Break down your objectives"
                icon={<CheckSquare size={32} className="text-orange-400" />}
                color="bg-orange-50"
              />

              {/* NEW: Create Team Option */}
              <button 
                onClick={() => setView('create-team')}
                className="flex flex-col items-center text-center p-6 rounded-3xl border-2 border-dashed border-slate-200 hover:border-purple-400 hover:bg-purple-50/50 transition-all group bg-white h-full"
              >
                 <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                   <Users size={32} className="text-purple-600" />
                 </div>
                 <h3 className="text-base font-bold text-slate-900 mb-1">New Team</h3>
                 <p className="text-[10px] text-slate-500 leading-relaxed px-1">Create a team space and invite members</p>
              </button>
            </div>

            {/* Divider */}
            <div className="relative mb-8 max-w-2xl mx-auto w-full">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-slate-200"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="bg-white px-4 text-xs font-bold text-slate-400 uppercase tracking-widest">OR</span>
              </div>
            </div>

            {/* AI Chatbot Button */}
            <div className="flex flex-col items-center gap-4">
              <button className="flex items-center gap-3 bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-full font-bold text-lg shadow-lg shadow-purple-200 transition-all active:scale-95">
                <Sparkles size={20} />
                AI Chatbot
              </button>
            </div>
          </div>
        )}

        {/* --- VIEW: CREATE TEAM FORM --- */}
        {view === 'create-team' && (
           <div className="p-12 flex-1 flex flex-col items-center justify-center animate-in slide-in-from-right-4 duration-300">
             
             <div className="w-full max-w-md">
                <button 
                  onClick={() => setView('menu')}
                  className="flex items-center gap-2 text-slate-400 hover:text-slate-600 mb-8 font-bold text-sm transition-colors"
                >
                  <ArrowLeft size={16} /> Back to menu
                </button>

                <div className="bg-white">
                  <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mb-6">
                    <Users size={32} className="text-purple-600" />
                  </div>
                  
                  <h2 className="text-2xl font-bold text-slate-900 mb-2">Name your team</h2>
                  <p className="text-slate-500 mb-8">This will create a shared workspace for your organization.</p>

                  <form onSubmit={handleCreateTeam} className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 uppercase mb-2 ml-1">Team Name</label>
                      <input 
                        type="text" 
                        value={teamName}
                        onChange={(e) => setTeamName(e.target.value)}
                        placeholder="e.g. Marketing Dept, Acme Corp"
                        className="w-full px-4 py-4 bg-slate-50 border border-slate-200 rounded-xl text-lg font-medium focus:ring-4 focus:ring-purple-100 focus:border-purple-500 outline-none transition-all"
                        autoFocus
                      />
                    </div>

                    {error && (
                      <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg font-medium">
                        {error}
                      </div>
                    )}

                    <button 
                      type="submit" 
                      disabled={isLoading}
                      className="w-full bg-purple-600 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-4 rounded-xl font-bold text-base shadow-lg shadow-purple-200 transition-all active:scale-95 flex items-center justify-center gap-2"
                    >
                      {isLoading ? <Loader2 className="animate-spin" /> : 'Create Team'}
                    </button>
                  </form>
                </div>
             </div>
           </div>
        )}

      </div>
    </div>
  );
}

// Subcomponent for the standard options
function OptionCard({ title, desc, icon, color }: any) {
  return (
    <button className="flex flex-col items-center text-center p-6 rounded-3xl border border-slate-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-50 transition-all group bg-white h-full">
      <div className={`w-16 h-16 ${color} rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-base font-bold text-slate-900 mb-2">{title}</h3>
      <p className="text-[10px] text-slate-500 leading-relaxed px-1">{desc}</p>
    </button>
  );
}