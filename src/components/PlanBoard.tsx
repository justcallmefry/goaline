'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent, 
  DragOverlay, 
  useSensor, 
  useSensors, 
  PointerSensor, 
  TouchSensor, 
  useDroppable,
  defaultDropAnimationSideEffects, 
  DropAnimation,
  useDraggable
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { 
  GripVertical, Plus, Trash2, X, Sparkles, Loader2, Download, 
  CheckCircle2, PieChart, Megaphone, Zap, Heart, Layers, 
  BookOpen, ChevronLeft, Target, AlertTriangle, Bookmark, Search,
  // ICONS
  PenTool, Mail, Share2, Briefcase, Box, ArrowRight, DollarSign, Info, Users, MapPin, BadgeCheck, UserCircle, Settings, LogOut, Lock, Upload, Image as ImageIcon, ShieldCheck, Rocket, HelpCircle
} from 'lucide-react'; 
import { createClient } from '@supabase/supabase-js';
import { generateMarketingPlan, generateTacticContent } from '@/app/actions';
import jsPDF from 'jspdf';

// Initialize Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- TYPES ---
export type Tactic = { id: string; title: string; budget: number; content?: string };
export type Lane = { id: string; title: string; items: Tactic[] };
export type LibraryTactic = { id: string; title: string; description: string; default_budget: number; category: string };
export type Tool = { id: string; name: string; description: string; logo_url: string; affiliate_link: string; tags: string[]; pricing?: string; value_prop?: string; };
export type Agency = { id: string; name: string; description: string; website_link: string; tags: string[]; location: string; pricing_model: string; verified: boolean; };

// --- HELPERS ---
function getLaneIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('awareness')) return <Megaphone size={18} className="text-blue-500" />;
  if (t.includes('consideration') || t.includes('conversion')) return <Zap size={18} className="text-amber-500" fill="currentColor" fillOpacity={0.2} />;
  if (t.includes('retention') || t.includes('decision')) return <Heart size={18} className="text-rose-500" fill="currentColor" fillOpacity={0.2} />;
  return <Layers size={18} className="text-slate-400" />;
}

function getLaneDescription(title: string) {
  const t = title.toLowerCase();
  if (t.includes('awareness')) return "The 'See Me' Phase. Tactics here focus on reaching cold audiences who don't know you yet. Goal: Impressions & Traffic.";
  if (t.includes('consideration') || t.includes('conversion')) return "The 'Buy Me' Phase. Tactics here target people who know you but haven't bought yet. Goal: Leads & Sales.";
  if (t.includes('retention') || t.includes('decision')) return "The 'Love Me' Phase. Tactics here focus on existing customers to drive repeat purchases and referrals. Goal: LTV & Low Churn.";
  return "General planning stage for miscellaneous tasks.";
}

function getToolIcon(name: string, size: number = 14) {
  const n = name.toLowerCase();
  if (n.includes('hubspot') || n.includes('crm')) return <Briefcase size={size} className="text-orange-500" />;
  if (n.includes('mail') || n.includes('send')) return <Mail size={size} className="text-yellow-500" />;
  if (n.includes('canva') || n.includes('design')) return <PenTool size={size} className="text-blue-500" />;
  if (n.includes('buffer') || n.includes('social')) return <Share2 size={size} className="text-indigo-500" />;
  return <Box size={size} className="text-slate-400" />;
}

// --- COMPONENTS ---

