"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { 
  DndContext, DragEndEvent, DragStartEvent, DragOverEvent, DragOverlay, useSensor, useSensors, 
  PointerSensor, TouchSensor, closestCorners, defaultDropAnimationSideEffects
} from '@dnd-kit/core';
import { 
  arrayMove, SortableContext, verticalListSortingStrategy, useSortable 
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { createClient } from '@supabase/supabase-js';
import { 
  Megaphone, Zap, Heart, Plus, Download, Sparkles, 
  MoreVertical, CheckCircle2, Box, Loader2, Edit2, Trash2,
  BookOpen, X, Search, Lightbulb, ArrowRight
} from 'lucide-react';
import jsPDF from 'jspdf';

// --- IMPORTS ---
import { generateMarketingPlan, generateTacticContent } from '@/app/actions';
import { TacticAddModal, TacticEditModal, DeleteModal } from '@/components/modals/TacticModals';
import { AIStrategistModal } from '@/components/modals/AIStrategistModal';
import { AdminLibraryModal } from '@/components/modals/AdminLibraryModal';

// --- TYPES ---
type Tactic = {
  id: string;
  title: string;
  budget: number;
  content?: string;
  status?: 'DRAFT' | 'READY';
  section_id: string;
  tools?: string[];
  experts?: string[];
  ai_rationale?: string;
  action_item?: string;
};

type Lane = {
  id: string;
  title: string;
  items: Tactic[];
};

type LibraryItem = {
  id: string;
  title: string;
  category: string;
  default_budget: number;
  description: string;
  tools: string[];
  experts: string[];
};

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- INITIAL DATA ---
const INITIAL_LIBRARY: LibraryItem[] = [
  { id: 'lib1', title: 'Viral TikTok Challenge', category: 'Awareness', default_budget: 1500, description: 'Launch a hashtag challenge to engage Gen Z users.', tools: ['TikTok', 'CapCut'], experts: ['ViralNation'] },
  { id: 'lib2', title: 'SEO Content Sprint', category: 'Awareness', default_budget: 2000, description: 'Create 20 high-quality blog posts targeting long-tail keywords.', tools: ['SEMrush', 'Jasper'], experts: ['Neil Patel Digital'] },
  { id: 'lib3', title: 'Email Drip Campaign', category: 'Conversion', default_budget: 500, description: 'Set up a 7-day automated email sequence for new leads.', tools: ['Mailchimp', 'HubSpot'], experts: ['Retention.com'] },
  { id: 'lib4', title: 'Loyalty Rewards Program', category: 'Retention', default_budget: 300, description: 'Implement a points-based system to encourage repeat purchases.', tools: ['Smile.io'], experts: [] },
];

export default function TacticsPage() {
  const [mounted, setMounted] = useState(false);
  const [session, setSession] = useState<any>(null);
  
  // Board State
  const [lanes, setLanes] = useState<Lane[]>([]);
  const [activeTactic, setActiveTactic] = useState<Tactic | null>(null);
  const [activeLibraryItem, setActiveLibraryItem] = useState<LibraryItem | null>(null);
  
  // Library State
  const [libraryItems, setLibraryItems] = useState<LibraryItem[]>(INITIAL_LIBRARY);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [librarySearch, setLibrarySearch] = useState('');

  // Modal States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [isAdminModalOpen, setIsAdminModalOpen] = useState(false);

  // Strategy Summary Popup
  const [strategySummary, setStrategySummary] = useState<{title: string, summary: string} | null>(null);

  // Edit/Create Data Triggers
  const [targetLaneId, setTargetLaneId] = useState<string | null>(null);
  const [editingTactic, setEditingTactic] = useState<Tactic | null>(null);
  const [tacticToDelete, setTacticToDelete] = useState<string | null>(null);
  
  // Edit Modal Data Passing
  const [activeAiRationale, setActiveAiRationale] = useState('');
  const [activeActionItem, setActiveActionItem] = useState('');

  // Forms
  const [tacticName, setTacticName] = useState('');
  const [tacticBudget, setTacticBudget] = useState(0);
  const [tacticContent, setTacticContent] = useState('');
  
  // Admin Form
  const [adminTacticName, setAdminTacticName] = useState('');
  const [adminTacticDesc, setAdminTacticDesc] = useState('');
  const [adminTacticBudget, setAdminTacticBudget] = useState(0);
  const [adminTacticCategory, setAdminTacticCategory] = useState('Awareness');
  
  // AI State
  const [businessDesc, setBusinessDesc] = useState('');
  const [isAIGenerating, setIsAIGenerating] = useState(false);
  const [isWriting, setIsWriting] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(TouchSensor)
  );

  useEffect(() => {
    setMounted(true);
    supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
    
    // Initial Board Setup
    setLanes([
      { id: 'awareness', title: 'AWARENESS', items: [] },
      { id: 'conversion', title: 'CONVERSION', items: [] },
      { id: 'retention', title: 'RETENTION', items: [] }
    ]);
  }, []);

  const filteredLibrary = useMemo(() => 
    libraryItems.filter(i => i.title.toLowerCase().includes(librarySearch.toLowerCase())), 
  [librarySearch, libraryItems]);

  // --- ACTIONS ---

  function handleCreateLibraryTactic(e: React.FormEvent) {
    e.preventDefault();
    const newLibItem: LibraryItem = {
      id: crypto.randomUUID(),
      title: adminTacticName,
      description: adminTacticDesc,
      default_budget: Number(adminTacticBudget),
      category: adminTacticCategory,
      tools: [],
      experts: []
    };
    setLibraryItems(prev => [...prev, newLibItem]);
    setAdminTacticName(''); setAdminTacticDesc(''); setAdminTacticBudget(0);
    setIsAdminModalOpen(false);
  }

  // --- DRAG AND DROP HANDLERS ---

  function handleDragStart(event: DragStartEvent) {
    const { active } = event;
    if (active.data.current?.type === 'library') {
      setActiveLibraryItem(active.data.current.item);
      return;
    }
    const tactic = lanes.flatMap(l => l.items).find(i => i.id === active.id);
    if (tactic) setActiveTactic(tactic);
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over || active.data.current?.type === 'library') return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceLane = lanes.find(l => l.items.some(i => i.id === activeId));
    const destLane = lanes.find(l => l.id === overId || l.items.some(i => i.id === overId));

    if (!sourceLane || !destLane || sourceLane === destLane) return;

    setLanes(prev => {
      const activeItem = sourceLane.items.find(i => i.id === activeId);
      if (!activeItem) return prev;

      return prev.map(lane => {
        if (lane.id === sourceLane.id) {
          return { ...lane, items: lane.items.filter(i => i.id !== activeId) };
        }
        if (lane.id === destLane.id) {
          const overItemIndex = lane.items.findIndex(i => i.id === overId);
          let newItems = [...lane.items];
          const updatedItem = { ...activeItem, section_id: destLane.id };
          if (overItemIndex >= 0) newItems.splice(overItemIndex, 0, updatedItem);
          else newItems.push(updatedItem);
          return { ...lane, items: newItems };
        }
        return lane;
      });
    });
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    setActiveTactic(null);
    setActiveLibraryItem(null);

    if (!over) return;

    if (active.data.current?.type === 'library') {
      const libItem = active.data.current.item as LibraryItem;
      const overId = over.id as string;
      let targetLane = lanes.find(l => l.id === overId);
      if (!targetLane) targetLane = lanes.find(l => l.items.some(i => i.id === overId));
      if (targetLane) addFromLibrary(libItem, targetLane.id);
      return;
    }

    const activeId = active.id as string;
    const overId = over.id as string;
    const destLane = lanes.find(l => l.items.some(i => i.id === activeId));
    
    if (destLane) {
      const oldIndex = destLane.items.findIndex(i => i.id === activeId);
      const newIndex = destLane.items.findIndex(i => i.id === overId);
      if (oldIndex !== newIndex) {
        setLanes(prev => prev.map(lane => {
          if (lane.id === destLane.id) return { ...lane, items: arrayMove(lane.items, oldIndex, newIndex) };
          return lane;
        }));
      }
    }
  }

  function addFromLibrary(item: LibraryItem, laneId: string) {
    const newItem: Tactic = {
      id: crypto.randomUUID(),
      title: item.title,
      budget: item.default_budget,
      content: item.description,
      status: 'DRAFT',
      section_id: laneId,
      tools: item.tools,
      experts: item.experts
    };
    setLanes(prev => prev.map(l => l.id === laneId ? { ...l, items: [...l.items, newItem] } : l));
  }

  // --- SMART FEATURES ---

  async function handleAutoWrite(instructions: string) {
    setIsWriting(true);
    
    // Call the REAL server action
    const text = await generateTacticContent(tacticName, tacticBudget, instructions);
    setTacticContent(text); // Updates the text area instantly

    // Update AI Insights based on generated content
    if (editingTactic) {
      setLanes(prev => prev.map(l => ({
        ...l,
        items: l.items.map(i => i.id === editingTactic.id ? { 
          ...i, 
          content: text, // Update content on card too
          tools: ["Canva", "Buffer"], // Example: You might want these from AI too eventually
          experts: ["Disruptive Advertising"],
          ai_rationale: `AI Suggestion based on "${instructions}"`,
          action_item: "Review the generated content and refine."
        } : i)
      })));
      setActiveAiRationale(`AI Suggestion based on "${instructions}"`);
      setActiveActionItem("Review the generated content and refine.");
    }
    setIsWriting(false);
  }

  async function handleAIGenerate(e: React.FormEvent) {
    e.preventDefault(); 
    if (!businessDesc.trim()) return; 
    setIsAIGenerating(true);
    
    const suggestions = await generateMarketingPlan(businessDesc); // Real server action
    
    if (suggestions && suggestions.length > 0) {
      // Map the AI response to our local Tactic structure
      const newItems = suggestions.map((s: any) => ({
        id: crypto.randomUUID(),
        title: s.title,
        budget: s.budget || 0,
        section_id: s.section || 'awareness', // Use AI suggested section or default
        status: (s.budget > 0) ? 'READY' : 'DRAFT',
        tools: [],
        experts: [],
        ai_rationale: s.rationale,
        action_item: s.action
      }));

      // Distribute to lanes based on section_id
      setLanes(prev => {
        const newLanes = prev.map(l => ({...l, items: [...l.items]})); // Deep copy to be safe
        newItems.forEach((item: Tactic) => {
          const laneIndex = newLanes.findIndex(l => l.id.toLowerCase() === item.section_id.toLowerCase());
          if (laneIndex >= 0) {
            newLanes[laneIndex].items.push(item);
          } else {
            newLanes[0].items.push(item); // Fallback
          }
        });
        return newLanes;
      });

      setStrategySummary({
        title: "Growth Strategy Generated",
        summary: `I've analyzed your goal and created ${newItems.length} high-impact tactics focused on your specific business needs.`
      });
    }

    setIsAIGenerating(false);
    setIsAIModalOpen(false);
    setBusinessDesc('');
  }

  // --- CRUD ---
  
  function openAddModal(laneId: string) { 
    setTargetLaneId(laneId); 
    setTacticName(''); 
    setTacticBudget(0); 
    setIsAddModalOpen(true); 
  }
  
  function submitAddTactic(e: React.FormEvent) {
    e.preventDefault();
    const newId = crypto.randomUUID();
    const newItem: Tactic = { id: newId, title: tacticName, budget: Number(tacticBudget), section_id: targetLaneId!, status: 'DRAFT', tools: [], experts: [] };
    setLanes(prev => prev.map(l => l.id === targetLaneId ? { ...l, items: [...l.items, newItem] } : l));
    setIsAddModalOpen(false);
  }

  function openEditModal(tactic: Tactic) {
    setEditingTactic(tactic);
    setTacticName(tactic.title);
    setTacticBudget(tactic.budget);
    setTacticContent(tactic.content || '');
    setActiveAiRationale(tactic.ai_rationale || '');
    setActiveActionItem(tactic.action_item || '');
    setIsEditModalOpen(true);
  }

  function submitEditTactic(e: React.FormEvent) {
    e.preventDefault();
    if (!editingTactic) return;
    setLanes(prev => prev.map(lane => ({
      ...lane,
      items: lane.items.map(i => i.id === editingTactic.id ? { 
        ...i, 
        title: tacticName, 
        budget: Number(tacticBudget), 
        content: tacticContent 
      } : i)
    })));
    setIsEditModalOpen(false);
  }

  function confirmDelete() {
    if (!tacticToDelete) return;
    setLanes(prev => prev.map(lane => ({
      ...lane,
      items: lane.items.filter(i => i.id !== tacticToDelete)
    })));
    setIsDeleteModalOpen(false);
    setTacticToDelete(null);
  }

  if (!mounted) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-purple-600" /></div>;

  const totalBudget = lanes.reduce((sum, lane) => sum + lane.items.reduce((s, i) => s + Number(i.budget), 0), 0);

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragStart={handleDragStart} onDragOver={handleDragOver} onDragEnd={handleDragEnd}>
      <div className="flex h-screen overflow-hidden relative">
        
        {/* MAIN BOARD */}
        <div className="flex-1 flex flex-col h-full space-y-6 pb-20 pr-4 overflow-y-auto">
          {/* Header */}
          <div className="bg-slate-900 text-white rounded-[20px] p-4 flex flex-col md:flex-row items-center justify-between shadow-lg gap-4 shrink-0">
            <div className="flex items-center gap-6 px-4">
              <h1 className="text-lg font-bold flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-blue-400"></div> Q1 Growth Strategy</h1>
            </div>
            <div className="flex items-center gap-6">
              <div className="text-right hidden md:block"><div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Budget</div><div className="text-lg font-bold">${totalBudget.toLocaleString()}</div></div>
              <button onClick={() => setIsLibraryOpen(true)} className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white px-4 py-2 rounded-xl font-bold text-xs transition-all border border-white/10"><BookOpen size={16} /> Library</button>
              <button onClick={() => setIsAIModalOpen(true)} className="bg-purple-600 hover:bg-purple-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-lg shadow-purple-900/50 transition-all active:scale-95"><Sparkles size={16} /> AI STRATEGIST</button>
            </div>
          </div>

          {/* Kanban */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
            {lanes.map((lane) => (
              <SortableColumn 
                key={lane.id} lane={lane} 
                onAdd={() => openAddModal(lane.id)}
                onEdit={openEditModal}
                onDelete={(id: string) => { setTacticToDelete(id); setIsDeleteModalOpen(true); }}
              />
            ))}
          </div>
        </div>

        {/* --- LIBRARY SIDEBAR --- */}
        <div className={`fixed inset-y-0 right-0 z-50 w-80 bg-white shadow-2xl border-l border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col ${isLibraryOpen ? 'translate-x-0' : 'translate-x-full'}`}>
          <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
            <h3 className="font-bold text-slate-900 flex items-center gap-2"><BookOpen size={18} className="text-purple-600"/> Tactic Library</h3>
            <button onClick={() => setIsLibraryOpen(false)} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
          </div>
          <div className="p-4 border-b border-slate-100 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={14} />
              <input type="text" placeholder="Search..." value={librarySearch} onChange={(e) => setLibrarySearch(e.target.value)} className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-bold outline-none focus:border-purple-500" />
            </div>
            <button onClick={() => setIsAdminModalOpen(true)} className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 text-white py-2.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"><Plus size={14} /> Create Template</button>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
            {filteredLibrary.map(item => <DraggableLibraryCard key={item.id} item={item} />)}
          </div>
        </div>

        <DragOverlay dropAnimation={{ sideEffects: defaultDropAnimationSideEffects({ styles: { active: { opacity: '0.5' } } }) }}>
           {activeTactic ? <TacticCard tactic={activeTactic} isOverlay /> : null}
           {activeLibraryItem ? <div className="p-4 bg-white border border-slate-200 rounded-xl shadow-2xl rotate-2 w-64 border-l-4 border-l-purple-500"><h4 className="font-bold text-slate-900 text-sm">{activeLibraryItem.title}</h4><span className="text-[10px] text-slate-500 font-bold uppercase">{activeLibraryItem.category}</span></div> : null}
        </DragOverlay>

        {/* --- STRATEGY SUMMARY POPUP (NEW) --- */}
        {strategySummary && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
            <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-8 relative animate-in zoom-in-95">
              <button onClick={() => setStrategySummary(null)} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600"><X size={24}/></button>
              <div className="w-14 h-14 bg-purple-100 rounded-2xl flex items-center justify-center mb-6 text-purple-600"><Sparkles size={32} /></div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">{strategySummary.title}</h2>
              <div className="h-1 w-12 bg-purple-500 rounded-full mb-6"></div>
              <p className="text-slate-600 leading-relaxed mb-8">{strategySummary.summary}</p>
              <button onClick={() => setStrategySummary(null)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors">See My Board</button>
            </div>
          </div>
        )}

        {/* MODALS */}
        <TacticAddModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onSubmit={submitAddTactic} name={tacticName} setName={setTacticName} budget={tacticBudget} setBudget={setTacticBudget} />
        
        <TacticEditModal 
          isOpen={isEditModalOpen} 
          onClose={() => setIsEditModalOpen(false)} 
          onSubmit={submitEditTactic} 
          name={tacticName} setName={setTacticName} 
          budget={tacticBudget} setBudget={setTacticBudget} 
          content={tacticContent} setContent={setTacticContent} 
          onAutoWrite={handleAutoWrite} isWriting={isWriting} 
          // PASSING THE AI DATA HERE
          aiRationale={activeAiRationale}
          actionItem={activeActionItem}
          
          onSubmitLibrary={()=>{}} isSubmitting={false} 
        />
        
        <AIStrategistModal isOpen={isAIModalOpen} onClose={() => setIsAIModalOpen(false)} onSubmit={handleAIGenerate} description={businessDesc} setDescription={setBusinessDesc} isGenerating={isAIGenerating} />
        <DeleteModal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} onConfirm={confirmDelete} />
        <AdminLibraryModal isOpen={isAdminModalOpen} onClose={() => setIsAdminModalOpen(false)} onSubmit={handleCreateLibraryTactic} name={adminTacticName} setName={setAdminTacticName} budget={adminTacticBudget} setBudget={setAdminTacticBudget} category={adminTacticCategory} setCategory={setAdminTacticCategory} desc={adminTacticDesc} setDesc={setAdminTacticDesc} />
      </div>
    </DndContext>
  );
}

