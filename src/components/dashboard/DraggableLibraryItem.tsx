'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Plus } from 'lucide-react';
import { LibraryTactic } from '@/types';

export function DraggableLibraryItem({ lib, onAdd }: { lib: LibraryTactic, onAdd: (l: LibraryTactic) => void }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ 
    id: `lib-${lib.id}`, 
    data: { type: 'library', item: lib } 
  });

  return (
    <div 
      ref={setNodeRef} 
      {...listeners} 
      {...attributes} 
      className={`p-4 bg-white border border-slate-200 rounded-xl shadow-sm hover:border-indigo-400 transition-all group cursor-grab active:cursor-grabbing ${isDragging ? 'opacity-30' : ''}`}
    >
       <div className="flex justify-between items-start mb-2">
          <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest px-1.5 py-0.5 bg-indigo-50 rounded text-indigo-700">{lib.category}</span>
          <button 
            onPointerDown={(e) => e.stopPropagation()} 
            onClick={() => onAdd(lib)} 
            className="md:opacity-0 group-hover:opacity-100 p-1.5 bg-indigo-50 text-indigo-600 rounded hover:bg-indigo-600 hover:text-white transition-all cursor-pointer"
          >
            <Plus size={14} strokeWidth={3} />
          </button>
       </div>
       <h4 className="font-bold text-slate-900 text-sm mb-1">{lib.title}</h4>
       <p className="text-xs text-slate-500 leading-relaxed mb-3 line-clamp-2">{lib.description}</p>
       <div className="text-[10px] font-bold text-slate-400 font-mono">${lib.default_budget.toLocaleString()}</div>
    </div>
  );
}