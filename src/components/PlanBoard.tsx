'use client';

import React, { useState } from 'react';
import { 
  DndContext, 
  DragEndEvent, 
  DragStartEvent, 
  DragOverlay, // <--- NEW: The magic layer
  useSensor, 
  useSensors, 
  PointerSensor, 
  TouchSensor, 
  useDroppable,
  defaultDropAnimationSideEffects, 
  DropAnimation 
} from '@dnd-kit/core';
import { arrayMove, SortableContext, verticalListSortingStrategy, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Plus, Trash2, X, Sparkles, Loader2, Download, CheckCircle2, PieChart, Megaphone, Zap, Heart, Layers } from 'lucide-react'; 
import { createClient } from '@supabase/supabase-js';
import { generateMarketingPlan, generateTacticContent } from '@/app/actions';
import jsPDF from 'jspdf';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!, 
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export type Tactic = { id: string; title: string; budget: number; content?: string };
export type Lane = { id: string; title: string; items: Tactic[] };

// --- HELPER: Icons ---
function getLaneIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('awareness')) return <Megaphone size={18} className="text-blue-500" />;
  if (t.includes('consideration') || t.includes('conversion')) return <Zap size={18} className="text-amber-500" fill="currentColor" fillOpacity={0.2} />;
  if (t.includes('retention') || t.includes('decision')) return <Heart size={18} className="text-rose-500" fill="currentColor" fillOpacity={0.2} />;
  return <Layers size={18} className="text-slate-400" />;
}

// --- 1. THE VISUAL CARD (Pure UI) ---
// We separated logic (Sortable) from visuals so we can use this in the Overlay too
function TacticCard({ tactic, onDelete, onEdit, isOverlay, isDragging }: { tactic: Tactic, onDelete?: (id: string) => void, onEdit?: (tactic: Tactic) => void, isOverlay?: boolean, isDragging?: boolean }) {
  
  return (
    <div 
         onClick={() => onEdit && onEdit(tactic)}
         className={`
           group relative p-4 mb-3 rounded-xl bg-white border border-slate-200 shadow-sm
           /* If Overlay (Flying): Huge Shadow, Rotate, Scale */
           ${isOverlay ? 'shadow-2xl ring-2 ring-indigo-500/20 rotate-2 scale-105 cursor-grabbing z-50' : 'cursor-grab hover:shadow-md hover:border-indigo-400 hover:-translate-y-1'}
           /* If Original (Ghost): Fade out */
           ${isDragging ? 'opacity-30 grayscale border-dashed border-slate-300' : 'opacity-100'}
           transition-all duration-200 ease-out select-none
         `}>
      
      {!isOverlay && onDelete && (
        <button 
            onPointerDown={(e) => { e.stopPropagation(); onDelete(tactic.id); }}
            className="absolute top-4 right-4 text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ignore-pdf"
        >
            <Trash2 size={15} />
        </button>
      )}

      <div className="flex gap-4 items-start">
        <div className={`mt-1 transition-colors ${isOverlay ? 'text-indigo-600' : 'text-slate-300 group-hover:text-indigo-500'}`}>
            <GripVertical size={18} />
        </div>

        <div className="flex-1 space-y-3">
          <div className="pr-6">
             <div className="font-bold text-slate-800 text-[15px] leading-snug">
                {tactic.title}
             </div>
          </div>
          
          <div className="flex items-center justify-between pt-2 border-t border-slate-50 mt-1">
             <div className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-slate-100 text-xs font-bold text-slate-600 font-mono">
                <span>${tactic.budget.toLocaleString()}</span>
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
    </div>
  );
}

// --- 2. THE LOGIC CARD (Connects to DND Kit) ---
function SortableTacticCard({ tactic, onDelete, onEdit }: { tactic: Tactic, onDelete: (id: string) => void, onEdit: (tactic: Tactic) => void }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: tactic.id });
    
    const style = {
      transform: CSS.Translate.toString(transform), // Use Translate, easier for overlays
      transition,
    };
  
    return (
        <div ref={setNodeRef} style={style} {...attributes} {...listeners}>
            {/* Pass isDragging to make it a ghost */}
            <TacticCard tactic={tactic} onDelete={onDelete} onEdit={onEdit} isDragging={isDragging} />
        </div>
    );
}

