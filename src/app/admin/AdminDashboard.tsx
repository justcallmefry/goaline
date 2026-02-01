'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, PenTool, Users, FileText, Settings, 
  Plus, Search, Edit2, Trash2, ExternalLink, Loader2 
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';
import { AdminToolModal } from './modals/AdminToolModal';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// --- TYPES ---
interface Tool {
  id: string;
  name: string;
  description: string;
  affiliate_link: string;
  category: string;
  pricing: string;
  value_prop: string;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('tools');
  const [tools, setTools] = useState<Tool[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Modal State
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [editingTool, setEditingTool] = useState<Tool | null>(null);

  // FETCH DATA
  useEffect(() => {
    fetchTools();
  }, []);

  async function fetchTools() {
    setLoading(true);
    const { data } = await supabase.from('tools').select('*').order('name');
    if (data) setTools(data);
    setLoading(false);
  }

  // HANDLERS
  async function handleSaveTool(toolData: any) {
    if (editingTool) {
      await supabase.from('tools').update(toolData).eq('id', editingTool.id);
    } else {
      await supabase.from('tools').insert(toolData);
    }
    setIsToolModalOpen(false);
    setEditingTool(null);
    fetchTools();
  }

  async function handleDeleteTool(id: string) {
    if (confirm('Are you sure you want to delete this tool?')) {
      await supabase.from('tools').delete().eq('id', id);
      fetchTools();
    }
  }

  function openEditModal(tool: Tool) {
    setEditingTool(tool);
    setIsToolModalOpen(true);
  }

  function openCreateModal() {
    setEditingTool(null);
    setIsToolModalOpen(true);
  }

  return (
    <div className="flex h-screen bg-slate-100 font-sans text-slate-900">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6">
          <h1 className="text-xl font-black uppercase tracking-widest text-indigo-500">GL Admin</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Control Center</p>
        </div>
        
        <nav className="flex-1 px-4 space-y-2">
          <NavButton icon={<LayoutDashboard size={18} />} label="Overview" active={activeTab === 'overview'} onClick={() => setActiveTab('overview')} />
          <NavButton icon={<PenTool size={18} />} label="Tools & Affiliates" active={activeTab === 'tools'} onClick={() => setActiveTab('tools')} />
          <NavButton icon={<Users size={18} />} label="Agencies" active={activeTab === 'agencies'} onClick={() => setActiveTab('agencies')} />
          <NavButton icon={<FileText size={18} />} label="Tactics Library" active={activeTab === 'tactics'} onClick={() => setActiveTab('tactics')} />
          <NavButton icon={<Settings size={18} />} label="Settings" active={activeTab === 'settings'} onClick={() => setActiveTab('settings')} />
        </nav>

        <div className="p-6 border-t border-slate-800">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs">AD</div>
                <div>
                    <div className="text-xs font-bold text-white">Admin User</div>
                    <div className="text-[10px] text-slate-500">Super Admin</div>
                </div>
            </div>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 px-8 py-5 flex justify-between items-center sticky top-0 z-10">
            <h2 className="text-2xl font-black text-slate-800">
                {activeTab === 'tools' ? 'Tools & Affiliates' : activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            {activeTab === 'tools' && (
                <button onClick={openCreateModal} className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-lg shadow-indigo-200 cursor-pointer">
                    <Plus size={16} /> Add Tool
                </button>
            )}
        </header>

        <div className="p-8">
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <StatCard label="Total Tools" value={tools.length} icon={<PenTool size={24} className="text-indigo-500"/>} />
                    <StatCard label="Pending Agencies" value="0" icon={<Users size={24} className="text-purple-500"/>} />
                    <StatCard label="New Tactics" value="0" icon={<FileText size={24} className="text-emerald-500"/>} />
                </div>
            )}

            {activeTab === 'tools' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    {/* Table Header */}
                    <div className="p-4 border-b border-slate-100 flex gap-4">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
                            <input type="text" placeholder="Search tools..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" />
                        </div>
                    </div>

                    {/* Table */}
                    {loading ? (
                        <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div>
                    ) : (
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100">
                                    <th className="px-6 py-4">Name</th>
                                    <th className="px-6 py-4">Category</th>
                                    <th className="px-6 py-4">Pricing</th>
                                    <th className="px-6 py-4">Affiliate Link</th>
                                    <th className="px-6 py-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm font-medium text-slate-700">
                                {tools.map(tool => (
                                    <tr key={tool.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">{tool.name}</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">{tool.category}</span></td>
                                        <td className="px-6 py-4 text-slate-500">{tool.pricing}</td>
                                        <td className="px-6 py-4">
                                            {tool.affiliate_link ? (
                                                <a href={tool.affiliate_link} target="_blank" className="flex items-center gap-1 text-indigo-600 hover:underline text-xs font-bold">
                                                    Link <ExternalLink size={10} />
                                                </a>
                                            ) : <span className="text-slate-300 text-xs">No Link</span>}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openEditModal(tool)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDeleteTool(tool.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
            
            {/* PLACEHOLDERS FOR OTHER TABS */}
            {(activeTab === 'agencies' || activeTab === 'tactics') && (
                <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                    <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
                        <Settings size={32} />
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">Coming Soon</h3>
                    <p className="text-slate-500 text-sm">This module is under construction.</p>
                </div>
            )}
        </div>
      </main>

      {/* MODAL IMPORT */}
      <AdminToolModal 
        isOpen={isToolModalOpen}
        onClose={() => setIsToolModalOpen(false)}
        onSave={handleSaveTool}
        initialData={editingTool}
      />

    </div>
  );
}

// Sub-components for cleanliness
function NavButton({ icon, label, active, onClick }: any) {
    return (
        <button onClick={onClick} className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            {icon} {label}
        </button>
    )
}

function StatCard({ label, value, icon }: any) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-center justify-between">
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-3xl font-black text-slate-900">{value}</p>
            </div>
            <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center">{icon}</div>
        </div>
    )
}