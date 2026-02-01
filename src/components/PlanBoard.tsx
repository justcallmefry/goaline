'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { 
  DndContext, DragEndEvent, DragStartEvent, DragOverlay, useSensor, useSensors, PointerSensor, TouchSensor, defaultDropAnimationSideEffects, DropAnimation
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';
import { 
  Plus, X, Sparkles, Loader2, Download, BookOpen, ChevronLeft, Target, Search, UserCircle, Settings, LogOut, ShieldCheck, HelpCircle
} from 'lucide-react'; 
import { createClient } from '@supabase/supabase-js';
import { generateMarketingPlan, generateTacticContent } from '@/app/actions';
import jsPDF from 'jspdf';

// --- TYPES & COMPONENTS ---
import { Tactic, Lane, LibraryTactic, Tool, Agency } from '@/types';
import { PlanLane } from '@/components/dashboard/PlanLane';
import { TacticCard } from '@/components/dashboard/TacticCard';
import { DraggableLibraryItem } from '@/components/dashboard/DraggableLibraryItem';
import { TourGuide } from '@/components/modals/TourGuide';
import { LoginScreen } from '@/components/LoginScreen';
import { SettingsModal } from '@/components/modals/SettingsModal';

// --- MODALS (ALL EXTRACTED) ---
import { TacticAddModal, TacticEditModal, DeleteModal } from '@/components/modals/TacticModals';
import { WelcomeWizard } from '@/components/modals/WelcomeWizard';
import { LaneInfoModal } from '@/components/modals/LaneInfoModal';
import { ToolModal, AgencyModal } from '@/components/modals/PartnerModals';
import { AIStrategistModal } from '@/components/modals/AIStrategistModal';
import { AdminLibraryModal } from '@/components/modals/AdminLibraryModal';

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!);

function getLaneDescription(title: string) {
  const t = title.toLowerCase();
  if (t.includes('awareness')) return "The 'See Me' Phase. Tactics here focus on reaching cold audiences who don't know you yet. Goal: Impressions & Traffic.";
  if (t.includes('consideration') || t.includes('conversion')) return "The 'Buy Me' Phase. Tactics here target people who know you but haven't bought yet. Goal: Leads & Sales.";
  if (t.includes('retention') || t.includes('decision')) return "The 'Love Me' Phase. Tactics here focus on existing customers to drive repeat purchases and referrals. Goal: LTV & Low Churn.";
  return "General planning stage for miscellaneous tasks.";
}