// --- 3. THE LANE ---
function PlanLane({ lane, onAdd, onDelete, onEdit }: { lane: Lane; onAdd: (laneId: string) => void, onDelete: (id: string) => void, onEdit: (t: Tactic) => void }) {
  const { setNodeRef } = useDroppable({ id: lane.id });
  const laneTotal = lane.items.reduce((sum, item) => sum + item.budget, 0);

  return (
    <div ref={setNodeRef} className="flex-1 min-w-[350px] flex flex-col h-full">
      <div className="flex flex-col h-full bg-white rounded-2xl shadow-2xl overflow-hidden border border-slate-100">
          
          {/* HEADER */}
          <div className="p-6 bg-white border-b border-slate-100">
            <div className="flex justify-between items-start mb-5">
                <div className="flex items-center gap-3">
                    <div className="p-2.5 bg-slate-50 border border-slate-100 rounded-lg shadow-sm">
                        {getLaneIcon(lane.title)}
                    </div>
                    <h3 className="font-black text-slate-900 text-lg uppercase tracking-tighter">
                        {lane.title}
                    </h3>
                </div>
                
                <span className="flex items-center gap-2 bg-slate-50 px-3 py-1.5 rounded-lg border border-slate-100">
                    <span className="text-xs font-bold text-slate-700 font-mono">${laneTotal.toLocaleString()}</span>
                </span>
            </div>
            
            <button 
                onClick={() => onAdd(lane.id)}
                className="group w-full py-3 flex items-center justify-center gap-2 bg-white border-2 border-slate-100 rounded-xl 
                           text-xs font-bold uppercase tracking-wider text-slate-400 
                           hover:text-white hover:bg-slate-900 hover:border-slate-900 
                           transition-all duration-200 ignore-pdf"
            >
                <Plus size={14} strokeWidth={3} className="text-slate-300 group-hover:text-white transition-colors" /> Add Tactic
            </button>
          </div>
          
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-slate-50/50">
            <SortableContext items={lane.items.map(i => i.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col pb-2">
                {lane.items.length === 0 && (
                    <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                        <PieChart className="text-slate-300 mb-2" size={24} />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Empty Stage</p>
                    </div>
                )}
                {lane.items.map((tactic) => (
                    <SortableTacticCard key={tactic.id} tactic={tactic} onDelete={onDelete} onEdit={onEdit} />
                ))}
              </div>
            </SortableContext>
          </div>
      </div>
    </div>
  );
}

// --- 4. MAIN WORKSPACE ---
export default function PlanBoard({ initialLanes }: { initialLanes: Lane[] }) {
  const [lanes, setLanes] = useState<Lane[]>(initialLanes);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [activeTactic, setActiveTactic] = useState<Tactic | null>(null); // NEW: Track the specific card data

  // States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false); 
  const [isGenerating, setIsGenerating] = useState(false);   
  const [isDownloading, setIsDownloading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);

  const [targetLaneId, setTargetLaneId] = useState<string | null>(null);
  const [editingTactic, setEditingTactic] = useState<Tactic | null>(null);
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

  // --- ACTIONS ---
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
    doc.setFont("helvetica", "bold"); doc.setFontSize(22); doc.text("Growth Strategy Plan", 20, 20);
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
    e.preventDefault(); if (!businessDesc.trim()) return;
    setIsGenerating(true);
    const suggestions = await generateMarketingPlan(businessDesc);
    if (suggestions && suggestions.length > 0) {
      const targetLane = lanes[0];
      const newItems = suggestions.map((s: any) => ({ id: crypto.randomUUID(), title: s.title, budget: s.budget, content: '' }));
      setLanes(prev => prev.map(lane => { if (lane.id === targetLane.id) return { ...lane, items: [...lane.items, ...newItems] }; return lane; }));
      for (const item of newItems) { await supabase.from('plan_items').insert({ id: item.id, section_id: targetLane.id, custom_notes: item.title, allocated_budget: item.budget }); }
    }
    setIsGenerating(false); setIsAIModalOpen(false); setBusinessDesc('');
  }

  function openAddModal(laneId: string) { setTargetLaneId(laneId); setTacticName(''); setTacticBudget(0); setTacticContent(''); setIsAddModalOpen(true); }
  function openEditModal(tactic: Tactic) { setEditingTactic(tactic); setTacticName(tactic.title); setTacticBudget(tactic.budget); setTacticContent(tactic.content || ''); setIsEditModalOpen(true); }
  async function submitAddTactic(e: React.FormEvent) { e.preventDefault(); if (!targetLaneId || !tacticName.trim()) return; const newId = crypto.randomUUID(); const newTactic: Tactic = { id: newId, title: tacticName, budget: tacticBudget, content: '' }; setLanes(prev => prev.map(lane => { if (lane.id === targetLaneId) return { ...lane, items: [...lane.items, newTactic] }; return lane; })); await supabase.from('plan_items').insert({ id: newId, section_id: targetLaneId, custom_notes: tacticName, allocated_budget: tacticBudget }); setIsAddModalOpen(false); }
  async function submitEditTactic(e: React.FormEvent) { e.preventDefault(); if (!editingTactic || !tacticName.trim()) return; setLanes(prev => prev.map(lane => ({ ...lane, items: lane.items.map(item => item.id === editingTactic.id ? { ...item, title: tacticName, budget: tacticBudget, content: tacticContent } : item) }))); await supabase.from('plan_items').update({ custom_notes: tacticName, allocated_budget: tacticBudget, content: tacticContent }).eq('id', editingTactic.id); setIsEditModalOpen(false); }
  async function deleteTactic(tacticId: string) { if (!confirm('Delete this card?')) return; setLanes(prev => prev.map(lane => ({ ...lane, items: lane.items.filter(item => item.id !== tacticId) }))); await supabase.from('plan_items').delete().eq('id', tacticId); }
  async function saveMove(tacticId: string, newSectionId: string) { await supabase.from('plan_items').update({ section_id: newSectionId }).eq('id', tacticId); }
  
  // --- DRAG HANDLERS ---
  function handleDragStart(event: DragStartEvent) { 
      const { active } = event;
      setActiveId(active.id as string);
      
      // Find the actual data object so we can render the overlay
      const tactic = lanes.flatMap(l => l.items).find(i => i.id === active.id);
      if (tactic) setActiveTactic(tactic);
  }

  function handleDragEnd(event: DragEndEvent) { 
      const { active, over } = event; 
      setActiveId(null); 
      setActiveTactic(null); // Clear the overlay data

      if (!over) return; 
      
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
                  if (lane.id === destLane.id) return { ...lane, items: [...lane.items, activeItem] }; 
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

  const dropAnimation: DropAnimation = {
    sideEffects: defaultDropAnimationSideEffects({
      styles: {
        active: {
          opacity: '0.4',
        },
      },
    }),
  };

  return (
    <div className="flex flex-col h-full bg-slate-200">
      {/* --- COMMAND STRIP --- */}
      <div className="flex-shrink-0 px-8 py-4 bg-slate-900 border-b border-black flex justify-between items-center z-20 shadow-md">
         <div className="flex items-center gap-12">
            <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 opacity-70">Total Forecast</span>
                <div className="flex items-center gap-2 text-white">
                    <span className="text-3xl font-black tracking-tighter">${totalBudget.toLocaleString()}</span>
                </div>
            </div>
            <div className="w-px h-10 bg-slate-700"></div>
            <div>
                <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 opacity-70">Active Cards</span>
                <div className="flex items-center gap-2 text-white">
                    <span className="text-3xl font-black tracking-tighter">{totalTactics}</span>
                </div>
            </div>
         </div>

         <div className="flex gap-4">
             <button onClick={downloadPDF} disabled={isDownloading} className="flex items-center gap-2 bg-white text-slate-900 px-4 py-2 rounded-lg shadow-sm hover:bg-slate-200 transition-all font-bold text-xs uppercase tracking-wide">
               {isDownloading ? <Loader2 className="animate-spin" size={14}/> : <Download size={14} />}
               <span>Export PDF</span>
             </button>
             <button onClick={() => setIsAIModalOpen(true)} className="flex items-center gap-2 bg-indigo-600 text-white px-6 py-2.5 rounded-lg shadow-lg hover:bg-indigo-500 hover:shadow-indigo-500/20 hover:-translate-y-0.5 transition-all font-bold text-xs uppercase tracking-widest">
               <Sparkles size={14} /> AI Strategist
             </button>
         </div>
      </div>

      {/* --- BOARD AREA --- */}
      <DndContext 
        id="goaline-board" 
        sensors={sensors} 
        onDragStart={handleDragStart} 
        onDragEnd={handleDragEnd}
      >
        <div className="flex-1 flex gap-8 overflow-x-auto px-8 py-8 items-start w-full bg-slate-200">
            {lanes.map((lane) => (
                <PlanLane key={lane.id} lane={lane} onAdd={openAddModal} onDelete={deleteTactic} onEdit={openEditModal} />
            ))}
        </div>

        {/* --- THE DRAG OVERLAY (Floating Ghost) --- */}
        <DragOverlay dropAnimation={dropAnimation}>
            {activeTactic ? (
                <TacticCard tactic={activeTactic} isOverlay />
            ) : null}
        </DragOverlay>

      </DndContext>

      {/* --- MODALS (Same as before) --- */}
      {(isAddModalOpen || isEditModalOpen) && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="px-6 py-5 bg-slate-900 flex justify-between items-center">
              <h3 className="text-sm font-black text-white uppercase tracking-widest">{isEditModalOpen ? 'Edit Tactic' : 'New Growth Tactic'}</h3>
              <button onClick={() => { setIsAddModalOpen(false); setIsEditModalOpen(false); }} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            
            <div className="p-8 max-h-[70vh] overflow-y-auto">
                <form onSubmit={isEditModalOpen ? submitEditTactic : submitAddTactic} className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Title</label>
                        <input autoFocus type="text" required className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none" value={tacticName} onChange={(e) => setTacticName(e.target.value)} />
                    </div>
                    <div>
                        <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-2">Budget</label>
                        <input type="number" min="0" className="w-full bg-slate-50 border border-slate-200 rounded-lg px-4 py-3 text-sm font-mono font-bold text-slate-900 focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none" value={tacticBudget} onChange={(e) => setTacticBudget(Number(e.target.value))} />
                    </div>
                </div>

                {isEditModalOpen && (
                    <div className="pt-6 border-t border-slate-100">
                        <div className="flex justify-between items-center mb-4">
                            <label className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">AI Content</label>
                            <button type="button" onClick={handleAutoWrite} disabled={isWriting} className="text-[10px] bg-slate-100 text-slate-700 px-4 py-2 rounded-full font-bold uppercase tracking-wide hover:bg-slate-200 flex items-center gap-2 transition-all">
                                {isWriting ? <Loader2 className="animate-spin" size={12}/> : <Sparkles size={12} />}
                                {isWriting ? 'WRITING...' : 'AUTO-WRITE'}
                            </button>
                        </div>
                        <textarea className="w-full h-48 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm leading-relaxed text-slate-700 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none resize-none font-medium" value={tacticContent} onChange={(e) => setTacticContent(e.target.value)} />
                    </div>
                )}
                </form>
            </div>
            <div className="px-6 py-5 bg-slate-50 border-t border-slate-100 flex justify-end gap-3">
                <button onClick={isEditModalOpen ? submitEditTactic : submitAddTactic} className="w-full py-3 bg-slate-900 text-white hover:bg-black rounded-xl shadow-lg font-bold text-xs uppercase tracking-widest transition-all">Save Changes</button>
            </div>
          </div>
        </div>
      )}

      {/* AI GENERATE MODAL */}
      {isAIModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
             <div className="px-6 py-5 bg-slate-900 flex justify-between items-center">
              <div className="flex items-center gap-3">
                  <Sparkles size={18} className="text-indigo-400" />
                  <h3 className="text-sm font-black text-white uppercase tracking-widest">AI Strategist</h3>
              </div>
              <button onClick={() => setIsAIModalOpen(false)} className="text-slate-400 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-8">
                <p className="text-slate-500 text-sm font-medium mb-6">Describe your business. I will build your Q1 roadmap.</p>
                <form onSubmit={handleAIGenerate}>
                    <textarea autoFocus required className="w-full h-32 bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm font-bold text-slate-800 focus:bg-white focus:ring-2 focus:ring-slate-900 focus:border-transparent transition-all outline-none resize-none mb-6" value={businessDesc} onChange={(e) => setBusinessDesc(e.target.value)} />
                    <button type="submit" disabled={isGenerating} className="w-full py-3 bg-indigo-600 text-white rounded-xl shadow-lg hover:bg-indigo-500 font-bold text-xs uppercase tracking-widest transition-all flex justify-center items-center gap-2">
                        {isGenerating ? <><Loader2 className="animate-spin" size={14}/> THINKING...</> : 'GENERATE STRATEGY'}
                    </button>
                </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}