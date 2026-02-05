"use client";

import React, { useState } from 'react';
import { GrowthPlan, RoadmapItem } from '@/types/marketing-plan';
import { 
  LayoutDashboard, Target, Map, Megaphone, TrendingUp, CheckCircle2, 
  Clock, DollarSign, FileText, Copy, Check, Printer, ArrowRight, BookOpen, 
  Layers, Info, AlertTriangle, Lightbulb, ChevronRight
} from 'lucide-react';

interface PlanReportProps {
  plan: GrowthPlan;
}

export default function PlanReport({ plan }: PlanReportProps) {
  const [activeSection, setActiveSection] = useState('executive-summary');

  const scrollToSection = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -40;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
      setActiveSection(id);
    }
  };

  return (
    <div className="max-w-7xl mx-auto pb-20 font-sans text-slate-900">
      
      {/* 1. REPORT HEADER */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10 border-b border-slate-200 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-3">
             <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[10px] font-bold uppercase tracking-widest">
               Strategic Masterclass
             </span>
             <span className="text-slate-500 text-xs font-medium tracking-wide">v{plan.meta.version}</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-serif font-bold text-slate-900 tracking-tight mb-2">
            {plan.meta.businessName}
          </h1>
          <p className="text-slate-500 font-medium">Prepared by {plan.meta.consultantName} • {plan.meta.generatedDate}</p>
        </div>
        <div className="flex gap-3">
           <button onClick={() => window.print()} className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-700 hover:bg-slate-50 shadow-sm transition-all">
            <Printer size={16} /> Print Report
          </button>
          <button className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-semibold hover:bg-slate-800 shadow-md transition-all">
            Share Strategy <ArrowRight size={16} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
        
        {/* 2. LEFT NAVIGATION (Sticky) */}
        <div className="hidden lg:block lg:col-span-3">
          <div className="sticky top-8">
            <p className="px-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Table of Contents</p>
            <div className="space-y-1">
              <NavButton active={activeSection === 'executive-summary'} onClick={() => scrollToSection('executive-summary')} label="1. Executive Summary" />
              <NavButton active={activeSection === 'business-brief'} onClick={() => scrollToSection('business-brief')} label="2. Business Context" />
              <NavButton active={activeSection === 'north-star'} onClick={() => scrollToSection('north-star')} label="3. North Star & Math" />
              <NavButton active={activeSection === 'measurement'} onClick={() => scrollToSection('measurement')} label="4. Tracking Setup" />
              <NavButton active={activeSection === 'playbooks'} onClick={() => scrollToSection('playbooks')} label="5. Core Playbooks" />
              <NavButton active={activeSection === 'roadmap'} onClick={() => scrollToSection('roadmap')} label="6. Implementation Map" />
              <NavButton active={activeSection === 'resources'} onClick={() => scrollToSection('resources')} label="7. Budget & Team" />
            </div>
            
            <div className="mt-8 p-4 bg-blue-50 rounded-xl border border-blue-100">
              <div className="flex items-start gap-3">
                <Info className="text-blue-600 shrink-0 mt-0.5" size={16} />
                <p className="text-xs text-blue-800 leading-relaxed">
                  <strong>Pro Tip:</strong> This report is designed to be read top-to-bottom. Do not skip the "Measurement" section—it is the foundation of success.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 3. MAIN DOCUMENT */}
        <div className="col-span-1 lg:col-span-9 space-y-20">

          {/* SECTION 1: EXEC SUMMARY */}
          <section id="executive-summary" className="scroll-mt-20">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">1. Executive Summary</h2>
            
            <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 mb-8 relative overflow-hidden">
              <div className="absolute top-0 left-0 w-2 h-full bg-blue-600"></div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">The One-Line Strategy</h3>
              <p className="text-2xl font-light text-slate-800 italic leading-relaxed">
                "{plan.executiveSummary.strategyOneLiner}"
              </p>
            </div>

            <div className="space-y-6">
              <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Current Diagnosis</h3>
                <ul className="space-y-3">
                  {plan.executiveSummary.diagnosis.map((item, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700 leading-relaxed">
                      <AlertTriangle className="shrink-0 text-amber-500 mt-1" size={16} />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="grid md:grid-cols-3 gap-6">
                {plan.executiveSummary.top3Initiatives.map((init, i) => (
                  <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
                    <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-sm mb-4">{i+1}</div>
                    <h4 className="font-bold text-slate-900 mb-2">{init.title}</h4>
                    <p className="text-sm text-slate-600 flex-grow mb-4">{init.why}</p>
                    <div className="pt-4 border-t border-slate-100">
                      <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider block mb-1">Target Outcome</span>
                      <span className="text-xs font-medium text-slate-900">{init.expectedOutcome}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* SECTION 2: BUSINESS BRIEF */}
          <section id="business-brief" className="scroll-mt-20">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">2. Business Context</h2>
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <div className="grid md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-100">
                <div className="p-8">
                  <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <FileText size={20} className="text-slate-400"/> Inputs
                  </h3>
                  <div className="space-y-4">
                    {plan.businessBrief.inputs.map((input, i) => (
                      <div key={i} className="flex justify-between items-center text-sm">
                        <span className="text-slate-500">{input.label}</span>
                        <span className="font-medium text-slate-900">{input.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="p-8 bg-slate-50/50">
                  <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                    <Target size={20} className="text-slate-400"/> Strategic Reality
                  </h3>
                  <div className="space-y-6">
                    <div>
                      <span className="text-xs font-bold text-red-500 uppercase tracking-wide">Constraints</span>
                      <ul className="mt-2 space-y-2">
                        {plan.businessBrief.constraints.map((c, i) => (
                          <li key={i} className="text-sm text-slate-700 flex items-start gap-2">
                            <span className="text-red-300">•</span> {c}
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                       <span className="text-xs font-bold text-blue-500 uppercase tracking-wide">Market Truth</span>
                       <p className="text-sm text-slate-700 mt-2 leading-relaxed italic border-l-2 border-blue-200 pl-3">
                         "{plan.businessBrief.competitiveReality}"
                       </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 3: NORTH STAR */}
          <section id="north-star" className="scroll-mt-20">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">3. North Star & Math</h2>
            <div className="bg-slate-900 text-white p-10 rounded-2xl shadow-xl text-center mb-8 relative overflow-hidden">
              <div className="relative z-10">
                <div className="text-blue-300 font-bold uppercase tracking-widest text-xs mb-3">Primary Objective</div>
                <div className="text-3xl md:text-5xl font-serif font-bold tracking-tight mb-8">{plan.northStar.primaryObjective}</div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left max-w-4xl mx-auto border-t border-slate-700 pt-8">
                  {plan.northStar.baselineAssumptions.map((assume, i) => (
                    <div key={i}>
                       <div className="text-slate-400 text-xs uppercase font-bold mb-1">Assumption {i+1}</div>
                       <div className="text-sm font-medium text-slate-200">{assume}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* SECTION 4: MEASUREMENT */}
          <section id="measurement" className="scroll-mt-20">
            <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">4. Measurement Setup</h2>
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8 flex gap-4">
              <Lightbulb className="text-amber-600 shrink-0" size={24} />
              <div>
                <h4 className="font-bold text-amber-900 mb-1">Why this matters</h4>
                <p className="text-amber-800 text-sm leading-relaxed">{plan.measurement.concept}</p>
              </div>
            </div>

            <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
               <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 font-bold text-slate-700">Week 1: Implementation Checklist</div>
               <div className="divide-y divide-slate-100">
                 {plan.measurement.week1Checklist.map((item, i) => (
                   <div key={i} className="p-6 hover:bg-slate-50/50 transition-colors">
                     <div className="flex items-start gap-4">
                       <div className={`mt-1 w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${item.done ? 'bg-green-500 border-green-500 text-white' : 'border-slate-300 bg-white'}`}>
                         {item.done && <Check size={14} />}
                       </div>
                       <div className="flex-1">
                         <div className="flex justify-between items-center mb-1">
                           <h4 className={`font-bold text-lg ${item.done ? 'text-slate-400 line-through' : 'text-slate-900'}`}>{item.task}</h4>
                         </div>
                         <p className="text-slate-600 text-sm mb-3">{item.description}</p>
                         <div className="bg-blue-50 text-blue-800 text-xs p-3 rounded-lg border border-blue-100 inline-block w-full">
                           <span className="font-bold mr-1">How to do it:</span> {item.howTo}
                         </div>
                       </div>
                     </div>
                   </div>
                 ))}
               </div>
            </div>
          </section>

          {/* SECTION 5: PLAYBOOKS (THE MEAT) */}
          <section id="playbooks" className="scroll-mt-20">
             <div className="flex items-center justify-between mb-8">
               <h2 className="text-3xl font-serif font-bold text-slate-900">5. Core Playbooks</h2>
               <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-200">Action Required</span>
             </div>
             
             <div className="space-y-16">
               {plan.playbooks.map((playbook, idx) => (
                 <div key={playbook.id} className="border border-slate-300 rounded-2xl overflow-hidden shadow-sm bg-white">
                   {/* Playbook Header */}
                   <div className="bg-slate-900 text-white p-8">
                     <div className="flex items-center gap-3 mb-4">
                       <span className="bg-blue-600 text-white text-xs font-bold px-2 py-1 rounded uppercase tracking-wider">Playbook 0{idx+1}</span>
                       <h3 className="text-2xl font-bold">{playbook.title}</h3>
                     </div>
                     <p className="text-slate-300 text-lg mb-6">{playbook.subtitle}</p>
                     
                     <div className="grid md:grid-cols-2 gap-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700">
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Concept</span>
                          <p className="text-sm text-slate-200 mt-1 leading-relaxed">{playbook.conceptDefinition}</p>
                        </div>
                        <div>
                          <span className="text-slate-400 text-[10px] uppercase font-bold tracking-wider">Why it wins</span>
                          <p className="text-sm text-slate-200 mt-1 leading-relaxed">{playbook.whyItMatters}</p>
                        </div>
                     </div>
                   </div>

                   {/* Steps Container */}
                   <div className="divide-y divide-slate-200">
                     {playbook.steps.map((step, i) => (
                       <div key={i} className="grid md:grid-cols-12 group">
                         {/* LEFT: Education (Why) */}
                         <div className="md:col-span-5 p-8 bg-slate-50 border-r border-slate-200">
                           <div className="flex items-center gap-2 mb-3">
                             <span className="w-6 h-6 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center font-bold text-xs">{step.stepNumber}</span>
                             <h4 className="font-bold text-slate-900">{step.title}</h4>
                           </div>
                           <p className="text-sm text-slate-600 leading-relaxed italic">
                             "{step.educationalContext}"
                           </p>
                         </div>
                         {/* RIGHT: Action (How) */}
                         <div className="md:col-span-7 p-8 bg-white">
                            <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Action Instruction</h5>
                            <p className="text-slate-800 font-medium leading-relaxed mb-4">{step.actionInstruction}</p>
                            {step.proTip && (
                              <div className="flex gap-2 items-start text-xs text-amber-700 bg-amber-50 p-3 rounded border border-amber-100">
                                <Lightbulb size={14} className="shrink-0 mt-0.5" />
                                <span><strong>Pro Tip:</strong> {step.proTip}</span>
                              </div>
                            )}
                         </div>
                       </div>
                     ))}
                   </div>

                   {/* Assets Footer */}
                   {playbook.assets.length > 0 && (
                     <div className="bg-slate-100 p-8 border-t border-slate-200">
                       <h4 className="font-bold text-slate-900 mb-4 flex items-center gap-2">
                         <Copy size={18} /> Included Templates
                       </h4>
                       <div className="grid gap-4">
                         {playbook.assets.map((asset, i) => (
                           <AssetCard key={i} title={asset.title} content={asset.content} />
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
               ))}
             </div>
          </section>

          {/* SECTION 6: ROADMAP */}
          <section id="roadmap" className="scroll-mt-20">
             <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">6. Implementation Map</h2>
             <div className="bg-white border border-slate-200 rounded-2xl p-8">
               <div className="space-y-8 relative before:absolute before:left-[19px] before:top-4 before:bottom-4 before:w-0.5 before:bg-slate-100">
                <RoadmapPhase title="Phase 1: Foundation (Days 1-30)" items={plan.roadmap.phase1} color="bg-blue-600" />
                <RoadmapPhase title="Phase 2: Growth (Days 31-60)" items={plan.roadmap.phase2} color="bg-indigo-600" />
                <RoadmapPhase title="Phase 3: Scale (Days 61-90)" items={plan.roadmap.phase3} color="bg-purple-600" />
               </div>
             </div>
          </section>

          {/* SECTION 7: RESOURCES */}
          <section id="resources" className="scroll-mt-20">
             <h2 className="text-3xl font-serif font-bold text-slate-900 mb-6">7. Budget & Resources</h2>
             <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
               <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-slate-200">
                 {/* Budget */}
                 <div className="p-8">
                   <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                     <DollarSign className="text-green-600"/> Monthly Investment
                   </h3>
                   <div className="space-y-6">
                     {plan.resources.monthlyBudgetSplit.map((item, i) => (
                       <div key={i}>
                         <div className="flex justify-between text-sm mb-1">
                           <span className="font-bold text-slate-900">{item.channel}</span>
                           <span className="font-bold text-slate-900">{item.amount}</span>
                         </div>
                         <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden mb-2">
                           <div className="h-full bg-green-600" style={{ width: `${item.percentage}%` }}></div>
                         </div>
                         <p className="text-xs text-slate-500 italic">{item.rationale}</p>
                       </div>
                     ))}
                   </div>
                 </div>
                 {/* Routine */}
                 <div className="p-8 bg-slate-50">
                    <h3 className="font-bold text-slate-900 mb-6 flex items-center gap-2">
                     <Clock className="text-slate-400"/> Operating Cadence
                   </h3>
                   <div className="space-y-4">
                      {plan.demandGeneration.routines.map((item, i) => (
                        <div key={i} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm">
                           <div className="flex justify-between mb-1">
                             <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600">{item.frequency}</span>
                             <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Owner: {item.role}</span>
                           </div>
                           <div className="font-bold text-slate-900 text-sm mb-1">{item.task}</div>
                           <div className="text-xs text-slate-500">{item.why}</div>
                        </div>
                      ))}
                   </div>
                 </div>
               </div>
             </div>
          </section>

        </div>
      </div>
    </div>
  );
}

// --- SUB COMPONENTS ---

function NavButton({ active, onClick, label }: any) {
  return (
    <button 
      onClick={onClick}
      className={`w-full block px-4 py-2 text-sm text-left transition-colors border-l-2 ${
        active 
          ? 'border-blue-600 text-blue-700 font-bold bg-blue-50' 
          : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
      }`}
    >
      {label}
    </button>
  );
}

function RoadmapPhase({ title, items, color }: { title: string, items: RoadmapItem[], color: string }) {
  return (
    <div className="relative pl-10">
      <div className={`absolute left-0 top-0 w-10 h-10 rounded-full border-4 border-white ${color} flex items-center justify-center shadow-sm z-10 text-white font-bold text-sm`}>
        {items[0]?.week}
      </div>
      <h3 className="text-lg font-bold text-slate-900 mb-6 pt-2">{title}</h3>
      <div className="space-y-4">
        {items.map((item, i) => (
          <div key={i} className="flex gap-4 items-start p-4 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100">
             <div className="text-xs font-bold text-slate-400 uppercase tracking-wider w-16 shrink-0 pt-1">Week {item.week}</div>
             <div>
               <h4 className="font-bold text-slate-900 text-sm">{item.title}</h4>
               <p className="text-slate-600 text-sm mt-1">{item.description}</p>
             </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function AssetCard({ title, content }: { title: string, content: string }) {
  const [copied, setCopied] = useState(false);
  const handleCopy = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  return (
    <div className="bg-white border border-slate-200 rounded-lg overflow-hidden shadow-sm">
      <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center">
        <span className="font-bold text-slate-700 text-sm flex items-center gap-2"><FileText size={14} className="text-slate-400"/> {title}</span>
        <button onClick={handleCopy} className="text-xs flex items-center gap-1 font-medium text-blue-600 hover:text-blue-800 transition">
          {copied ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
        </button>
      </div>
      <div className="p-4 bg-slate-50/50">
        <pre className="whitespace-pre-wrap font-mono text-xs text-slate-600 bg-white p-4 rounded border border-slate-200 leading-relaxed">
          {content}
        </pre>
      </div>
    </div>
  );
}