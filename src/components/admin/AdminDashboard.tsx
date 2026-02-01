'use client';

import React, { useState, useEffect } from 'react';
import { 
  LayoutDashboard, PenTool, Users, FileText, Settings, 
  Plus, Search, Edit2, Trash2, ExternalLink, Loader2, BadgeCheck, MapPin, Clock, Activity
} from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

// MODALS
import { AdminToolModal } from './modals/AdminToolModal';
import { AdminAgencyModal } from './modals/AdminAgencyModal';
import { AdminTacticModal } from './modals/AdminTacticModal';

// TABS
import AdminApprovalsTab from './tabs/AdminApprovalsTab';
import AdminInsightsTab from './tabs/AdminInsightsTab';

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
  logo_url?: string;
}

interface Agency {
  id: string;
  name: string;
  description: string;
  website_link: string;
  location: string;
  pricing_model: string;
  is_verified: boolean;
  logo_url?: string;
  category?: string;
}

interface Tactic {
    id: string;
    title: string;
    description: string;
    category: string;
    default_budget: number;
}

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('overview');
  const [loading, setLoading] = useState(false);
  
  // Data State
  const [tools, setTools] = useState<Tool[]>([]);
  const [agencies, setAgencies] = useState<Agency[]>([]);
  const [tactics, setTactics] = useState<Tactic[]>([]);
  
  // Stats State
  const [stats, setStats] = useState({ tools: 0, agencies: 0, tactics: 0, approvals: 0 });
  
  // Modal State
  const [isToolModalOpen, setIsToolModalOpen] = useState(false);
  const [isAgencyModalOpen, setIsAgencyModalOpen] = useState(false);
  const [isTacticModalOpen, setIsTacticModalOpen] = useState(false);
  
  const [editingItem, setEditingItem] = useState<any | null>(null);

  // FETCH DATA
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  async function fetchData() {
    setLoading(true);
    if (activeTab === 'tools') {
        const { data } = await supabase.from('tools').select('*').order('name');
        if (data) setTools(data);
    } else if (activeTab === 'agencies') {
        const { data } = await supabase.from('agencies').select('*').order('name');
        if (data) setAgencies(data);
    } else if (activeTab === 'tactics') {
        const { data } = await supabase.from('tactics_library').select('*').order('title');
        if (data) setTactics(data);
    } 
    
    // Always fetch stats for the overview/sidebar counters
    const { count: toolCount } = await supabase.from('tools').select('*', { count: 'exact', head: true });
    const { count: agencyCount } = await supabase.from('agencies').select('*', { count: 'exact', head: true });
    const { count: tacticCount } = await supabase.from('tactics_library').select('*', { count: 'exact', head: true });
    
    // Count pending approvals from all tables
    const { count: pendingTools } = await supabase.from('tools').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: pendingAgencies } = await supabase.from('agencies').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    const { count: pendingTactics } = await supabase.from('tactics_library').select('*', { count: 'exact', head: true }).eq('status', 'pending');
    
    setStats({
        tools: toolCount || 0,
        agencies: agencyCount || 0,
        tactics: tacticCount || 0,
        approvals: (pendingTools || 0) + (pendingAgencies || 0) + (pendingTactics || 0)
    });

    setLoading(false);
  }

  // --- HANDLERS ---
  async function handleSaveItem(data: any) {
    let table = '';
    let modalSetter: any = null;

    if (activeTab === 'tools') { table = 'tools'; modalSetter = setIsToolModalOpen; }
    else if (activeTab === 'agencies') { table = 'agencies'; modalSetter = setIsAgencyModalOpen; }
    else if (activeTab === 'tactics') { table = 'tactics_library'; modalSetter = setIsTacticModalOpen; }

    if (!table) return;

    if (editingItem) {
        await supabase.from(table).update(data).eq('id', editingItem.id);
    } else {
        await supabase.from(table).insert(data);
    }
    
    modalSetter(false);
    setEditingItem(null);
    fetchData();
  }

  async function handleDeleteItem(id: string) {
    let table = '';
    if (activeTab === 'tools') table = 'tools';
    else if (activeTab === 'agencies') table = 'agencies';
    else if (activeTab === 'tactics') table = 'tactics_library';

    if (confirm('Are you sure you want to delete this item?')) {
        await supabase.from(table).delete().eq('id', id);
        fetchData();
    }
  }

  // --- MODAL TRIGGERS ---
  function openCreateModal() {
    setEditingItem(null);
    if (activeTab === 'tools') setIsToolModalOpen(true);
    if (activeTab === 'agencies') setIsAgencyModalOpen(true);
    if (activeTab === 'tactics') setIsTacticModalOpen(true);
  }

  function openEditModal(item: any) {
    setEditingItem(item);
    if (activeTab === 'tools') setIsToolModalOpen(true);
    if (activeTab === 'agencies') setIsAgencyModalOpen(true);
    if (activeTab === 'tactics') setIsTacticModalOpen(true);
  }

  function getButtonColor() {
      if (activeTab === 'agencies') return 'bg-purple-600 hover:bg-purple-700 shadow-purple-200';
      if (activeTab === 'tactics') return 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-200';
      return 'bg-indigo-600 hover:bg-indigo-700 shadow-indigo-200';
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
          <NavButton icon={<Activity size={18} />} label="Insights" active={activeTab === 'insights'} onClick={() => setActiveTab('insights')} />
          <NavButton icon={<Clock size={18} />} label="Approvals" active={activeTab === 'approvals'} onClick={() => setActiveTab('approvals')} badge={stats.approvals} />
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
                {activeTab === 'overview' ? 'Overview' : 
                 activeTab === 'tools' ? 'Tools & Affiliates' : 
                 activeTab === 'tactics' ? 'Tactics Library' : 
                 activeTab === 'approvals' ? 'Submission Approvals' :
                 activeTab === 'insights' ? 'Intelligence Engine' :
                 activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}
            </h2>
            
            {activeTab !== 'overview' && activeTab !== 'settings' && activeTab !== 'approvals' && activeTab !== 'insights' && (
                <button onClick={openCreateModal} className={`flex items-center gap-2 text-white px-5 py-2.5 rounded-lg font-bold text-xs uppercase tracking-widest transition-all shadow-lg cursor-pointer ${getButtonColor()}`}>
                    <Plus size={16} /> Add Item
                </button>
            )}
        </header>

        <div className="p-8">
            {/* --- INSIGHTS TAB (NEW) --- */}
            {activeTab === 'insights' && <AdminInsightsTab />}

            {/* --- APPROVALS TAB --- */}
            {activeTab === 'approvals' && <AdminApprovalsTab />}

            {/* --- OVERVIEW TAB --- */}
            {activeTab === 'overview' && (
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                    <StatCard label="Total Tools" value={stats.tools} icon={<PenTool size={24} className="text-indigo-500"/>} onClick={() => setActiveTab('tools')} />
                    <StatCard label="Total Agencies" value={stats.agencies} icon={<Users size={24} className="text-purple-500"/>} onClick={() => setActiveTab('agencies')} />
                    <StatCard label="Library Tactics" value={stats.tactics} icon={<FileText size={24} className="text-emerald-500"/>} onClick={() => setActiveTab('tactics')} />
                    <StatCard label="Pending Approvals" value={stats.approvals} icon={<Clock size={24} className="text-orange-500"/>} onClick={() => setActiveTab('approvals')} highlight={stats.approvals > 0} />
                </div>
            )}

            {/* --- TOOLS TAB --- */}
            {activeTab === 'tools' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex gap-4"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 text-slate-400" size={16} /><input type="text" placeholder="Search tools..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-indigo-500 outline-none" /></div></div>
                    {loading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div> : (
                        <table className="w-full text-left border-collapse">
                            <thead><tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100"><th className="px-6 py-4">Logo</th><th className="px-6 py-4">Name</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Pricing</th><th className="px-6 py-4">Affiliate</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
                            <tbody className="text-sm font-medium text-slate-700">
                                {tools.map(tool => (
                                    <tr key={tool.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            {tool.logo_url ? <img src={tool.logo_url} alt="logo" className="w-8 h-8 rounded-lg object-contain border border-slate-200 bg-white" /> : <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-300"><PenTool size={14}/></div>}
                                        </td>
                                        <td className="px-6 py-4 font-bold text-slate-900">{tool.name}</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">{tool.category || 'General'}</span></td>
                                        <td className="px-6 py-4 text-slate-500">{tool.pricing}</td>
                                        <td className="px-6 py-4">{tool.affiliate_link ? <a href={tool.affiliate_link} target="_blank" className="flex items-center gap-1 text-indigo-600 hover:underline text-xs font-bold">Link <ExternalLink size={10} /></a> : <span className="text-slate-300 text-xs">No Link</span>}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openEditModal(tool)} className="p-2 text-slate-400 hover:text-indigo-600 transition-colors cursor-pointer"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDeleteItem(tool.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* --- AGENCIES TAB --- */}
            {activeTab === 'agencies' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex gap-4"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 text-slate-400" size={16} /><input type="text" placeholder="Search agencies..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-purple-500 outline-none" /></div></div>
                    {loading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div> : (
                        <table className="w-full text-left border-collapse">
                            <thead><tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100"><th className="px-6 py-4">Logo</th><th className="px-6 py-4">Agency</th><th className="px-6 py-4">Category</th><th className="px-6 py-4">Location</th><th className="px-6 py-4">Status</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
                            <tbody className="text-sm font-medium text-slate-700">
                                {agencies.map(agency => (
                                    <tr key={agency.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4">
                                            {agency.logo_url ? <img src={agency.logo_url} alt="logo" className="w-8 h-8 rounded-lg object-contain border border-slate-200 bg-white" /> : <div className="w-8 h-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-300"><Users size={14}/></div>}
                                        </td>
                                        <td className="px-6 py-4"><div className="font-bold text-slate-900">{agency.name}</div><a href={agency.website_link} target="_blank" className="text-xs text-slate-400 hover:text-purple-600 transition-colors">{agency.website_link}</a></td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">{agency.category || 'General'}</span></td>
                                        <td className="px-6 py-4 text-slate-600 flex items-center gap-1"><MapPin size={12}/> {agency.location}</td>
                                        <td className="px-6 py-4">{agency.is_verified ? <span className="flex items-center gap-1 text-[10px] font-bold text-purple-700 bg-purple-100 px-2 py-1 rounded w-fit"><BadgeCheck size={12}/> VERIFIED</span> : <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-1 rounded w-fit">PENDING</span>}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openEditModal(agency)} className="p-2 text-slate-400 hover:text-purple-600 transition-colors cursor-pointer"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDeleteItem(agency.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
            
            {/* --- TACTICS TAB --- */}
            {activeTab === 'tactics' && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="p-4 border-b border-slate-100 flex gap-4"><div className="relative flex-1"><Search className="absolute left-3 top-2.5 text-slate-400" size={16} /><input type="text" placeholder="Search tactics..." className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium focus:ring-2 focus:ring-emerald-500 outline-none" /></div></div>
                    {loading ? <div className="p-12 flex justify-center"><Loader2 className="animate-spin text-slate-400" /></div> : (
                        <table className="w-full text-left border-collapse">
                            <thead><tr className="bg-slate-50 text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-100"><th className="px-6 py-4">Title</th><th className="px-6 py-4">Phase</th><th className="px-6 py-4">Avg Budget</th><th className="px-6 py-4 text-right">Actions</th></tr></thead>
                            <tbody className="text-sm font-medium text-slate-700">
                                {tactics.map(tactic => (
                                    <tr key={tactic.id} className="border-b border-slate-50 hover:bg-slate-50/50 transition-colors">
                                        <td className="px-6 py-4 font-bold text-slate-900">{tactic.title}</td>
                                        <td className="px-6 py-4"><span className="px-2 py-1 bg-slate-100 rounded text-xs font-bold text-slate-600">{tactic.category}</span></td>
                                        <td className="px-6 py-4 text-slate-500 font-mono">${tactic.default_budget.toLocaleString()}</td>
                                        <td className="px-6 py-4 text-right">
                                            <button onClick={() => openEditModal(tactic)} className="p-2 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"><Edit2 size={16} /></button>
                                            <button onClick={() => handleDeleteItem(tactic.id)} className="p-2 text-slate-400 hover:text-red-600 transition-colors cursor-pointer"><Trash2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}
        </div>
      </main>

      {/* MODALS */}
      <AdminToolModal isOpen={isToolModalOpen} onClose={() => setIsToolModalOpen(false)} onSave={handleSaveItem} initialData={editingItem} />
      <AdminAgencyModal isOpen={isAgencyModalOpen} onClose={() => setIsAgencyModalOpen(false)} onSave={handleSaveItem} initialData={editingItem} />
      <AdminTacticModal isOpen={isTacticModalOpen} onClose={() => setIsTacticModalOpen(false)} onSave={handleSaveItem} initialData={editingItem} />

    </div>
  );
}

// Sub-components
function NavButton({ icon, label, active, onClick, badge }: any) {
    return (
        <button onClick={onClick} className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${active ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/50' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
            <div className="flex items-center gap-3">{icon} {label}</div>
            {badge > 0 && <span className="bg-orange-500 text-white px-1.5 py-0.5 rounded-full text-[10px]">{badge}</span>}
        </button>
    )
}

function StatCard({ label, value, icon, onClick, highlight }: any) {
    return (
        <div onClick={onClick} className={`bg-white p-6 rounded-xl border shadow-sm flex items-center justify-between cursor-pointer transition-all hover:shadow-md ${highlight ? 'border-orange-200 bg-orange-50/50' : 'border-slate-200 hover:border-indigo-300'}`}>
            <div>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{label}</p>
                <p className={`text-3xl font-black ${highlight ? 'text-orange-600' : 'text-slate-900'}`}>{value}</p>
            </div>
            <div className={`w-12 h-12 rounded-full flex items-center justify-center ${highlight ? 'bg-orange-100' : 'bg-slate-50'}`}>{icon}</div>
        </div>
    )
}