export default function PlanBoard({ initialLanes }: { initialLanes: any[] }) {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [loadingSession, setLoadingSession] = useState(true);
  
  // App State
  const [profile, setProfile] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [lanes, setLanes] = useState<Lane[]>(initialLanes);
  const [library, setLibrary] = useState<LibraryTactic[]>([]);
  const [tools, setTools] = useState<Tool[]>([]); 
  const [agencies, setAgencies] = useState<Agency[]>([]); 
  const [syncStatus, setSyncStatus] = useState<'synced' | 'saving' | 'error'>('synced');

  // UI State
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isDownloading, setIsDownloading] = useState(false);
  
  // Drag State
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTactic, setActiveTactic] = useState<Tactic | null>(null);
  const [activeLibraryItem, setActiveLibraryItem] = useState<LibraryTactic | null>(null);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }), useSensor(TouchSensor));

  // Modal Visibility State
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [showWelcomeWizard, setShowWelcomeWizard] = useState(false);
  const [isTourActive, setIsTourActive] = useState(false);
  const [tourStepIndex, setTourStepIndex] = useState(0);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Modal Data State
  const [selectedTool, setSelectedTool] = useState<Tool | null>(null);
  const [selectedAgency, setSelectedAgency] = useState<Agency | null>(null); 
  const [laneInfoTitle, setLaneInfoTitle] = useState<string | null>(null);
  
  // Form State
  const [targetLaneId, setTargetLaneId] = useState<string | null>(null);
  const [editingTactic, setEditingTactic] = useState<Tactic | null>(null);
  const [tacticToDelete, setTacticToDelete] = useState<string | null>(null); 
  const [tacticName, setTacticName] = useState('');
  const [tacticBudget, setTacticBudget] = useState(0);
  const [tacticContent, setTacticContent] = useState(''); 
  
  // AI & Automation State
  const [wizardInput, setWizardInput] = useState('');
  const [isWizardGenerating, setIsWizardGenerating] = useState(false);
  const [businessDesc, setBusinessDesc] = useState('');
  const [isAIGenerating, setIsAIGenerating] = useState(false); 
  const [isWriting, setIsWriting] = useState(false);

  // Submission State (NEW)
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState<string | null>(null); // NEW

  // Admin Form State
  const [adminTacticName, setAdminTacticName] = useState('');
  const [adminTacticDesc, setAdminTacticDesc] = useState('');
  const [adminTacticBudget, setAdminTacticBudget] = useState(0);
  const [adminTacticCategory, setAdminTacticCategory] = useState('Awareness');

  // Stats
  const totalBudget = lanes.reduce((sum, lane) => sum + lane.items.reduce((s, i) => s + i.budget, 0), 0);
  const totalTactics = lanes.reduce((sum, lane) => sum + lane.items.length, 0);

  useEffect(() => { setMounted(true); }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setSession(session); setLoadingSession(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setSession(session); setLoadingSession(false); });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) return; 
    async function fetchData() {
      // Only fetch APPROVED items for the public library view
      const { data: libData } = await supabase.from('tactics_library').select('*').eq('status', 'approved');
      if (libData) setLibrary(libData);
      
      const { data: toolData } = await supabase.from('tools').select('*').eq('status', 'approved');
      if (toolData) setTools(toolData);
      
      const { data: agencyData } = await supabase.from('agencies').select('*').eq('status', 'approved');
      if (agencyData) setAgencies(agencyData);
      
      const { data: userItems } = await supabase.from('plan_items').select('*');
      if (!userItems || userItems.length === 0) {
          setShowWelcomeWizard(true);
      } else {
          setLanes(initialLanes.map(lane => ({
              ...lane,
              items: userItems.filter((i: any) => i.section_id === lane.id).map((i: any) => ({
                  id: i.id, title: i.custom_notes || 'Untitled', budget: i.allocated_budget || 0, content: i.content
              }))
          })));
      }
      const { data: profileData } = await supabase.from('profiles').select('*').eq('id', session.user.id).single();
      if (profileData) { setProfile(profileData); setIsAdmin(!!profileData.is_admin); }
    }
    fetchData();
  }, [session, initialLanes]);

  const filteredLibrary = useMemo(() => {
    return library.filter(item => {
      const matchesSearch = item.title.toLowerCase().includes(librarySearch.toLowerCase()) || item.description.toLowerCase().includes(librarySearch.toLowerCase());
      return matchesSearch && (selectedCategory === 'All' || item.category === selectedCategory);
    });
  }, [library, librarySearch, selectedCategory]);

  const handleSignOut = async () => { await supabase.auth.signOut(); setSession(null); };

  const handleWizardSubmit = async (e: React.FormEvent) => {
      e.preventDefault(); if (!wizardInput.trim()) return; setIsWizardGenerating(true);
      const suggestions = await generateMarketingPlan(wizardInput);
      if (suggestions?.length > 0) {
          const laneIds = lanes.map(l => l.id);
          const distributionMap = [laneIds[0], laneIds[0], laneIds[1], laneIds[2], laneIds[3]];
          const newItems = suggestions.map((s: any, index: number) => ({
              id: crypto.randomUUID(), title: s.title, budget: s.budget, content: '', section_id: distributionMap[index % distributionMap.length] || laneIds[0]
          }));
          for (const item of newItems) { await supabase.from('plan_items').insert({ id: item.id, section_id: item.section_id, custom_notes: item.title, allocated_budget: item.budget, user_id: session.user.id }); }
          setLanes(prev => prev.map(lane => ({ ...lane, items: [...lane.items, ...newItems.filter((i: any) => i.section_id === lane.id)] })));
          if (wizardInput.length < 50) { await supabase.from('profiles').update({ business_name: wizardInput }).eq('id', session.user.id); setProfile((prev: any) => ({ ...prev, business_name: wizardInput })); }
          setShowWelcomeWizard(false);
          if (window.innerWidth > 768) setTimeout(() => { setIsTourActive(true); setTourStepIndex(0); }, 1000);
      }
      setIsWizardGenerating(false);
  };

  const handleCreateLibraryTactic = async (e: React.FormEvent) => {
      e.preventDefault(); if (!isAdmin) return;
      const { data } = await supabase.from('tactics_library').insert({ title: adminTacticName, description: adminTacticDesc, default_budget: adminTacticBudget, category: adminTacticCategory, status: 'approved' }).select().single();
      if (data) { setLibrary(prev => [...prev, data]); setIsAdminModalOpen(false); setAdminTacticName(''); setAdminTacticDesc(''); setAdminTacticBudget(0); }
  };

  async function addFromLibrary(libTactic: LibraryTactic, targetLaneId?: string, targetIndex?: number) {
    if (!session) return; setSyncStatus('saving');
    const laneIdToUse = targetLaneId || lanes[0].id;
    const newId = crypto.randomUUID();
    const newTactic: Tactic = { id: newId, title: libTactic.title, budget: libTactic.default_budget, content: libTactic.description };
    setLanes(prev => prev.map(lane => {
      if (lane.id !== laneIdToUse) return lane;
      const newItems = [...lane.items];
      if (typeof targetIndex === 'number' && targetIndex >= 0) newItems.splice(targetIndex, 0, newTactic);
      else newItems.push(newTactic);
      return { ...lane, items: newItems };
    }));
    await supabase.from('plan_items').insert({ id: newId, section_id: laneIdToUse, custom_notes: libTactic.title, allocated_budget: libTactic.default_budget, content: libTactic.description, user_id: session.user.id });
    setSyncStatus('synced');
  }

  async function updateTacticBudget(tacticId: string, newBudget: number) {
    setSyncStatus('saving');
    setLanes(prev => prev.map(lane => ({ ...lane, items: lane.items.map(item => item.id === tacticId ? { ...item, budget: newBudget } : item) })));
    const { error } = await supabase.from('plan_items').update({ allocated_budget: newBudget }).eq('id', tacticId);
    if (error) setSyncStatus('error'); else setTimeout(() => setSyncStatus('synced'), 600);
  }

  async function handleAutoWrite() {
    if (!tacticName) return; setIsWriting(true);
    const text = await generateTacticContent(tacticName, tacticBudget);
    setTacticContent(text); setIsWriting(false);
  }

  // --- NEW: SUBMIT TO LIBRARY (With HTML Alerts) ---
  async function handleSubmitToLibrary() {
      if (!editingTactic || !tacticName) return;
      setIsSubmitting(true);
      setSubmitError(null);
      setSubmitSuccess(null);
      
      const parentLane = lanes.find(l => l.items.some(i => i.id === editingTactic.id));
      const category = parentLane ? parentLane.title : 'General';
      
      const { error } = await supabase.from('tactics_library').insert({
          title: tacticName,
          description: tacticContent,
          default_budget: tacticBudget,
          category: category,
          status: 'pending', // Queue for Admin Approval
          submitted_by: session.user.id
      });
      
      setIsSubmitting(false);
      
      if (error) {
          setSubmitError(error.message || "Failed to submit. Please try again.");
      } else {
          setSubmitSuccess("Successfully submitted for review!");
          // Wait 2 seconds so user sees the success message, then close
          setTimeout(() => {
              setIsEditModalOpen(false);
              setSubmitSuccess(null);
          }, 2000);
      }
  }

  function downloadPDF() {
    setIsDownloading(true); const doc = new jsPDF();
    doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.text(profile?.business_name ? `${profile.business_name} Growth Plan` : "Growth Strategy Plan", 20, 20);
    doc.setFont("helvetica", "normal"); doc.setFontSize(10); doc.setTextColor(100); doc.text(`Q1 Strategy Report • ${new Date().toLocaleDateString()}`, 20, 26);
    doc.setLineWidth(0.5); doc.setDrawColor(200); doc.line(20, 32, 190, 32);
    let yPos = 45;
    lanes.forEach(lane => {
      doc.setFillColor(245, 247, 250); doc.rect(20, yPos - 8, 170, 14, 'F');
      doc.setFont("helvetica", "bold"); doc.setFontSize(12); doc.setTextColor(30); doc.text(lane.title.toUpperCase(), 25, yPos + 2);
      doc.text(`$${lane.items.reduce((sum, i) => sum + i.budget, 0).toLocaleString()}`, 185, yPos + 2, { align: 'right' });
      yPos += 16;
      if (lane.items.length === 0) { doc.setFont("helvetica", "italic"); doc.setFontSize(10); doc.setTextColor(150); doc.text("No tactics added.", 25, yPos); yPos += 10; } 
      else { lane.items.forEach(item => {
          doc.setFont("helvetica", "bold"); doc.setTextColor(50); doc.setFontSize(10); doc.text(`• ${item.title}`, 25, yPos);
          doc.setFont("helvetica", "normal"); doc.setTextColor(100); doc.text(`$${item.budget.toLocaleString()}`, 185, yPos, { align: 'right' });
          yPos += 8;
        }); }
      yPos += 8;
    });
    doc.setDrawColor(0); doc.setLineWidth(1); doc.line(20, yPos, 190, yPos); yPos += 12;
    doc.setFontSize(14); doc.setFont("helvetica", "bold"); doc.setTextColor(0); doc.text("TOTAL BUDGET:", 20, yPos); doc.text(`$${totalBudget.toLocaleString()}`, 190, yPos, { align: 'right' });
    doc.save('Growth_Plan_Final.pdf'); setIsDownloading(false);
  }

  async function handleAIGenerate(e: React.FormEvent) {
    if (!session) return; e.preventDefault(); if (!businessDesc.trim()) return; setIsAIGenerating(true);
    const suggestions = await generateMarketingPlan(businessDesc);
    if (suggestions?.length > 0) {
      const targetLane = lanes[0]; const newItems = suggestions.map((s: any) => ({ id: crypto.randomUUID(), title: s.title, budget: s.budget, content: '' }));
      setLanes(prev => prev.map(lane => { if (lane.id === targetLane.id) return { ...lane, items: [...lane.items, ...newItems] }; return lane; }));
      for (const item of newItems) { await supabase.from('plan_items').insert({ id: item.id, section_id: targetLane.id, custom_notes: item.title, allocated_budget: item.budget, user_id: session.user.id }); }
    }
    setIsAIGenerating(false); setIsAIModalOpen(false); setBusinessDesc('');
  }

  function openAddModal(laneId: string) { setTargetLaneId(laneId); setTacticName(''); setTacticBudget(0); setTacticContent(''); setIsAddModalOpen(true); }
  function openEditModal(tactic: Tactic) { 
      setEditingTactic(tactic); 
      setTacticName(tactic.title); 
      setTacticBudget(tactic.budget); 
      setTacticContent(tactic.content || ''); 
      setSubmitError(null); 
      setSubmitSuccess(null); // Reset success state
      setIsEditModalOpen(true); 
  }
  
  async function submitAddTactic(e: React.FormEvent) { 
      if (!session) return; e.preventDefault(); if (!targetLaneId || !tacticName.trim()) return; setSyncStatus('saving'); 
      const newId = crypto.randomUUID(); const newTactic: Tactic = { id: newId, title: tacticName, budget: tacticBudget, content: '' }; 
      setLanes(prev => prev.map(lane => { if (lane.id === targetLaneId) return { ...lane, items: [...lane.items, newTactic] }; return lane; })); 
      await supabase.from('plan_items').insert({ id: newId, section_id: targetLaneId, custom_notes: tacticName, allocated_budget: tacticBudget, user_id: session.user.id }); 
      setSyncStatus('synced'); setIsAddModalOpen(false); 
  }
  
  async function submitEditTactic(e: React.FormEvent) { 
    e.preventDefault(); if (!editingTactic || !tacticName.trim()) return; setSyncStatus('saving'); 
    setLanes(prev => prev.map(lane => ({ ...lane, items: lane.items.map(item => item.id === editingTactic.id ? { ...item, title: tacticName, budget: Number(tacticBudget), content: tacticContent } : item) }))); 
    await supabase.from('plan_items').update({ custom_notes: tacticName, allocated_budget: Number(tacticBudget), content: tacticContent }).eq('id', editingTactic.id); 
    setSyncStatus('synced'); setIsEditModalOpen(false); 
  }

  function openDeleteModal(tacticId: string) { setTacticToDelete(tacticId); setIsDeleteModalOpen(true); }
  async function confirmDelete() { if (!tacticToDelete) return; setSyncStatus('saving'); setLanes(prev => prev.map(lane => ({ ...lane, items: lane.items.filter(item => item.id !== tacticToDelete) }))); await supabase.from('plan_items').delete().eq('id', tacticToDelete); setSyncStatus('synced'); setIsDeleteModalOpen(false); setTacticToDelete(null); }
  
  function handleDragStart(event: DragStartEvent) { 
      const { active } = event; if (active.data.current?.type === 'library') { setActiveLibraryItem(active.data.current.item); return; }
      setActiveId(active.id as string); const tactic = lanes.flatMap(l => l.items).find(i => i.id === active.id); if (tactic) setActiveTactic(tactic);
  }

  function handleDragEnd(event: DragEndEvent) { 
      const { active, over } = event; setActiveId(null); setActiveTactic(null); setActiveLibraryItem(null); if (!over) return; 
      if (active.data.current?.type === 'library') { 
          const libItem = active.data.current.item as LibraryTactic; const overId = over.id as string; 
          let targetLane = lanes.find(l => l.id === overId); let insertIndex = undefined; 
          if (!targetLane) { const foundLane = lanes.find(l => l.items.find(i => i.id === overId)); if (foundLane) { targetLane = foundLane; const overItemIndex = foundLane.items.findIndex(i => i.id === overId); if (overItemIndex !== -1) insertIndex = overItemIndex + 1; } } 
          if (targetLane) addFromLibrary(libItem, targetLane.id, insertIndex); return; 
      } 
      const activeId = active.id as string; const overId = over.id as string; 
      const sourceLane = lanes.find(lane => lane.items.some(item => item.id === activeId)); 
      const destLane = lanes.find(lane => lane.id === overId || lane.items.some(item => item.id === overId)); 
      if (!sourceLane || !destLane) return; 
      if (sourceLane !== destLane) { 
          const activeItem = sourceLane.items.find(i => i.id === activeId); 
          if(activeItem) { 
              setLanes(prev => prev.map(lane => { 
                  if (lane.id === sourceLane.id) return { ...lane, items: lane.items.filter(i => i.id !== activeId) }; 
                  if (lane.id === destLane.id) { const overItemIndex = lane.items.findIndex(i => i.id === overId); const newItems = [...lane.items]; if (overItemIndex !== -1) newItems.splice(overItemIndex, 0, activeItem); else newItems.push(activeItem); return { ...lane, items: newItems }; } 
                  return lane; 
              })); 
              supabase.from('plan_items').update({ section_id: destLane.id }).eq('id', activeId); 
          } 
      } else { 
          const oldIndex = sourceLane.items.findIndex(item => item.id === activeId); const newIndex = sourceLane.items.findIndex(item => item.id === overId); 
          if (oldIndex !== newIndex) setLanes(prev => prev.map(lane => { if (lane.id === sourceLane.id) return { ...lane, items: arrayMove(lane.items, oldIndex, newIndex) }; return lane; })); 
      } 
  } 

  if (!mounted || loadingSession) return <div className="min-h-screen bg-slate-900 flex items-center justify-center text-white"><Loader2 className="animate-spin" /></div>;
  if (!session) return <LoginScreen />;

  const userAvatar = session.user.user_metadata?.avatar_url;
  const userName = session.user.user_metadata?.full_name || 'My Account';
  const displayLogo = profile?.logo_url || null;

  return (
    <DndContext id="goaline-board" sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
    <div className="flex h-screen w-screen overflow-hidden bg-slate-200 font-sans relative">
      
      {/* SIDEBAR */}
      <aside className={`h-full bg-white border-r border-slate-200 transition-all duration-300 shadow-xl z-30 flex flex-col ${isSidebarOpen ? 'w-full md:w-80' : 'w-0 overflow-hidden'}`}>
        <div className="flex-1 flex flex-col min-w-[320px] h-full">
            <div className="flex-shrink-0 p-6 bg-slate-900 flex flex-col gap-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3"><BookOpen size={18} className="text-indigo-400" /><h3 className="text-xs font-black text-white uppercase tracking-widest">Tactic Library</h3></div>
                <button onClick={() => setIsSidebarOpen(false)} className="text-slate-400 hover:text-white cursor-pointer p-2"><X size={24} className="md:hidden" /><ChevronLeft size={20} className="hidden md:block" /></button>
              </div>
              {isAdmin && <button onClick={() => setIsAdminModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white py-2 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all cursor-pointer"><Plus size={14} strokeWidth={3} /> New Template</button>}
            </div>
            <div className="flex-shrink-0 p-4 border-b border-slate-100 bg-white space-y-3">
              <div className="relative"><Search className="absolute left-3 top-2.5 text-slate-400" size={14} /><input type="text" placeholder="Search library..." className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-2 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 transition-all" value={librarySearch} onChange={(e) => setLibrarySearch(e.target.value)} /></div>
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">{['All', ...Array.from(new Set(library.map(l => l.category)))].map(cat => ( <button key={cat} onClick={() => setSelectedCategory(cat)} className={`px-3 py-1.5 rounded-md text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all cursor-pointer border ${selectedCategory === cat ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300'}`}>{cat}</button> ))}</div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-50">
              {filteredLibrary.length === 0 ? <div className="text-center py-8 opacity-50"><BookOpen size={24} className="mx-auto mb-2 text-slate-300" /><p className="text-xs font-bold text-slate-400">No results found.</p></div> : filteredLibrary.map((lib) => <DraggableLibraryItem key={lib.id} lib={lib} onAdd={addFromLibrary} />)}
            </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col overflow-hidden">
        {/* HEADER */}
        <div className="bg-white border-b border-slate-200 px-4 md:px-6 py-3 flex flex-col md:flex-row justify-between items-center z-20 gap-3 md:gap-0">
            <div className="order-1 md:absolute md:left-1/2 md:-translate-x-1/2 flex items-center gap-2 mb-1 md:mb-0"><div className="p-1.5 bg-indigo-600 rounded-lg shadow-sm"><Target size={18} className="text-white" /></div><h1 className="text-lg font-black text-slate-900 uppercase tracking-widest">GoaLine</h1></div>
            <div className="order-2 w-full md:w-auto flex justify-between md:contents">
                <div className="flex items-center gap-2"><Target size={16} className="text-slate-400" /><h2 className="text-sm font-bold text-slate-700">Q1 Growth Strategy</h2></div>
                <div className="flex items-center gap-4">
                      <div className="relative">
                          <button id="tour-profile-btn" onClick={() => setShowProfileMenu(!showProfileMenu)} className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-lg transition-colors cursor-pointer">
                             {userAvatar ? <img src={userAvatar} alt="Profile" className="w-8 h-8 rounded-full border border-slate-200" /> : <div className="w-8 h-8 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600"><UserCircle size={20} /></div>}
                             <div className="text-left hidden sm:block"><div className="text-[10px] font-bold text-slate-900 leading-none mb-0.5 flex items-center gap-1">{userName} {isAdmin && <ShieldCheck size={10} className="text-indigo-600" />}</div><div className="text-[9px] font-medium text-slate-400 leading-none">Settings</div></div>
                          </button>
                          {showProfileMenu && <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-xl shadow-2xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 duration-200">
                                 <div className="px-4 py-2 border-b border-slate-50"><p className="text-xs font-bold text-slate-900 truncate">{session.user.email}</p>{isAdmin && <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded mt-1 inline-block">ADMIN ACCESS</span>}</div>
                                 <button onClick={() => { setIsSettingsOpen(true); setShowProfileMenu(false); }} className="w-full text-left px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 hover:text-indigo-600 transition-colors flex items-center gap-2 cursor-pointer"><Settings size={14} /> Account Settings</button>
                                 <button onClick={() => { setIsTourActive(true); setTourStepIndex(0); setShowProfileMenu(false); }} className="hidden md:flex w-full text-left px-4 py-2 text-xs font-medium text-indigo-600 hover:bg-indigo-50 transition-colors items-center gap-2 cursor-pointer"><HelpCircle size={14} /> Restart Tour</button>
                                 <button onClick={handleSignOut} className="w-full text-left px-4 py-2 text-xs font-medium text-red-500 hover:bg-red-50 transition-colors flex items-center gap-2 cursor-pointer"><LogOut size={14} /> Sign Out</button>
                             </div>}
                      </div>
                      <div className="h-6 w-px bg-slate-200"></div>
                      <div className="flex items-center gap-3">
                          {profile?.business_name && <div className="text-right hidden sm:block"><div className="text-[10px] font-bold text-slate-900 leading-none mb-0.5 uppercase tracking-wide">{profile.business_name}</div><div className="text-[9px] font-medium text-slate-400 leading-none">Organization</div></div>}
                          {displayLogo ? <div className="h-8 w-auto min-w-[2rem] rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden bg-white px-2" title="Business Logo"><img src={displayLogo} alt="Business Logo" className="h-full w-full object-contain" /></div> : <div className="w-8 h-8 rounded-lg border border-dashed border-slate-300 flex items-center justify-center text-slate-300 bg-slate-50" title="No Logo Uploaded"><Target size={14} /></div>}
                      </div>
                </div>
            </div>
        </div>

        {/* TOOLBAR */}
        <div className="bg-slate-900 px-6 py-3 flex justify-between items-center shadow-md z-10">
            <button id="tour-library-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="flex items-center gap-2 text-white transition-colors text-xs font-bold uppercase tracking-widest cursor-pointer group hover:text-indigo-400"><BookOpen size={16} className="text-indigo-400 group-hover:text-indigo-300 transition-colors" /><span>Open Library</span></button>
            <div className="flex items-center gap-6">
                <div className="hidden md:flex items-center gap-6 border-r border-slate-700 pr-6 mr-2">
                    <div className="flex flex-col items-end"><span className="text-[9px] font-bold text-white/90 uppercase tracking-widest">Budget</span><span className="text-sm font-black text-white font-mono">${totalBudget.toLocaleString()}</span></div>
                    <div className="flex flex-col items-end"><span className="text-[9px] font-bold text-white/90 uppercase tracking-widest">Tactics</span><span className="text-sm font-black text-white font-mono">{totalTactics}</span></div>
                </div>
                <button id="tour-download-btn" onClick={downloadPDF} disabled={isDownloading} className="text-slate-400 hover:text-white transition-colors cursor-pointer" title="Download PDF">{isDownloading ? <Loader2 className="animate-spin" size={18}/> : <Download size={18} />}</button>
                <button id="tour-ai-btn" onClick={() => setIsAIModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-bold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-indigo-900/50 cursor-pointer"><Sparkles size={14} /><span>AI Strategist</span></button>
            </div>
        </div>

        {/* LANES */}
        <div className="flex-1 flex flex-col md:flex-row gap-8 overflow-y-auto md:overflow-x-auto px-4 md:px-8 py-8 items-start w-full bg-slate-200 custom-scrollbar" onClick={() => setShowProfileMenu(false)}>
            {lanes.map((lane) => <PlanLane key={lane.id} lane={lane} tools={tools} agencies={agencies} onAdd={openAddModal} onDelete={openDeleteModal} onEdit={openEditModal} onUpdateBudget={updateTacticBudget} onOpenTool={setSelectedTool} onOpenAgency={setSelectedAgency} onOpenLaneInfo={setLaneInfoTitle} />)}
        </div>
        
        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.4' } } }) }}>
            {activeTactic ? <TacticCard tactic={activeTactic} isOverlay /> : null}
            {activeLibraryItem ? <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xl rotate-2 w-72"><div className="flex justify-between items-start mb-2"><span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-1.5 py-0.5 bg-indigo-50 rounded text-indigo-700">{activeLibraryItem.category}</span></div><h4 className="font-bold text-slate-900 text-sm mb-1">{activeLibraryItem.title}</h4><div className="text-[10px] font-bold text-slate-600 font-mono mt-2 bg-slate-100 px-2 py-1 rounded inline-block">${activeLibraryItem.default_budget.toLocaleString()}</div></div> : null}
        </DragOverlay>
      </div>

      {/* --- ALL MODALS --- */}
      <WelcomeWizard show={showWelcomeWizard} onClose={() => setShowWelcomeWizard(false)} onSubmit={handleWizardSubmit} input={wizardInput} setInput={setWizardInput} isGenerating={isWizardGenerating} />
      <TourGuide active={isTourActive} onClose={() => setIsTourActive(false)} onNext={() => { if (tourStepIndex < 6) setTourStepIndex(tourStepIndex + 1); else setIsTourActive(false); }} stepIndex={tourStepIndex} totalSteps={7} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} session={session} profile={profile} onProfileUpdate={(updates) => setProfile(updates)} />
      
      {/* Small Utility Modals */}
      <LaneInfoModal title={laneInfoTitle} onClose={() => setLaneInfoTitle(null)} description={getLaneDescription(laneInfoTitle || '')} />
      <ToolModal tool={selectedTool} onClose={() => setSelectedTool(null)} />
      <AgencyModal agency={selectedAgency} onClose={() => setSelectedAgency(null)} />
      
      {/* Form Modals */}
      <TacticAddModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={submitAddTactic} name={tacticName} setName={setTacticName} budget={tacticBudget} setBudget={setTacticBudget} />
      
      {/* Updated Tactic Edit Modal with Submission Props */}
      <TacticEditModal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        onSubmit={submitEditTactic} 
        name={tacticName} 
        setName={setTacticName} 
        budget={tacticBudget} 
        setBudget={setTacticBudget} 
        content={tacticContent} 
        setContent={setTacticContent} 
        onAutoWrite={handleAutoWrite} 
        isWriting={isWriting} 
        onSubmitLibrary={handleSubmitToLibrary} 
        isSubmitting={isSubmitting} 
        submitError={submitError}
        submitSuccess={submitSuccess} // <--- NEW PROP
      />
      
      <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} />
      
      {/* Large Feature Modals */}
      <AIStrategistModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} onSubmit={handleAIGenerate} description={businessDesc} setDescription={setBusinessDesc} isGenerating={isAIGenerating} />
      <AdminLibraryModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} onSubmit={handleCreateLibraryTactic} name={adminTacticName} setName={setAdminTacticName} budget={adminTacticBudget} setBudget={setAdminTacticBudget} category={adminTacticCategory} setCategory={setAdminTacticCategory} desc={adminTacticDesc} setDesc={setAdminTacticDesc} />
      
    </div>
    </DndContext>
  );
}