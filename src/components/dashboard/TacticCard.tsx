'use client';

import React, { useMemo } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, Trash2, CheckCircle2, Info, BadgeCheck, Briefcase, Mail, PenTool, Share2, Box } from 'lucide-react';
import { Tactic, Tool, Agency } from '@/types'; // Importing from our new types file

// --- HELPERS (Moved local helpers here if only used by cards) ---
function getToolIcon(name: string, size: number = 14) {
  const n = name.toLowerCase();
  if (n.includes('hubspot') || n.includes('crm')) return <Briefcase size={size} className="text-orange-500" />;
  if (n.includes('mail') || n.includes('send')) return <Mail size={size} className="text-yellow-500" />;
  if (n.includes('canva') || n.includes('design')) return <PenTool size={size} className="text-blue-500" />;
  if (n.includes('buffer') || n.includes('social')) return <Share2 size={size} className="text-indigo-500" />;
  return <Box size={size} className="text-slate-400" />;
}

// --- MAIN COMPONENT ---
export function TacticCard({ 
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
  
  const matchingTools = useMemo(() => {
    if (!tools || !tactic.title) return [];
    const allMatches = tools.filter(tool => 
      tool.tags && tool.tags.some(tag => tactic.title.toLowerCase().includes(tag.toLowerCase()))
    );
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

// --- SORTABLE WRAPPER ---
export function SortableTacticCard(props: any) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: props.tactic.id });
    const style = { transform: CSS.Translate.toString(transform), transition };
    return (
        <div ref={setNodeRef} style={style}>
            <TacticCard 
                {...props}
                isDragging={isDragging} 
                dragHandleProps={{...attributes, ...listeners}} 
            />
        </div>
    );
}