// --- SUB COMPONENTS ---
function DraggableLibraryCard({ item }: { item: LibraryItem }) {
  const { attributes, listeners, setNodeRef, isDragging } = useSortable({ id: item.id, data: { type: 'library', item } });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={`bg-white p-4 rounded-xl border border-slate-200 shadow-sm cursor-grab hover:border-purple-300 hover:shadow-md transition-all group ${isDragging ? 'opacity-30' : ''}`}>
      <div className="flex justify-between items-start mb-2"><span className="text-[9px] font-black text-purple-600 uppercase tracking-widest bg-purple-50 px-2 py-1 rounded">{item.category}</span><Plus size={14} className="text-slate-300 group-hover:text-purple-600" /></div>
      <h4 className="font-bold text-slate-800 text-xs mb-2 leading-tight">{item.title}</h4>
      <div className="text-[10px] font-bold text-slate-500 font-mono">${item.default_budget}</div>
    </div>
  );
}

function SortableColumn({ lane, onAdd, onEdit, onDelete }: any) {
  const iconMap: any = { 'AWARENESS': <Megaphone size={18} className="text-blue-500" />, 'CONVERSION': <Zap size={18} className="text-orange-500" />, 'RETENTION': <Heart size={18} className="text-red-500" /> };
  return (
    <div className="flex flex-col gap-4">
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-3"><div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100">{iconMap[lane.title.toUpperCase()] || <Box size={18} />}</div><span className="font-bold text-slate-900 uppercase">{lane.title}</span></div>
        <span className="bg-slate-900 text-white text-xs font-bold px-3 py-1.5 rounded-lg">${lane.items.reduce((acc:any, i:any) => acc + Number(i.budget), 0).toLocaleString()}</span>
      </div>
      <button onClick={onAdd} className="w-full py-3 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-xs flex items-center justify-center gap-2 hover:border-purple-300 hover:text-purple-600 transition-all"><Plus size={16} /> ADD TACTIC</button>
      <SortableContext items={lane.items.map((i:any) => i.id)} strategy={verticalListSortingStrategy} id={lane.id}>
        <div className="flex flex-col gap-4 min-h-[100px]">
          {lane.items.map((item: any) => <SortableTacticCard key={item.id} tactic={item} onEdit={onEdit} onDelete={onDelete} />)}
        </div>
      </SortableContext>
    </div>
  );
}

