'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { PieChart, Megaphone, Zap, Heart, Layers, Plus, Info } from 'lucide-react';
import { Lane, Tactic, Tool, Agency } from '@/types';
import { SortableTacticCard } from './TacticCard'; // Importing the card we made in Step 2

// --- LOCAL HELPERS ---
function getLaneIcon(title: string) {
  const t = title.toLowerCase();
  if (t.includes('awareness')) return <Megaphone size={18} className="text-blue-500" />;
  if (t.includes('consideration') || t.includes('conversion')) return <Zap size={18} className="text-amber-500" fill="currentColor" fillOpacity={0.2} />;
  if (t.includes('retention') || t.includes('decision')) return <Heart size={18} className="text-rose-500" fill="currentColor" fillOpacity={0.2} />;
  return <Layers size={18} className="text-slate-400" />;
}

// --- MAIN COMPONENT ---
export function PlanLane({ 
  lane, 
  tools, 
  agencies, 
  onAdd, 
  onDelete, 
  onEdit, 
  onUpdateBudget, 
  onOpenTool, 
  onOpenAgency, 
  onOpenLaneInfo 
}: {
  lane: Lane;
  tools: Tool[];
  agencies: Agency[];
  onAdd: (laneId: string) => void;
  onDelete: (id: string) => void;
  onEdit: (tactic: Tactic) => void;
  onUpdateBudget: (id: string, budget: number) => void;
  onOpenTool: (tool: Tool) => void;
  onOpenAgency: (agency: Agency) => void;
  onOpenLaneInfo: (title: string) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: lane.id });
  const laneTotal = lane.items.reduce((sum, item) => sum + item.budget, 0);

  // Generate a safe ID for the Tour Guide to target
  const laneId = `lane-${lane.title.toLowerCase().split(' ')[0]}`;

  return (
    <div ref={setNodeRef} id={laneId} className="w-full md:flex-1 md:min-w-[350px] flex flex-col h-auto md:h-full transition-all duration-200">
      <div className={`flex flex-col h-full bg-white rounded-2xl shadow-xl md:shadow-2xl overflow-hidden border transition-all duration-200
          ${isOver ? 'border-indigo-500 ring-4 ring-indigo-500/10 bg-indigo-50/30' : 'border-slate-100'} 
      `}>
          {/* Header Section */}
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
          
          {/* Draggable Items Area */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar min-h-[200px] md:min-h-0">
            <SortableContext items={lane.items.map((i: Tactic) => i.id)} strategy={verticalListSortingStrategy}>
              <div className="flex flex-col pb-2">
                {lane.items.length === 0 && (
                    <div className="h-40 flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl">
                        <PieChart className="text-slate-300 mb-2" size={24} />
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wide">Empty Stage</p>
                    </div>
                )}
                {lane.items.map((tactic) => (
                    <SortableTacticCard 
                        key={tactic.id} 
                        tactic={tactic} 
                        tools={tools} 
                        agencies={agencies} 
                        onDelete={onDelete} 
                        onEdit={onEdit} 
                        onUpdateBudget={onUpdateBudget} 
                        onOpenTool={onOpenTool} 
                        onOpenAgency={onOpenAgency} 
                    />
                ))}
              </div>
            </SortableContext>
          </div>
      </div>
    </div>
  );
}