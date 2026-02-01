'use client';
import React from 'react';
import { X, Target, DollarSign, ArrowRight, BadgeCheck, MapPin, Users, Briefcase, Mail, PenTool, Share2, Box } from 'lucide-react';
import { Tool, Agency } from '@/types';

// Helper for icons (keep it local here)
function getToolIcon(name: string, size: number = 24) {
  const n = name.toLowerCase();
  if (n.includes('hubspot') || n.includes('crm')) return <Briefcase size={size} className="text-orange-500" />;
  if (n.includes('mail') || n.includes('send')) return <Mail size={size} className="text-yellow-500" />;
  if (n.includes('canva') || n.includes('design')) return <PenTool size={size} className="text-blue-500" />;
  if (n.includes('buffer') || n.includes('social')) return <Share2 size={size} className="text-indigo-500" />;
  return <Box size={size} className="text-slate-400" />;
}

export function ToolModal({ tool, onClose }: { tool: Tool | null, onClose: () => void }) {
  if (!tool) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
       <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6">
             <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
                      {getToolIcon(tool.name)}
                   </div>
                   <div>
                      <h3 className="text-lg font-black text-slate-900">{tool.name}</h3>
                      <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500">Self-Service Tool</span>
                   </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"><X size={20} /></button>
             </div>
             <div className="space-y-4 mb-6">
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{tool.description}</p>
                {tool.value_prop && (
                  <div className="p-3 bg-indigo-50/50 border border-indigo-100 rounded-lg">
                      <div className="flex items-center gap-2 mb-1">
                         <Target size={12} className="text-indigo-600" />
                         <span className="text-[10px] font-black text-indigo-600 uppercase tracking-widest">Why Use It</span>
                      </div>
                      <p className="text-xs text-indigo-900 leading-relaxed">{tool.value_prop}</p>
                   </div>
                )}
                {tool.pricing && (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="bg-white p-1.5 rounded-full shadow-sm">
                         <DollarSign size={14} className="text-emerald-600" />
                      </div>
                      <div>
                         <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing</span>
                         <p className="text-xs font-bold text-slate-700">{tool.pricing}</p>
                      </div>
                   </div>
                )}
             </div>
             <a href={tool.affiliate_link} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl shadow-lg shadow-indigo-200 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer">
                <span>Visit {tool.name}</span>
                <ArrowRight size={14} />
             </a>
          </div>
       </div>
    </div>
  );
}

export function AgencyModal({ agency, onClose }: { agency: Agency | null, onClose: () => void }) {
  if (!agency) return null;
  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
       <div className="bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden border border-purple-100 animate-in fade-in zoom-in-95 duration-200">
          <div className="p-6">
             <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-4">
                   <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
                      <BadgeCheck size={24} className="text-purple-600" />
                   </div>
                   <div>
                      <h3 className="text-lg font-black text-slate-900">{agency.name}</h3>
                      <div className="flex items-center gap-2 mt-1">
                         <span className="inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-purple-100 text-purple-700">Verified Partner</span>
                         <span className="flex items-center gap-1 text-[10px] font-bold text-slate-400"><MapPin size={10} /> {agency.location}</span>
                      </div>
                   </div>
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"><X size={20} /></button>
             </div>
             <div className="space-y-4 mb-6">
                <p className="text-sm text-slate-600 leading-relaxed font-medium">{agency.description}</p>
                <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-100 rounded-lg">
                      <div className="bg-white p-1.5 rounded-full shadow-sm">
                         <Users size={14} className="text-purple-600" />
                      </div>
                      <div>
                         <span className="block text-[10px] font-bold text-slate-400 uppercase tracking-widest">Pricing Model</span>
                         <p className="text-xs font-bold text-slate-700">{agency.pricing_model}</p>
                      </div>
                 </div>
             </div>
             <a href={agency.website_link} target="_blank" rel="noopener noreferrer" className="w-full py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-xl shadow-lg shadow-purple-200 font-bold text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 cursor-pointer">
                <span>Contact Partner</span>
                <ArrowRight size={14} />
             </a>
          </div>
       </div>
    </div>
  );
}