function SortableTacticCard(props: any) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.tactic.id, data: { type: 'tactic', item: props.tactic } });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.3 : 1 };
  return <div ref={setNodeRef} style={style} {...attributes} {...listeners}><TacticCard {...props} /></div>;
}

function TacticCard({ tactic, isOverlay, onEdit, onDelete }: any) {
  const isReady = tactic.budget > 0;
  return (
    <div 
      onClick={() => !isOverlay && onEdit && onEdit(tactic)} 
      className={`bg-white p-5 rounded-[20px] border border-slate-200 shadow-sm flex flex-col gap-3 relative group ${isOverlay ? 'shadow-2xl rotate-2 cursor-grabbing border-purple-500' : 'hover:shadow-md cursor-pointer'}`}
    >
      {!isOverlay && (
        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10">
          <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onEdit(tactic); }} className="p-1.5 text-slate-400 hover:text-blue-500 bg-slate-50 hover:bg-blue-50 rounded-lg transition-colors"><Edit2 size={14} /></button>
          <button onPointerDown={(e) => e.stopPropagation()} onClick={(e) => { e.stopPropagation(); onDelete(tactic.id); }} className="p-1.5 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={14} /></button>
        </div>
      )}
      <div className="absolute top-5 left-3 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"><MoreVertical size={16} /></div>
      <div className="pl-4">
        <h4 className="font-bold text-slate-800 text-sm mb-4 leading-tight pr-10">{tactic.title}</h4>
        <div className="flex items-center justify-between mb-2">
          <div className="relative" onPointerDown={(e) => e.stopPropagation()} onClick={(e) => e.stopPropagation()}><span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span><div className="w-24 pl-6 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-xs font-bold text-slate-700">{tactic.budget}</div></div>
          <span className={`text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 ${isReady ? 'bg-green-50 text-green-600' : 'text-slate-300'}`}>{isReady && <CheckCircle2 size={12} />}{isReady ? 'READY' : 'DRAFT'}</span>
        </div>
        
        {/* --- AI INSIGHT SECTION --- */}
        {tactic.ai_rationale && (
           <div className="bg-purple-50 p-3 rounded-xl mt-3 border border-purple-100">
              <div className="flex items-center gap-2 text-purple-700 text-[9px] font-black uppercase tracking-widest mb-2">
                 <Sparkles size={10} /> AI Insight
              </div>
              <p className="text-xs text-purple-900 leading-relaxed font-medium">{tactic.ai_rationale}</p>
              {tactic.action_item && (
                <div className="mt-2 pt-2 border-t border-purple-200/50 flex items-start gap-2">
                   <ArrowRight size={12} className="text-purple-600 mt-0.5 shrink-0" />
                   <span className="text-xs text-purple-800 font-bold">{tactic.action_item}</span>
                </div>
              )}
           </div>
        )}

        {(tactic.tools?.length > 0 || tactic.experts?.length > 0) && (
          <div className="space-y-3 pt-3 border-t border-slate-50 mt-2">
            {tactic.tools?.length > 0 && <div><div className="text-[9px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Tools</div><div className="flex flex-wrap gap-2">{tactic.tools.map((t: string, i: number) => <span key={i} className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md text-[10px] font-bold flex items-center gap-1"><Box size={10} /> {t}</span>)}</div></div>}
            {tactic.experts?.length > 0 && <div><div className="text-[9px] font-bold text-slate-400 uppercase mb-1.5 tracking-wider">Verified Experts</div><div className="flex flex-wrap gap-2">{tactic.experts.map((e: string, i: number) => <span key={i} className="px-2 py-1 bg-green-50 text-green-700 rounded-md text-[10px] font-bold flex items-center gap-1"><CheckCircle2 size={10} /> {e}</span>)}</div></div>}
          </div>
        )}
      </div>
    </div>
  );
}