"use client";
import React from 'react';
import { 
  X, Sprout, Target, Megaphone, CheckSquare, Sparkles 
} from 'lucide-react';

interface CreateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CreateModal({ isOpen, onClose }: CreateModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      
      {/* Modal Card */}
      <div className="bg-white rounded-[32px] w-full max-w-5xl shadow-2xl overflow-hidden relative animate-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-full transition-colors"
        >
          <X size={24} />
        </button>

        <div className="p-12 text-center">
          
          {/* Header */}
          <h2 className="text-2xl font-bold text-slate-900 mb-10">
            Create Your Growth Plan, Strategy, Campaign or Action Plan with AI
          </h2>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
            <OptionCard 
              title="Create Growth Plan" 
              desc="Craft a comprehensive plan to outline your goals"
              icon={<Sprout size={40} className="text-green-500" />}
              color="bg-green-50"
            />
            <OptionCard 
              title="Create Strategy" 
              desc="Design a focused strategy to tackle specific challenges"
              icon={<Target size={40} className="text-blue-500" />}
              color="bg-blue-50"
            />
            <OptionCard 
              title="Create Campaign" 
              desc="Design targeted marketing and engagement campaigns"
              icon={<Megaphone size={40} className="text-pink-500" />}
              color="bg-pink-50"
            />
            <OptionCard 
              title="Create Action Plan" 
              desc="Break down your objectives into clear, actionable steps"
              icon={<CheckSquare size={40} className="text-orange-400" />}
              color="bg-orange-50"
            />
          </div>

          {/* Divider */}
          <div className="relative mb-8">
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
            <p className="text-xs text-slate-400 font-medium max-w-sm">
              Your AI-powered guide to creating Growth Plans, Strategies, Action Plan and Campaigns!
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}

function OptionCard({ title, desc, icon, color }: any) {
  return (
    <button className="flex flex-col items-center text-center p-8 rounded-3xl border border-slate-100 hover:border-purple-200 hover:shadow-xl hover:shadow-purple-50 transition-all group bg-white h-full">
      <div className={`w-20 h-20 ${color} rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform`}>
        {icon}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-3">{title}</h3>
      <p className="text-xs text-slate-500 leading-relaxed px-2">{desc}</p>
    </button>
  );
}