// [UPDATED] TOUR GUIDE COMPONENT (Desktop Only + Click Outside to Close)
function TourGuide({ active, onClose, onNext, stepIndex, totalSteps }: { active: boolean, onClose: () => void, onNext: () => void, stepIndex: number, totalSteps: number }) {
    const [position, setPosition] = useState<{top: number, left: number, width: number, height: number} | null>(null);
    
    const steps = [
        { id: 'lane-awareness', title: 'The Awareness Phase', text: 'Start here. These tactics are purely for getting noticed by new people who don\'t know you yet.' },
        { id: 'lane-conversion', title: 'The Conversion Phase', text: 'This is where money is made. Tactics here turn "interested leads" into "paying customers".' },
        { id: 'lane-retention', title: 'The Retention Phase', text: 'Don\'t forget your existing customers! Use these tactics to increase Lifetime Value (LTV).' },
        { id: 'tour-library-btn', title: 'Tactic Library', text: 'Stuck? Click here to open our curated library of growth hacks and drag them onto your board.' },
        { id: 'tour-profile-btn', title: 'Branding Settings', text: 'Important! Click here to add your Company Name and Logo so your PDF reports look professional.' }
    ];

    const currentStep = steps[stepIndex];

    useEffect(() => {
        if (!active) return;
        
        // MOBILE GUARD: Double check to kill tour on mobile
        if (window.innerWidth < 768) { 
            onClose(); 
            return; 
        }

        const timer = setTimeout(() => {
            const element = document.getElementById(currentStep.id) || document.querySelector(`[id*="${currentStep.id}"]`);
            if (element) {
                const rect = element.getBoundingClientRect();
                setPosition({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                });
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [stepIndex, active, currentStep.id]);

    if (!active || !position) return null;

    // Safety Calculations
    const tooltipTop = position.top + position.height + 20;
    const isTooLow = tooltipTop + 200 > window.innerHeight;
    const finalTop = isTooLow ? position.top - 220 : tooltipTop; 
    const maxLeft = window.innerWidth - 420; 
    const finalLeft = Math.min(Math.max(20, position.left), maxLeft);

    return (
        <div 
            className="fixed inset-0 z-[100] bg-slate-900/70 transition-all duration-300 cursor-pointer hidden md:block"
            onClick={onClose} // CLICK BACKGROUND TO CLOSE
        >
            <div 
                className="absolute bg-transparent border-4 border-indigo-500 rounded-xl shadow-[0_0_0_9999px_rgba(15,23,42,0.8)] transition-all duration-500 ease-in-out pointer-events-none"
                style={{ top: position.top - 10, left: position.left - 10, width: position.width + 20, height: position.height + 20 }}
            />
            <div 
                onClick={(e) => e.stopPropagation()} 
                className="absolute bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full transition-all duration-500 ease-in-out cursor-default"
                style={{ top: finalTop, left: finalLeft }}
            >
                <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">Step {stepIndex + 1} of {totalSteps}</span>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">{currentStep.title}</h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">{currentStep.text}</p>
                <div className="flex justify-end gap-2">
                    {stepIndex < totalSteps - 1 ? (
                        <button onClick={onNext} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 cursor-pointer">Next Step</button>
                    ) : (
                        <button onClick={onClose} className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 cursor-pointer">Finish Tour</button>
                    )}
                </div>
            </div>
        </div>
    );
}

// 1. LOGIN SCREEN
function LoginScreen() {
  const [isRedirecting, setIsRedirecting] = useState(false);

  const handleGoogleLogin = async () => {
    setIsRedirecting(true);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/`,
      },
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center p-4 font-sans">
       <div className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-500">
          <div className="p-8 text-center">
             <div className="w-16 h-16 bg-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg shadow-indigo-200">
                <Target size={32} className="text-white" />
             </div>
             <h1 className="text-2xl font-black text-slate-900 uppercase tracking-widest mb-2">GoaLine</h1>
             <p className="text-slate-500 mb-8 text-sm font-medium">Build your growth strategy. Find trusted experts.</p>
             <button onClick={handleGoogleLogin} disabled={isRedirecting} className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 hover:border-indigo-200 hover:bg-slate-50 text-slate-700 font-bold py-4 rounded-xl transition-all shadow-sm group cursor-pointer relative">
                {isRedirecting ? <Loader2 className="animate-spin text-indigo-600" size={20} /> : (
                  <>
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    <span>Sign in with Google</span>
                  </>
                )}
             </button>
             <div className="mt-6 flex items-center justify-center gap-2 text-[10px] text-slate-400 font-bold uppercase tracking-widest"><Lock size={10} /><span>Secure Authentication</span></div>
          </div>
          <div className="bg-slate-50 p-4 border-t border-slate-100 text-center"><p className="text-xs text-slate-400">By continuing, you agree to our Terms of Service.</p></div>
       </div>
    </div>
  );
}

// 2. LIBRARY ITEM
function DraggableLibraryItem({ lib, onAdd }: { lib: LibraryTactic, onAdd: (l: LibraryTactic) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: `lib-${lib.id}`, data: { type: 'library', item: lib } });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={`p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-400 transition-all group cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-30' : ''}`}>
       <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-1.5 py-0.5 bg-indigo-50 rounded text-indigo-700">{lib.category}</span>
          <button onPointerDown={(e) => e.stopPropagation()} onClick={() => onAdd(lib)} className="md:opacity-0 group-hover:opacity-100 p-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"><Plus size={14} strokeWidth={3} /></button>
       </div>
       <h4 className="font-bold text-slate-900 text-sm mb-1">{lib.title}</h4>
       <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{lib.description}</p>
       <div className="text-[10px] font-bold text-slate-400 font-mono">${lib.default_budget.toLocaleString()}</div>
    </div>
  );
}

// 3. TACTIC CARD (Fixed Duplicate Tools by Name)
function TacticCard({ 
  tactic, 
  tools,
  agencies,
  onDelete, 
  onEdit, 
  onUpdateBudget,
  onOpenTool,
  onOpenAgency,
  isOverlay, 
  isDragging,
  dragHandleProps 
}: { 
  tactic: Tactic, 
  tools?: Tool[],
  agencies?: Agency[], 
  onDelete?: (id: string) => void, 
  onEdit?: (tactic: Tactic) => void, 
  onUpdateBudget?: (id: string, budget: number) => void,
  onOpenTool?: (tool: Tool) => void,
  onOpenAgency?: (agency: Agency) => void,
  isOverlay?: boolean, 
  isDragging?: boolean,
  dragHandleProps?: any
}) {
  
  // FIX: DEDUPLICATE BY NAME (Not ID)
  const matchingTools = useMemo(() => {
    if (!tools || !tactic.title) return [];
    
    // 1. Find all matches
    const allMatches = tools.filter(tool => 
      tool.tags && tool.tags.some(tag => tactic.title.toLowerCase().includes(tag.toLowerCase()))
    );

    // 2. Remove duplicates based on NAME (e.g. "HubSpot")
    // This fixes the issue where you have multiple "HubSpot" rows in the DB
    return Array.from(new Map(allMatches.map(item => [item.name, item])).values()).slice(0, 3);
  }, [tools, tactic.title]);

  const matchingAgencies = useMemo(() => {
    if (!agencies || !tactic.title) return [];
    return agencies.filter(agency => 
      agency.tags && agency.tags.some(tag => tactic.title.toLowerCase().includes(tag.toLowerCase()))
    ).slice(0, 2);
  }, [agencies, tactic.title]);

  return (
    <div 
      // CLICK BODY TO EDIT (Not drag)
      onClick={() => {
          if (!isDragging && onEdit) onEdit(tactic);
      }}
      className={`
        group relative p-4 mb-3 rounded-xl bg-white border border-slate-200 shadow-sm
        ${isOverlay ? 'shadow-2xl ring-2 ring-indigo-500/20 rotate-2 scale-105 cursor-grabbing z-50' : 'hover:shadow-md hover:border-indigo-400 hover:-translate-y-1'}
        ${isDragging ? 'opacity-30 grayscale border-dashed border-slate-300' : 'opacity-100'}
        transition-all duration-200 ease-out select-none flex flex-col gap-3
      `}>
      
      {!isOverlay && onDelete && (
        <button 
          onPointerDown={(e) => { e.stopPropagation(); onDelete(tactic.id); }}
          className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 lg:group-hover:opacity-100 transition-opacity duration-200 ignore-pdf cursor-pointer z-10" 
        >
          <Trash2 size={15} />
        </button>
      )}

      <div className="flex gap-4 items-start">
        {/* DRAG HANDLE ONLY HERE */}
        <div 
            className={`mt-1 transition-colors cursor-grab active:cursor-grabbing ${isOverlay ? 'text-indigo-600' : 'text-slate-300 lg:group-hover:text-indigo-500'}`}
            {...dragHandleProps} 
        >
          <GripVertical size={18} />
        </div>

        <div className="flex-1 space-y-3 cursor-pointer">
          <div className="pr-6">
             <div className="font-bold text-slate-800 text-[15px] leading-snug">
                {tactic.title}
             </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-1">
             <div 
               onClick={(e) => e.stopPropagation()} 
               className="flex items-center gap-1 px-2 py-1 rounded-md bg-slate-100 text-xs font-bold text-slate-600 font-mono focus-within:ring-2 focus-within:ring-indigo-500 transition-all cursor-text"
             >
                <span className="opacity-50">$</span>
                <input 
                  type="number"
                  key={tactic.budget}
                  defaultValue={tactic.budget}
                  onPointerDown={(e) => e.stopPropagation()} 
                  onFocus={(e) => e.target.select()}
                  onBlur={(e) => onUpdateBudget && onUpdateBudget(tactic.id, parseFloat(e.target.value) || 0)}
                  className="bg-transparent outline-none w-16 cursor-text font-bold"
                />
             </div>

             {tactic.content ? (
                <div className="flex items-center gap-1.5 text-[10px] font-black uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2 py-1 rounded">
                    <CheckCircle2 size={11} strokeWidth={3} />
                    <span>READY</span>
                </div>
             ) : (
                <div className="text-[10px] font-bold uppercase tracking-wider text-slate-300 px-2">
                    Draft
                </div>
             )}
          </div>
        </div>
      </div>

      {(matchingTools.length > 0 || matchingAgencies.length > 0) && (
        <div className="pt-3 border-t border-slate-50 flex flex-col gap-3">
           {matchingTools.length > 0 && (
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Recommended Tools</div>
              <div className="flex gap-2">
                  {matchingTools.map((tool: Tool) => (
                    <div 
                      key={tool.id} 
                      onClick={(e) => { e.stopPropagation(); onOpenTool && onOpenTool(tool); }} 
                      className="flex items-center gap-2 px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg hover:bg-white hover:border-indigo-200 hover:shadow-sm transition-all group/tool cursor-pointer"
                      title="Click for details"
                    >
                      {getToolIcon(tool.name)}
                      <span className="text-[10px] font-bold text-slate-600 group-hover/tool:text-indigo-600">{tool.name}</span>
                      <Info size={10} className="text-slate-300 group-hover/tool:text-indigo-400" />
                    </div>
                  ))}
              </div>
            </div>
           )}

           {matchingAgencies.length > 0 && (
            <div>
              <div className="text-[9px] font-bold text-slate-400 uppercase tracking-widest mb-2">Verified Experts</div>
              <div className="flex gap-2">
                  {matchingAgencies.map(agency => (
                    <div 
                      key={agency.id} 
                      onClick={(e) => { e.stopPropagation(); onOpenAgency && onOpenAgency(agency); }} 
                      className="flex items-center gap-2 px-2 py-1.5 bg-purple-50 border border-purple-100 rounded-lg hover:bg-white hover:border-purple-300 hover:shadow-sm transition-all group/agency cursor-pointer"
                      title="Hire an Expert"
                    >
                      <BadgeCheck size={14} className="text-purple-600" />
                      <span className="text-[10px] font-bold text-purple-900 group-hover/agency:text-purple-700">{agency.name}</span>
                    </div>
                  ))}
              </div>
            </div>
           )}
        </div>
      )}
    </div>
  );
}

// 4. SORTABLE WRAPPER (Fixed Drag Props Passing)
function SortableTacticCard({ tactic, tools, agencies, onDelete, onEdit, onUpdateBudget, onOpenTool, onOpenAgency }: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tactic.id });
    const style = { transform: CSS.Translate.toString(transform), transition };
    return (
        <div ref={setNodeRef} style={style}>
            <TacticCard 
                tactic={tactic} 
                tools={tools} 
                agencies={agencies} 
                onDelete={onDelete} 
                onEdit={onEdit} 
                onUpdateBudget={onUpdateBudget} 
                onOpenTool={onOpenTool} 
                onOpenAgency={onOpenAgency} 
                isDragging={isDragging} 
                dragHandleProps={{...attributes, ...listeners}} // Pass drag logic down to handle only
            />
        </div>
    );
}

// 5. PLAN LANE
function PlanLane({ lane, tools, agencies, onAdd, onDelete, onEdit, onUpdateBudget, onOpenTool, onOpenAgency, onOpenLaneInfo }: any) {
  const { setNodeRef, isOver } = useDroppable({ id: lane.id });
  const laneTotal = lane.items.reduce((sum: number, item: any) => sum + item.budget, 0);

  // Generate a safe ID for the Tour Guide to target
  // e.g., "lane-awareness" or "lane-conversion"
  const laneId = `lane-${lane.title.toLowerCase().split(' ')[0]}`;

  return (
    <div ref={setNodeRef} id={laneId} className="w-full md:flex-1 md:min-w-[350px] flex flex-col h-auto md:h-full transition-all duration-200">
      <div className={`flex flex-col h-full bg-white rounded-2xl shadow-xl md:shadow-2xl overflow-hidden border transition-all duration-200
          ${isOver ? 'border-indigo-500 ring-4 ring-indigo-500/10 bg-indigo-50/30' : 'border-slate-100'} 
      `}>
          <div className={`p-6 border-b transition-colors duration-200 ${isOver ? 'bg-indigo-50 border-indigo-200' : 'bg-white border-slate-100'}`}>
            <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-white border border-slate-200 rounded-lg shadow-sm">
                        {getLaneIcon(lane.title)}
                    </div>
                    <h3 className="font-black text-slate-900 text-lg uppercase tracking-tighter">
                        {lane.title}
                    </h3>
                    <button 
                      onClick={() => onOpenLaneInfo(lane.title)} 
                      className="ml-1 text-slate-300 hover:text-indigo-500 transition-colors"
                      title="What is this stage?"
                    >
                      <Info size={14} />
                    </button>
                </div>
                <span className="flex items-center gap-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-black shadow-lg">
                    <span className="text-xs font-bold text-white font-mono">${laneTotal.toLocaleString()}</span>
                </span>
            </div>
            
            <button onClick={() => onAdd(lane.id)} className="group w-full py-3 flex items-center justify-center gap-2 bg-white border-2 border-slate-100 rounded-xl text-xs font-bold uppercase tracking-wider text-slate-400 hover:text-white hover:bg-slate-900 hover:border-slate-900 transition-all duration-200 ignore-pdf cursor-pointer">
                <Plus size={14} strokeWidth={3} className="text-slate-300 group-hover:text-white" /> Add Tactic
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar min-h-[200px] md:min-h-0">
            <SortableContext items={lane.items.map((i: any) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col pb-2">
                {lane.items.length === 0 && (
                    <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                        <PieChart className="text-slate-300 mb-2" size={24} />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Empty Stage</p>
                    </div>
                )}
                {lane.items.map((tactic) => (
                    <SortableTacticCard key={tactic.id} tactic={tactic} tools={tools} agencies={agencies} onDelete={onDelete} onEdit={onEdit} onUpdateBudget={onUpdateBudget} onOpenTool={onOpenTool} onOpenAgency={onOpenAgency} />
                ))}
              </div>
            </SortableContext>
          </div>
      </div>
    </div>
  );
}

// 6. MAIN WORKSPACE
export default function PlanBoard({ initialLanes }: { initialLanes: Lane[] }) {
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  
  // Profile & State
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  
  // Welcome Wizard State
  const [showWelcomeWizard, setShowWelcomeWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [wizardInput, setWizardInput] = useState('');
  const [isWizardGenerating, setIsWizardGenerating] = useState(false);

  // Tour State
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);

  // Settings Form State
  const [bizName, setBizName] = useState('');
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [isSavingProfile, setIsSavingProfile] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Admin Modal State
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [adminTacticName, setAdminTacticName] = useState('');
  const [adminTacticDesc, setAdminTacticDesc] = useState('');
  const [adminTacticBudget, setAdminTacticBudget] = useState(0);
  const [adminTacticCategory, setAdminTacticCategory] = useState('Awareness');

  const [lanes, setLanes] = useState<Lane[]>(initialLanes);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTactic, setActiveTactic] = useState<Tactic | null>(null);
  const [activeLibraryItem, setActiveLibraryItem] = useState<LibraryTactic | null>(null);

  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');
  const [library, setLibrary] = useState<LibraryTactic[]>([]);
  const [tools, setTools] = useState<Tool[]>([]); 
  const [agencies, setAgencies] = useState<Agency[]>([]); 

  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);   
  const [isDownloading, setIsDownloading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [isSavingTemplate, setIsSavingTemplate] = useState(false);

  // Modals
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null); 
  const [laneInfoTitle, setLaneInfoTitle] = useState<string | null>(null);

  const [targetLaneId, setTargetLaneId] = useState<string | null>(null);
  const [editingTactic, setEditingTactic] = useState<Tactic | null>(null);
  const [tacticToDelete, setTacticToDelete] = useState<string | null>(null); 
  const [tacticName, setTacticName] = useState('');
  const [tacticBudget, setTacticBudget] = useState(0);
  const [tacticContent, setTacticContent] = useState(''); 
  const [businessDesc, setBusinessDesc] = useState(''); 

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  );

  const totalBudget = lanes.reduce((sum, lane) => sum + lane.items.reduce((s, i) => s + i.budget, 0), 0);
  const totalTactics = lanes.reduce((sum, lane) => sum + lane.items.length, 0);

  // 1. CHECK SESSION ON LOAD
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoadingSession(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoadingSession(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 2. FETCH DATA (Only if logged in)
  useEffect(() => {
    if (!session) return; 

    async function fetchData() {
      const { data: libData } = await supabase.from('tactics_library').select('*');
      if (libData) setLibrary(libData);

      const { data: toolData } = await supabase.from('tools').select('*');
      if (toolData) setTools(toolData);

      const { data: agencyData } = await supabase.from('agencies').select('*');
      if (agencyData) setAgencies(agencyData);

      const { data: userItems } = await supabase.from('plan_items').select('*');
      
      // AUTO-TRIGGER WELCOME WIZARD IF BOARD IS EMPTY
      if (!userItems || userItems.length === 0) {
          setShowWelcomeWizard(true);
      } else {
          const newLanes = initialLanes.map(lane => ({
              ...lane,
              items: userItems.filter((i: any) => i.section_id === lane.id).map((i: any) => ({
                  id: i.id,
                  title: i.custom_notes || 'Untitled',
                  budget: i.allocated_budget || 0,
                  content: i.content
              }))
          }));
          setLanes(newLanes);
      }

      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (profileData) {
          setProfile(profileData);
          setBizName(profileData.business_name || '');
          setIsAdmin(!!profileData.is_admin);
      }
    }
    fetchData();
  }, [session, initialLanes]);

  const filteredLibrary = useMemo(() => {
    return library.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(librarySearch.toLowerCase()) || 
                            item.description.toLowerCase().includes(librarySearch.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [library, librarySearch, selectedCategory]);

  const categories = useMemo(() => {
     const unique = new Set(library.map(l => l.category));
     return ['All', ...Array.from(unique)];
  }, [library]);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setSession(null);
  };

  // --- WELCOME WIZARD LOGIC ---
  const handleWizardSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!wizardInput.trim()) return;
      
      setIsWizardGenerating(true);
      
      // 1. Generate Tactics via AI
      const suggestions = await generateMarketingPlan(wizardInput);
      
      if (suggestions && suggestions.length > 0) {
          // 2. Distribute tactics
          const laneIds = lanes.map(l => l.id);
          const distributionMap = [laneIds[0], laneIds[0], laneIds[1], laneIds[2], laneIds[3]];
          
          const newItems = suggestions.map((s: any, index: number) => ({
              id: crypto.randomUUID(),
              title: s.title,
              budget: s.budget,
              content: '',
              section_id: distributionMap[index % distributionMap.length] || laneIds[0]
          }));

          // 3. Save to Database
          for (const item of newItems) {
              await supabase.from('plan_items').insert({
                  id: item.id,
                  section_id: item.section_id,
                  custom_notes: item.title,
                  allocated_budget: item.budget,
                  user_id: session.user.id
              });
          }

          // 4. Update UI
          setLanes(prev => prev.map(lane => ({
              ...lane,
              items: [...lane.items, ...newItems.filter((i: any) => i.section_id === lane.id)]
          })));
          
          // 5. Save Business Name
          if (wizardInput.length < 50) {
             await supabase.from('profiles').update({ business_name: wizardInput }).eq('id', session.user.id);
             setProfile((prev: any) => ({ ...prev, business_name: wizardInput }));
          }

          setShowWelcomeWizard(false);
          
          // 6. START TOUR AUTOMATICALLY AFTER WIZARD (DESKTOP ONLY)
          if (window.innerWidth > 768) {
              setTimeout(() => {
                  setIsTourActive(true);
                  setTourStepIndex(0);
              }, 1000);
          }
      }
      setIsWizardGenerating(false);
  };

  // ADMIN: Create New Library Item
  const handleCreateLibraryTactic = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!isAdmin) return;
      
      const { data, error } = await supabase.from('tactics_library').insert({
          title: adminTacticName,
          description: adminTacticDesc,
          default_budget: adminTacticBudget,
          category: adminTacticCategory
      }).select().single();

      if (data) {
          setLibrary(prev => [...prev, data]);
          setIsAdminModalOpen(false);
          setAdminTacticName('');
          setAdminTacticDesc('');
          setAdminTacticBudget(0);
      } else {
          alert('Failed to create tactic.');
      }
  };

  // ... (Rest of existing handlers like handleSaveProfile, addFromLibrary, etc.) ...
  const handleSaveProfile = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!session) return;
      setIsSavingProfile(true);
      setErrorMessage(null);

      try {
          let logoUrl = profile?.logo_url;
          if (logoFile) {
              const fileExt = logoFile.name.split('.').pop();
              const fileName = `${session.user.id}-${Date.now()}.${fileExt}`;
              const { error: uploadError } = await supabase.storage.from('logos').upload(fileName, logoFile, { upsert: true });
              if (uploadError) throw uploadError;
              const { data: publicUrlData } = supabase.storage.from('logos').getPublicUrl(fileName);
              logoUrl = publicUrlData.publicUrl;
          }
          const updates = {
              id: session.user.id,
              business_name: bizName,
              logo_url: logoUrl,
              updated_at: new Date().toISOString(),
          };
          const { error: profileError } = await supabase.from('profiles').upsert(updates);
          if (profileError) throw profileError;
          setProfile(updates);
          setIsSettingsOpen(false);
      } catch (error: any) {
          setErrorMessage(error.message || 'An unexpected error occurred.');
      } finally {
          setIsSavingProfile(false);
      }
  };

  async function addFromLibrary(libTactic: LibraryTactic, targetLaneId?: string, targetIndex?: number) {
    if (!session) return;
    setSyncStatus('saving');
    const laneIdToUse = targetLaneId || lanes[0].id;
    const newId = crypto.randomUUID();
    const newTactic: Tactic = { id: newId, title: libTactic.title, budget: libTactic.default_budget, content: libTactic.description };
    setLanes(prev => prev.map(lane => {
      if (lane.id !== laneIdToUse) return lane;
      const newItems = [...lane.items];
      if (typeof targetIndex === 'number' && targetIndex >= 0) {
        newItems.splice(targetIndex, 0, newTactic);
      } else {
        newItems.push(newTactic);
      }
      return { ...lane, items: newItems };
    }));
    await supabase.from('plan_items').insert({ 
        id: newId, 
        section_id: laneIdToUse, 
        custom_notes: libTactic.title, 
        allocated_budget: libTactic.default_budget, 
        content: libTactic.description,
        user_id: session.user.id 
    });
    setSyncStatus('synced');
  }

  async function handleSaveToLibrary() {
    if (!editingTactic || !tacticName) return;
    setIsSavingTemplate(true);
    const parentLane = lanes.find(l => l.items.some(i => i.id === editingTactic.id));
    const category = parentLane ? parentLane.title : 'General';
    const newLibraryItem = { title: tacticName, description: tacticContent, default_budget: Number(tacticBudget), category: category };
    const { data, error } = await supabase.from('tactics_library').insert(newLibraryItem).select().single();
    if (!error && data) {
      setLibrary(prev => [...prev, data]);
      setIsSavingTemplate(false);
    } else {
      setIsSavingTemplate(false);
      alert('Error saving template');
    }
  }

  async function updateTacticBudget(tacticId: string, newBudget: number) {
    setSyncStatus('saving');
    setLanes(prev => prev.map(lane => ({ ...lane, items: lane.items.map(item => item.id === tacticId ? { ...item, budget: newBudget } : item) })));
    const { error } = await supabase.from('plan_items').update({ allocated_budget: newBudget }).eq('id', tacticId);
    if (error) setSyncStatus('error');
    else setTimeout(() => setSyncStatus('synced'), 600);
  }

  async function handleAutoWrite() {
    if (!tacticName) return;
    setIsWriting(true);
    const text = await generateTacticContent(tacticName, tacticBudget);
    setTacticContent(text);
    setIsWriting(false);
  }

  function downloadPDF() {
    setIsDownloading(true);
    const doc = new jsPDF();
    doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.text(profile?.business_name ? `${profile.business_name} Growth Plan` : "Growth Strategy Plan", 20, 20);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(100); doc.text(`Q1 Strategy Report • ${new Date().toLocaleDateString()}`, 20, 26);
    doc.setLineWidth(0.5); doc.setDrawColor(200); doc.line(20, 32, 190, 32);
    let yPos = 45;
    lanes.forEach(lane => {
      doc.setFillColor(245, 247, 250); doc.rect(20, yPos - 8, 170, 14, 'F');
      doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(30); doc.text(lane.title.toUpperCase(), 25, yPos + 2);
      const laneTotal = lane.items.reduce((sum, i) => sum + i.budget, 0);
      doc.text(`$${laneTotal.toLocaleString()}`, 185, yPos + 2, { align: 'right' });
      yPos += 16;
      if (lane.items.length === 0) {
        doc.setFont("helvetica", "italic"); doc.setFontSize(10); doc.setTextColor(150); doc.text("No tactics added.", 25, yPos); yPos += 10;
      } else {
        lane.items.forEach(item => {
          doc.setFont("helvetica", "bold"); doc.setTextColor(50); doc.setFontSize(10); doc.text(`• ${item.title}`, 25, yPos);
          doc.setFont("helvetica", "normal"); doc.setTextColor(100); doc.text(`$${item.budget.toLocaleString()}`, 185, yPos, { align: 'right' });
          yPos += 8;
        });
      }
      yPos += 8;
    });
    doc.setDrawColor(0); doc.setLineWidth(1); doc.line(20, yPos, 190, yPos);
    yPos += 12;
    doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(0);
    doc.text("TOTAL BUDGET:", 20, yPos); doc.text(`$${totalBudget.toLocaleString()}`, 190, yPos, { align: 'right' });
    doc.save('Growth_Plan_Final.pdf');
    setIsDownloading(false);
  }

  async function handleAIGenerate(e: React.FormEvent) {
    if (!session) return;
    e.preventDefault(); if (!businessDesc.trim()) return;
    setIsGenerating(true);
    const suggestions = await generateMarketingPlan(businessDesc);
    if (suggestions && suggestions.length > 0) {
      const targetLane = lanes[0];
      const newItems = suggestions.map((s: any) => ({ id: crypto.randomUUID(), title: s.title, budget: s.budget, content: '' }));
      setLanes(prev => prev.map(lane => { if (lane.id === targetLane.id) return { ...lane, items: [...lane.items, ...newItems] }; return lane; }));
      for (const item of newItems) { 
          await supabase.from('plan_items').insert({ 
              id: item.id, section_id: targetLane.id, custom_notes: item.title, allocated_budget: item.budget, user_id: session.user.id
          }); 
      }
    }
    setIsGenerating(false); setIsAIModalOpen(false); setBusinessDesc('');
  }

  function openAddModal(laneId: string) { setTargetLaneId(laneId); setTacticName(''); setTacticBudget(0); setTacticContent(''); setIsAddModalOpen(true); }
  function openEditModal(tactic: Tactic) { setEditingTactic(tactic); setTacticName(tactic.title); setTacticBudget(tactic.budget); setTacticContent(tactic.content || ''); setIsEditModalOpen(true); }
  
  async function submitAddTactic(e: React.FormEvent) { 
      if (!session) return;
      e.preventDefault(); 
      if (!targetLaneId || !tacticName.trim()) return; 
      setSyncStatus('saving'); 
      const newId = crypto.randomUUID(); 
      const newTactic: Tactic = { id: newId, title: tacticName, budget: tacticBudget, content: '' }; 
      setLanes(prev => prev.map(lane => { if (lane.id === targetLaneId) return { ...lane, items: [...lane.items, newTactic] }; return lane; })); 
      await supabase.from('plan_items').insert({ id: newId, section_id: targetLaneId, custom_notes: tacticName, allocated_budget: tacticBudget, user_id: session.user.id }); 
      setSyncStatus('synced'); 
      setIsAddModalOpen(false); 
  }
  
  async function submitEditTactic(e: React.FormEvent) { e.preventDefault(); if (!editingTactic || !tacticName.trim()) return; setSyncStatus('saving'); setLanes(prev => prev.map(lane => ({ ...lane, items: lane.items.map(item => item.id === editingTactic.id ? { ...item, title: tacticName, budget: Number(tacticBudget), content: tacticContent } : item) }))); await supabase.from('plan_items').update({ custom_notes: tacticName, allocated_budget: Number(tacticBudget), content: tacticContent }).eq('id', editingTactic.id); setSyncStatus('synced'); setIsEditModalOpen(false); }
  function openDeleteModal(tacticId: string) { setTacticToDelete(tacticId); setIsDeleteModalOpen(true); }
  async function confirmDelete() { if (!tacticToDelete) return; setSyncStatus('saving'); setLanes(prev => prev.map(lane => ({ ...lane, items: lane.items.filter(item => item.id !== tacticToDelete) }))); await supabase.from('plan_items').delete().eq('id', tacticToDelete); setSyncStatus('synced'); setIsDeleteModalOpen(false); setTacticToDelete(null); }
  async function saveMove(tacticId: string, newSectionId: string) { setSyncStatus('saving'); await supabase.from('plan_items').update({ section_id: newSectionId }).eq('id', tacticId); setSyncStatus('synced'); }
  
  function handleDragStart(event: DragStartEvent) { 
      const { active } = event;
      if (active.data.current?.type === 'library') { setActiveLibraryItem(active.data.current.item); return; }
      setActiveId(active.id as string);
      const tactic = lanes.flatMap(l => l.items).find(i => i.id === active.id);
      if (tactic) setActiveTactic(tactic);
  }

  function handleDragEnd(event: DragEndEvent) { 
      const { active, over } = event; 
      setActiveId(null); setActiveTactic(null); setActiveLibraryItem(null); 
      if (!over) return; 

      if (active.data.current?.type === 'library') { 
          const libItem = active.data.current.item as LibraryTactic; 
          const overId = over.id as string; 
          let targetLane = lanes.find(l => l.id === overId); 
          let insertIndex = undefined; 
          if (!targetLane) { 
              const foundLane = lanes.find(l => l.items.find(i => i.id === overId)); 
              if (foundLane) { 
                  targetLane = foundLane; 
                  const overItemIndex = foundLane.items.findIndex(i => i.id === overId); 
                  if (overItemIndex !== -1) insertIndex = overItemIndex + 1; 
              } 
          } 
          if (targetLane) addFromLibrary(libItem, targetLane.id, insertIndex); 
          return; 
      } 

      const activeId = active.id as string; 
      const overId = over.id as string; 
      const sourceLane = lanes.find(lane => lane.items.some(item => item.id === activeId)); 
      const destLane = lanes.find(lane => lane.id === overId || lane.items.some(item => item.id === overId)); 
      if (!sourceLane || !destLane) return; 
      if (sourceLane !== destLane) { 
          const activeItem = sourceLane.items.find(i => i.id === activeId); 
          if(activeItem) { 
              setLanes(prev => prev.map(lane => { 
                  if (lane.id === sourceLane.id) return { ...lane, items: lane.items.filter(i => i.id !== activeId) }; 
                  if (lane.id === destLane.id) { 
                      const overItemIndex = lane.items.findIndex(i => i.id === overId); 
                      const newItems = [...lane.items]; 
                      if (overItemIndex !== -1) newItems.splice(overItemIndex, 0, activeItem); 
                      else newItems.push(activeItem); 
                      return { ...lane, items: newItems }; 
                  } 
                  return lane; 
              })); 
              saveMove(activeId, destLane.id); 
          } 
      } else { 
          const oldIndex = sourceLane.items.findIndex(item => item.id === activeId); 
          const newIndex = sourceLane.items.findIndex(item => item.id === overId); 
          if (oldIndex !== newIndex) { 
              setLanes(prev => prev.map(lane => { 
                  if (lane.id === sourceLane.id) return { ...lane, items: arrayMove(lane.items, oldIndex, newIndex) }; 
                  return lane; 
              })); 
          } 
      } 
  }

  const dropAnimation: DropAnimation = { sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) };

  // --- RENDER ---
  if (loadingSession) {
      return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white">
            <Loader2 className="animate-spin" size={32} />
        </div>
      );
  }

  if (!session) {
      return <LoginScreen />;
  }

  const userAvatar = session.user.user_metadata?.avatar_url;
  const userName = session.user.user_metadata?.full_name || 'My Account';
  const displayLogo = profile?.logo_url || null;

  return (
    <DndContext id="goaline-board" sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
    <div className="flex h-screen w-screen overflow-hidden bg-slate-200 font-sans relative">
      
      {/* SIDEBAR */}
      <aside className={`h-full bg-white border-r border-slate-200 transition-all duration-300 shadow-xl z-30 flex flex-col ${isSidebarOpen ? 'w-full md:w-80' : 'w-0 overflow-hidden'}`}>
        <div className="flex-1 flex flex-col min-w-[320px] h-full">
           
           {/* Sidebar Header */}
           <div className="flex-shrink-0 p-6 bg-slate-900 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <BookOpen size={18} className="text-indigo-400" />
                    <h3 className="text-xs font-black text-white uppercase tracking-widest">Tactic Library</h3>
                </div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white cursor-pointer p-2"><X size={24} className="md:hidden" /><ChevronLeft size={20} className="hidden md:block" /></button>
              </div>
              
              {/* ADMIN ONLY: ADD NEW TACTIC */}
              {isAdmin && (
                  <button 
                    onClick={() => setIsAdminModalOpen(true)}
                    className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"
                  >
                      <Plus size={14} strokeWidth={3} />
                      New Template
                  </button>
              )}
           </div>

           {/* Search & Filters */}
           <div className="flex-shrink-0 p-4 border-b border-slate-100 bg-white space-y-3">
              <div className="relative">
                 <Search className="absolute left-3 top-2.5 text-slate-400" size={14} />
                 <input 
                   type="text" 
                   placeholder="Search library..." 
                   className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
                   value={librarySearch}
                   onChange={(e) => setLibrarySearch(e.target.value)}
                 />
              </div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                 {categories.map(cat => (
                   <button 
                     key={cat}
                     onClick={() => setSelectedCategory(cat)}
                     className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${
                        selectedCategory === cat 
                        ? 'bg-indigo-600 text-white border-indigo-600' 
                        : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'
                     }`}
                   >
                     {cat}
                   </button>
                 ))}
              </div>
           </div>

           {/* Scrollable List */}
           <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {filteredLibrary.length === 0 ? (
                <div className="text-center py-8 opacity-50">
                    <BookOpen size={24} className="mx-auto mb-2 text-slate-300" />
                    <p className="text-xs font-bold text-slate-400">No results found.</p>
                </div>
              ) : (
                filteredLibrary.map((lib) => (
                    <DraggableLibraryItem key={lib.id} lib={lib} onAdd={addFromLibrary} />
                ))
              )}
           </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER SECTION - UPDATED FOR MOBILE STACKING */}
        <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex flex-col md:flex-row justify-between items-center z-20 gap-3 md:gap-0">
            {/* Center: Branding (Mobile: Top, Desktop: Absolute Center) */}
            <div className="order-1 md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center gap-2 mb-1 md:mb-0">
                <div className="p-1.5 bg-indigo-600 rounded-lg shadow-sm">
                    <Target size={18} className="text-white" />
                </div>
                <h1 className="text-lg font-black text-slate-900 uppercase tracking-widest">GoaLine</h1>
            </div>

            {/* Left & Right Container (Mobile: Below, Row) */}
            <div className="order-2 w-full md:w-auto flex justify-between md:contents">
                {/* Left: Project Title */}
                <div className="flex items-center gap-2">
                    <Target size={16} className="text-slate-400" />
                    <h2 className="text-sm font-bold text-slate-700">Q1 Growth Strategy</h2>
                </div>

                {/* Right: Account & Logo Placeholder */}
                <div className="flex items-center gap-4">
                     {/* User Info / Dropdown */}
                     <div className="relative">
                         <button 
                           id="tour-profile-btn"
                           onClick={() => setShowProfileMenu(!showProfileMenu)}
                           className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer"
                         >
                            {userAvatar ? (
                                 <img src={userAvatar} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200" />
                            ) : (
                                <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                                    <UserCircle size={20} />
                                </div>
                            )}
                            <div className="text-left hidden sm:block">
                                <div className="text-[10px] font-bold text-slate-900 leading-none mb-0.5 flex items-center gap-1">
                                    {userName}
                                    {isAdmin && <ShieldCheck size={10} className="text-indigo-600" />}
                                </div>
                                <div className="text-[9px] font-medium text-slate-400 leading-none">Settings</div>
                            </div>
                         </button>

                         {/* Profile Dropdown */}
                         {showProfileMenu && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                <div className="px-4 py-2 border-b border-slate-50">
                                    <p className="text-xs font-bold text-slate-900 truncate">{session.user.email}</p>
                                    {isAdmin && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-1 inline-block">ADMIN ACCESS</span>}
                                </div>
                                <button onClick={() => { setIsSettingsOpen(true); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-2 cursor-pointer">
                                    <Settings size={14} /> Account Settings
                                </button>
                                <button onClick={() => { setIsTourActive(true); setTourStepIndex(0); setShowProfileMenu(false); }} className="hidden md:flex w-full text-left px-4 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors items-center gap-2 cursor-pointer">
                                    <HelpCircle size={14} /> Restart Tour
                                </button>
                                <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer">
                                    <LogOut size={14} /> Sign Out
                                </button>
                            </div>
                         )}
                     </div>
                     
                     {/* Divider */}
                     <div className="h-6 w-px bg-slate-200"></div>

                     {/* Business Logo Display */}
                     <div className="flex items-center gap-3">
                         {profile?.business_name && (
                             <div className="text-right hidden sm:block">
                                 <div className="text-[10px] font-bold text-slate-900 leading-none mb-0.5 uppercase tracking-wide">{profile.business_name}</div>
                                 <div className="text-[9px] font-medium text-slate-400 leading-none">Organization</div>
                             </div>
                         )}

                         {displayLogo ? (
                            <div className="h-8 w-auto min-w-[2rem] rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden bg-white px-2" title="Business Logo">
                                <img src={displayLogo} alt="Business Logo" className="h-full w-full object-contain" />
                            </div>
                         ) : (
                            <div className="w-8 h-8 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-300 bg-slate-50" title="No Logo Uploaded">
                                <Target size={14} />
                            </div>
                         )}
                     </div>
                </div>
            </div>
        </div>

        {/* SUB NAV / TOOLBAR */}
        <div className="bg-slate-900 px-6 py-3 flex justify-between items-center shadow-md z-10">
            {/* Library Toggle (Integrated) */}
            <button id="tour-library-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="flex items-center gap-2 text-white transition-colors text-xs font-bold uppercase tracking-widest cursor-pointer group hover:text-indigo-400">
                <BookOpen size={16} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" />
                <span>Open Library</span>
            </button>

            {/* Stats & Actions */}
            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-6 border-r border-slate-700 pr-6 mr-2">
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold text-white/90 uppercase tracking-widest">Budget</span>
                        <span className="text-sm font-black text-white font-mono">${totalBudget.toLocaleString()}</span>
                    </div>
                    <div className="flex flex-col items-end">
                        <span className="text-[9px] font-bold text-white/90 uppercase tracking-widest">Tactics</span>
                        <span className="text-sm font-black text-white font-mono">{totalTactics}</span>
                    </div>
                </div>

                <button onClick={downloadPDF} disabled={isDownloading} className="text-slate-400 hover:text-white transition-colors cursor-pointer" title="Download PDF">
                    {isDownloading ? <Loader2 className="animate-spin" size={18}/> : <Download size={18} />}
                </button>
                
                <button onClick={() => setIsAIModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/50 cursor-pointer">
                    <Sparkles size={14} />
                    <span>AI Strategist</span>
                </button>
            </div>
        </div>

        {/* BOARD */}
        <div className="flex-1 flex flex-col md:flex-row gap-8 overflow-y-auto md:overflow-x-auto px-4 md:px-8 py-8 items-start w-full bg-slate-200 custom-scrollbar" onClick={() => setShowProfileMenu(false)}>
            {lanes.map((lane) => (
                <PlanLane key={lane.id} lane={lane} tools={tools} agencies={agencies} onAdd={openAddModal} onDelete={openDeleteModal} onEdit={openEditModal} onUpdateBudget={updateTacticBudget} onOpenTool={setSelectedTool} onOpenAgency={setSelectedAgency} onOpenLaneInfo={setLaneInfoTitle} />
            ))}
        </div>
        
        {/* DRAG OVERLAY */}
        <DragOverlay dropAnimation={dropAnimation}>
            {activeTactic ? <TacticCard tactic={activeTactic} isOverlay /> : null}
            {activeLibraryItem ? (
                 <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xl rotate-2 w-72">
                    <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-1.5 py-0.5 bg-indigo-50 rounded text-indigo-700">{activeLibraryItem.category}</span>
                    </div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">{activeLibraryItem.title}</h4>
                    <div className="text-[10px] font-bold text-slate-600 font-mono mt-2 bg-slate-100 px-2 py-1 rounded inline-block">${activeLibraryItem.default_budget.toLocaleString()}</div>
                 </div>
            ) : null}
        </DragOverlay>
      </div>

      {/* --- MODALS --- */}
      
      {/* WELCOME WIZARD MODAL */}
      {showWelcomeWizard && (
        <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-in fade-in duration-300">
           <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden border border-slate-100 relative">
              {/* Decorative Header */}
              <div className="h-32 bg-slate-900 relative overflow-hidden flex flex-col justify-center items-center text-center">
                 <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-900 via-slate-900 to-black opacity-80"></div>
                 <div className="relative z-10 p-6">
                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-3 backdrop-blur-sm border border-white/20 shadow-lg">
                       <Rocket size={24} className="text-indigo-400" />
                    </div>
                    <h2 className="text-xl font-black text-white uppercase tracking-widest">Let's Build Your Plan</h2>
                 </div>
              </div>

              {/* Content */}
              <div className="p-8">
                 <p className="text-slate-600 text-sm font-medium mb-6 text-center leading-relaxed">
                    Your board is empty. Tell me about your business, and I will generate a <strong>custom growth strategy</strong> for you instantly.
                 </p>

                 <form onSubmit={handleWizardSubmit}>
                    <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">What does your business do?</label>
                    <textarea 
                        autoFocus 
                        required 
                        className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-indigo-600 focus:border-transparent transition-all outline-none resize-none mb-6 placeholder:text-slate-300" 
                        placeholder="e.g. I run a dental office in Utah looking to get more patients for teeth whitening."
                        value={wizardInput} 
                        onChange={(e) => setWizardInput(e.target.value)} 
                    />
                    
                    <div className="flex gap-3">
                        <button 
                            type="button" 
                            onClick={() => setShowWelcomeWizard(false)} 
                            className="flex-1 py-4 bg-white border border-slate-200 text-slate-500 rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors cursor-pointer"
                        >
                            Skip for now
                        </button>
                        <button 
                            type="submit" 
                            disabled={isWizardGenerating} 
                            className="flex-[2] py-4 bg-indigo-600 text-white rounded-xl shadow-xl shadow-indigo-200 hover:bg-indigo-500 font-bold text-xs uppercase tracking-widest transition-all flex justify-center items-center gap-2 cursor-pointer group"
                        >
                            {isWizardGenerating ? (
                                <><Loader2 className="animate-spin" size={16}/> Generating...</>
                            ) : (
                                <>
                                    <Sparkles size={16} className="text-indigo-200 group-hover:text-white transition-colors" /> 
                                    Generate Plan
                                </>
                            )}
                        </button>
                    </div>
                 </form>
              </div>
           </div>
        </div>
      )}

      {/* TOUR GUIDE OVERLAY */}
      <TourGuide 
        active={isTourActive} 
        onClose={() => setIsTourActive(false)} 
        onNext={() => {
            if (tourStepIndex < 4) setTourStepIndex(tourStepIndex + 1);
            else setIsTourActive(false);
        }}
        stepIndex={tourStepIndex}
        totalSteps={5}
      />

      {/* ADMIN MODAL: CREATE LIBRARY ITEM */}
      {isAdminModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-indigo-200 animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <ShieldCheck size={18} className="text-indigo-600" />
                    <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Admin: Add Template</h3>
                </div>
                <button onClick={() => setIsAdminModalOpen(false)} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={20} /></button>
             </div>
             <form onSubmit={handleCreateLibraryTactic} className="p-6 space-y-4">
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Tactic Name</label>
                   <input required type="text" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" value={adminTacticName} onChange={(e) => setAdminTacticName(e.target.value)} />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Default Budget</label>
                        <input type="number" className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" value={adminTacticBudget} onChange={(e) => setAdminTacticBudget(Number(e.target.value))} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Category</label>
                        <select className="w-full bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none" value={adminTacticCategory} onChange={(e) => setAdminTacticCategory(e.target.value)}>
                            <option value="Awareness">Awareness</option>
                            <option value="Consideration">Consideration</option>
                            <option value="Conversion">Conversion</option>
                            <option value="Retention">Retention</option>
                        </select>
                    </div>
                </div>
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Description</label>
                   <textarea className="w-full h-24 bg-white border border-slate-200 rounded-lg px-4 py-2 text-sm font-medium text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none resize-none" value={adminTacticDesc} onChange={(e) => setAdminTacticDesc(e.target.value)} />
                </div>
                <button type="submit" className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-colors cursor-pointer">Add to Library</button>
             </form>
          </div>
        </div>
      )}

      {/* ACCOUNT SETTINGS MODAL */}
      {isSettingsOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Account Settings</h3>
                <button onClick={() => { setIsSettingsOpen(false); setErrorMessage(null); }} className="text-slate-400 hover:text-slate-600 cursor-pointer"><X size={20} /></button>
             </div>
             
             {errorMessage && (
                <div className="px-6 pt-6">
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start gap-3">
                        <AlertTriangle className="text-red-500 shrink-0 mt-0.5" size={16} />
                        <div>
                            <h4 className="text-xs font-bold text-red-700 uppercase tracking-wide mb-1">Update Failed</h4>
                            <p className="text-xs text-red-600 font-medium leading-snug">{errorMessage}</p>
                        </div>
                    </div>
                </div>
             )}

             <form onSubmit={handleSaveProfile} className="p-6 space-y-6">
                
                {/* Business Name Input */}
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Business Name</label>
                   <div className="relative">
                      <Briefcase size={16} className="absolute left-3 top-3 text-slate-400" />
                      <input 
                        type="text" 
                        placeholder="e.g. Acme Corp" 
                        className="w-full bg-white border border-slate-200 rounded-lg pl-10 pr-4 py-2.5 text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                        value={bizName}
                        onChange={(e) => setBizName(e.target.value)}
                      />
                   </div>
                </div>

                {/* Logo Upload */}
                <div>
                   <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Business Logo</label>
                   <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 flex flex-col items-center justify-center text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                      <input 
                        type="file" 
                        accept="image/*"
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={(e) => setLogoFile(e.target.files?.[0] || null)}
                      />
                      {logoFile ? (
                          <div className="flex items-center gap-2 text-indigo-600 font-bold text-xs">
                             <CheckCircle2 size={16} />
                             <span>{logoFile.name}</span>
                          </div>
                      ) : (
                          <>
                             <div className="w-10 h-10 bg-indigo-50 rounded-full flex items-center justify-center mb-2">
                                <ImageIcon size={20} className="text-indigo-500" />
                             </div>
                             <p className="text-xs font-bold text-slate-600">Click to upload logo</p>
                             <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, or SVG (Max 2MB)</p>
                          </>
                      )}
                   </div>
                </div>

                <button 
                  type="submit" 
                  disabled={isSavingProfile}
                  className="w-full py-3 bg-indigo-600 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-indigo-500 transition-colors flex items-center justify-center gap-2 cursor-pointer"
                >
                   {isSavingProfile ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />}
                   <span>Save Changes</span>
                </button>
             </form>
          </div>
        </div>
      )}

      {/* LANE INFO MODAL */}
      {laneInfoTitle && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6 text-center">
                 <div className="w-12 h-12 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-4 text-indigo-600">
                    <Info size={24} />
                 </div>
                 <h3 className="text-lg font-black text-slate-900 mb-2 uppercase tracking-wide">{laneInfoTitle}</h3>
                 <p className="text-sm text-slate-500 leading-relaxed mb-6">{getLaneDescription(laneInfoTitle)}</p>
                 <button onClick={() => setLaneInfoTitle(null)} className="w-full py-3 bg-slate-900 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-black transition-colors cursor-pointer">Got it</button>
              </div>
           </div>
        </div>
      )}

      {/* TOOL DETAIL MODAL */}
      {selectedTool && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6">
                 {/* Header */}
                 <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                          {getToolIcon(selectedTool.name, 24)}
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-slate-900">{selectedTool.name}</h3>
                          <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">Self-Service Tool</span>
                       </div>
                    </div>
                    <button onClick={() => setSelectedTool(null)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"><X size={20} /></button>
                 </div>

                 {/* Body */}
                 <div className="space-y-4 mb-6">
                    <div>
                       <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedTool.description}</p>
                    </div>

                    {selectedTool.value_prop && (
                      <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                         <div className="flex items-center gap-2 mb-1">
                            <Target size={12} className="text-indigo-600" />
                            <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Why Use It</span>
                         </div>
                         <p className="text-xs text-indigo-900 leading-relaxed">{selectedTool.value_prop}</p>
                      </div>
                    )}

                    {selectedTool.pricing && (
                      <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                         <div className="bg-white p-1.5 rounded-full shadow-sm">
                            <DollarSign size={14} className="text-emerald-600" />
                         </div>
                         <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing</span>
                            <p className="text-xs font-bold text-slate-700">{selectedTool.pricing}</p>
                         </div>
                      </div>
                    )}
                 </div>

                 {/* Action */}
                 <a 
                   href={selectedTool.affiliate_link} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
                 >
                    <span>Visit {selectedTool.name}</span>
                    <ArrowRight size={14} />
                 </a>
              </div>
           </div>
        </div>
      )}

      {/* AGENCY DETAIL MODAL */}
      {selectedAgency && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
           <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-purple-100 animate-in fade-in zoom-in-95 duration-200">
              <div className="p-6">
                 {/* Header */}
                 <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                       <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                          <BadgeCheck size={24} className="text-purple-600" />
                       </div>
                       <div>
                          <h3 className="text-lg font-black text-slate-900">{selectedAgency.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                             <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">Verified Partner</span>
                             <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><MapPin size={10} /> {selectedAgency.location}</span>
                          </div>
                       </div>
                    </div>
                    <button onClick={() => setSelectedAgency(null)} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"><X size={20} /></button>
                 </div>

                 {/* Body */}
                 <div className="space-y-4 mb-6">
                    <div>
                       <p className="text-sm text-slate-600 leading-relaxed font-medium">{selectedAgency.description}</p>
                    </div>

                    <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                         <div className="bg-white p-1.5 rounded-full shadow-sm">
                            <Users size={14} className="text-purple-600" />
                         </div>
                         <div>
                            <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing Model</span>
                            <p className="text-xs font-bold text-slate-700">{selectedAgency.pricing_model}</p>
                         </div>
                    </div>
                 </div>

                 {/* Action */}
                 <a 
                   href={selectedAgency.website_link} 
                   target="_blank" 
                   rel="noopener noreferrer"
                   className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-200 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer"
                 >
                    <span>Contact Partner</span>
                    <ArrowRight size={14} />
                 </a>
              </div>
           </div>
        </div>
      )}

      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 bg-slate-900 flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">{isEditModalOpen ? 'Edit Tactic' : 'New Growth Tactic'}</h3>
              <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="text-slate-400 hover:text-white cursor-pointer p-2"><X size={24} /></button>
            </div>
            <div className="p-4 sm:p-8 max-h-[80vh] overflow-y-auto">
                <form onSubmit={isEditModalOpen ? submitEditTactic : submitAddTactic} className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Title</label>
                        <input autoFocus type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all" value={tacticName} onChange={(e) => setTacticName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Budget</label>
                        <input 
                          type="number" 
                          min="0" 
                          className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent outline-none transition-all" 
                          value={tacticBudget} 
                          onFocus={(e) => e.target.select()}
                          onChange={(e) => setTacticBudget(Number(e.target.value))} 
                        />
                    </div>
                </div>
                {isEditModalOpen && (
                    <div className="pt-6 border-t border-slate-100">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Content</label>
                            <button type="button" onClick={handleAutoWrite} disabled={isWriting} className="w-full sm:w-auto text-[10px] bg-slate-100 text-slate-700 px-4 py-2 rounded-full font-bold uppercase tracking-wide hover:bg-slate-200 flex items-center justify-center gap-2 transition-all cursor-pointer">
                                {isWriting ? <Loader2 className="animate-spin" size={12}/> : <Sparkles size={12} />}
                                {isWriting ? 'WRITING...' : 'AUTO-WRITE'}
                            </button>
                        </div>
                        <textarea className="w-full h-40 sm:h-48 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm leading-relaxed text-slate-700 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none resize-none font-medium" value={tacticContent} onChange={(e) => setTacticContent(e.target.value)} />
                    </div>
                )}
                </form>
            </div>
            <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex gap-3 justify-end">
                {isEditModalOpen && (
                  <button 
                    type="button" 
                    onClick={handleSaveToLibrary} 
                    disabled={isSavingTemplate}
                    className="flex items-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-700 hover:border-indigo-500 hover:text-indigo-600 rounded-xl font-bold text-xs uppercase tracking-widest transition-all cursor-pointer shadow-sm"
                  >
                     {isSavingTemplate ? <Loader2 className="animate-spin" size={16} /> : <Bookmark size={16} />}
                     <span>{isSavingTemplate ? 'Saving...' : 'Save Template'}</span>
                  </button>
                )}
                <button onClick={isEditModalOpen ? submitEditTactic : submitAddTactic} className="flex-1 sm:flex-none px-8 py-3 bg-slate-900 text-white hover:bg-black rounded-xl shadow-lg font-bold text-xs uppercase tracking-widest transition-all cursor-pointer">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-sm overflow-hidden border border-red-100 animate-in fade-in zoom-in-95 duration-200">
             <div className="p-6 text-center">
                <div className="w-12 h-12 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                   <AlertTriangle className="text-red-500" size={24} />
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">Delete Tactic?</h3>
                <p className="text-sm text-slate-500 mb-6">This action cannot be undone. The tactic will be removed from your board permanently.</p>
                
                <div className="flex gap-3">
                   <button onClick={() => setIsDeleteModalOpen(false)} className="flex-1 py-3 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-colors cursor-pointer">Cancel</button>
                   <button onClick={confirmDelete} className="flex-1 py-3 bg-red-600 text-white rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-200 transition-colors cursor-pointer">Delete</button>
                </div>
             </div>
          </div>
        </div>
      )}

      {isAIModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="px-6 py-5 bg-slate-900 flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-indigo-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">AI Strategist</h3>
              </div>
              <button onClick={() => setIsAIModalOpen(false)} className="text-slate-400 hover:text-white cursor-pointer p-2"><X size={24} /></button>
            </div>
            <div className="p-6 sm:p-8">
                <p className="text-slate-500 text-sm font-medium mb-6">Describe your business. I will build your Q1 roadmap.</p>
                <form onSubmit={handleAIGenerate}>
                    <textarea autoFocus required className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none resize-none mb-6" value={businessDesc} onChange={(e) => setBusinessDesc(e.target.value)} />
                    <button type="submit" disabled={isGenerating} className="w-full py-4 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-500 font-bold text-xs uppercase tracking-widest transition-all flex justify-center items-center gap-2 cursor-pointer">
                        {isGenerating ? <><Loader2 className="animate-spin" size={14}/> THINKING...</> : 'GENERATE STRATEGY'}
                    </button>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
    </DndContext>
  );
}