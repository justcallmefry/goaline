import React from 'react';
import Link from 'next/link';
import {
  Rocket, Target, Users, Clock, DollarSign,
  CheckCircle2, ArrowRight, Layout
} from 'lucide-react';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';

export default async function PlansPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const { data: plans } = await supabase
    .from('plans')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false });

  const plan = plans?.[0];
  const hasPlans = Array.isArray(plans) && plans.length > 0;

  if (!hasPlans) {
    return (
      <div className="space-y-8 pb-20">
        <div className="border-b border-slate-200 pb-6">
          <h1 className="text-2xl font-black text-slate-900 mb-1">Your Strategic Plan</h1>
          <p className="text-slate-500 font-medium">You don&apos;t have a plan yet. Create one to get your growth roadmap and report.</p>
        </div>
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center">
          <p className="text-slate-600 mb-6">Answer a few questions about your business and we&apos;ll build a custom plan with next steps and a full report.</p>
          <a
            href="/plan"
            className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 text-white font-bold rounded-xl hover:bg-purple-700 transition-colors"
          >
            Create your first plan
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">Your Strategic Plan</h1>
          <p className="text-slate-500 font-medium">Generated for <span className="text-purple-600 font-bold">{plan.business_name}</span></p>
        </div>
        <div className="flex gap-3">
          <button className="px-5 py-2.5 bg-white border border-slate-200 text-slate-600 font-bold text-sm rounded-xl hover:bg-slate-50 transition-colors">
            Export PDF
          </button>
          <button className="px-5 py-2.5 bg-purple-600 text-white font-bold text-sm rounded-xl hover:bg-purple-700 shadow-md shadow-purple-200 transition-colors flex items-center gap-2">
            <Rocket size={16} /> Execute Plan
          </button>
        </div>
      </div>

      {/* 1. EXECUTIVE SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <SummaryCard 
          icon={<Target className="text-pink-500" />} 
          label="Primary Goal" 
          value={plan.main_goal} 
          color="bg-pink-50"
        />
        <SummaryCard 
          icon={<Clock className="text-blue-500" />} 
          label="Time Commitment" 
          value={plan.time_commitment} 
          color="bg-blue-50"
        />
        <SummaryCard 
          icon={<DollarSign className="text-green-600" />} 
          label="Monthly Budget" 
          value={plan.budget} 
          color="bg-green-50"
        />
      </div>

      {/* 2. STRATEGY DETAILS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: The Context */}
        <div className="lg:col-span-1 space-y-6">
           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Users size={18} className="text-slate-400"/> Target Audience
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {plan.target_audience}
              </p>
           </div>

           <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
              <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                <Layout size={18} className="text-slate-400"/> Value Proposition
              </h3>
              <p className="text-slate-600 text-sm leading-relaxed">
                {plan.value_proposition}
              </p>
           </div>
        </div>

        {/* Right Column: The Action Plan (Mocked AI Output for now) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-100">
             <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <Rocket size={20} className="text-purple-600" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900">Recommended Tactics</h2>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-wider">Based on {plan.industry} Industry</p>
                </div>
             </div>

             <div className="space-y-4">
                {/* We will eventually generate these with AI. For now, we show placeholders based on their goal */}
                <TacticRow 
                  step="01" 
                  title="Optimize Foundation" 
                  desc={`Audit your ${plan.website ? 'website' : 'online presence'} to ensure it speaks directly to your audience.`} 
                />
                <TacticRow 
                  step="02" 
                  title="Launch Outreach Campaign" 
                  desc="Initiate direct outreach to 50 prospects matching your ideal customer profile." 
                />
                <TacticRow 
                  step="03" 
                  title="Content Sprint" 
                  desc={`Create 4 pieces of high-value content addressing the core problem: "${(plan.value_proposition || '').slice(0, 30)}..."`} 
                />
             </div>

             <div className="mt-8 pt-6 border-t border-slate-100 flex justify-end">
                <Link href={`/dashboard/plans/${plan.id}`} className="text-purple-600 font-bold text-sm flex items-center gap-2 hover:gap-3 transition-all">
                  View Full Roadmap <ArrowRight size={16} />
                </Link>
             </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function SummaryCard({ icon, label, value, color }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-start gap-4">
      <div className={`w-12 h-12 ${color} rounded-2xl flex items-center justify-center shrink-0`}>
        {icon}
      </div>
      <div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">{label}</div>
        <div className="font-bold text-slate-900 text-lg leading-tight">{value}</div>
      </div>
    </div>
  );
}

function TacticRow({ step, title, desc }: any) {
  return (
    <div className="group flex gap-4 p-4 rounded-2xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer">
       <div className="text-2xl font-black text-slate-200 group-hover:text-purple-300 transition-colors">{step}</div>
       <div>
         <h4 className="font-bold text-slate-900 text-sm mb-1">{title}</h4>
         <p className="text-slate-500 text-sm leading-relaxed">{desc}</p>
       </div>
       <div className="ml-auto flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
         <div className="w-8 h-8 rounded-full bg-white border border-slate-200 flex items-center justify-center shadow-sm">
           <CheckCircle2 size={16} className="text-slate-300" />
         </div>
       </div>
    </div>
  );
}