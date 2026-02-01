'use client';

import React, { useState, useEffect } from 'react';
import { Check, X, Clock, User, AlertCircle } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminApprovalsTab() {
  const [pendingItems, setPendingItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPendingItems();
  }, []);

  async function fetchPendingItems() {
    setLoading(true);
    // Fetch from all 3 tables
    const { data: tools } = await supabase.from('tools').select('*, type:category').eq('status', 'pending');
    const { data: agencies } = await supabase.from('agencies').select('*').eq('status', 'pending');
    const { data: tactics } = await supabase.from('tactics_library').select('*').eq('status', 'pending');

    // Normalize data for the UI
    const formattedTools = (tools || []).map(i => ({ ...i, itemType: 'Tool', displayTitle: i.name }));
    const formattedAgencies = (agencies || []).map(i => ({ ...i, itemType: 'Agency', displayTitle: i.name }));
    const formattedTactics = (tactics || []).map(i => ({ ...i, itemType: 'Tactic', displayTitle: i.title }));

    setPendingItems([...formattedTools, ...formattedAgencies, ...formattedTactics]);
    setLoading(false);
  }

  async function handleDecision(item: any, decision: 'approved' | 'rejected') {
    let table = '';
    if (item.itemType === 'Tool') table = 'tools';
    else if (item.itemType === 'Agency') table = 'agencies';
    else if (item.itemType === 'Tactic') table = 'tactics_library';

    if (!table) return;

    await supabase.from(table).update({ status: decision }).eq('id', item.id);
    
    // In a real app, you might trigger an email notification here (Section 9 requirements)
    
    fetchPendingItems(); // Refresh list
  }

  if (loading) return <div className="p-8 text-center text-slate-400">Checking for submissions...</div>;

  if (pendingItems.length === 0) {
    return (
        <div className="flex flex-col items-center justify-center h-96 text-slate-400 border-2 border-dashed border-slate-200 rounded-xl m-8">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                <Check size={32} className="text-emerald-500" />
            </div>
            <h3 className="text-lg font-bold text-slate-700">All Caught Up!</h3>
            <p className="text-sm">No pending submissions from users.</p>
        </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
       <h2 className="text-lg font-black text-slate-800 uppercase tracking-wide flex items-center gap-2">
          <Clock size={20} className="text-orange-500" />
          Pending Approvals ({pendingItems.length})
       </h2>
       
       <div className="grid gap-4">
          {pendingItems.map((item) => (
            <div key={item.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row gap-6 items-start md:items-center justify-between hover:border-indigo-200 transition-colors">
                
                {/* Content Info */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded ${
                            item.itemType === 'Tool' ? 'bg-indigo-100 text-indigo-700' :
                            item.itemType === 'Agency' ? 'bg-purple-100 text-purple-700' :
                            'bg-emerald-100 text-emerald-700'
                        }`}>
                            {item.itemType} Submission
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1">
                            <User size={10} /> Submitted by User
                        </span>
                    </div>
                    <h3 className="text-lg font-bold text-slate-900">{item.displayTitle}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                    
                    {/* Context Data (Links/Prices) */}
                    <div className="flex gap-4 mt-3 text-xs font-medium text-slate-400">
                        {item.affiliate_link && <span>Link: {item.affiliate_link}</span>}
                        {item.website_link && <span>Site: {item.website_link}</span>}
                        {item.default_budget > 0 && <span>Budget: ${item.default_budget}</span>}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button 
                        onClick={() => handleDecision(item, 'rejected')}
                        className="flex-1 md:flex-none px-4 py-2 border border-slate-200 text-slate-600 rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-slate-50 hover:text-red-600 transition-colors"
                    >
                        Reject
                    </button>
                    <button 
                        onClick={() => handleDecision(item, 'approved')}
                        className="flex-1 md:flex-none px-6 py-2 bg-slate-900 text-white rounded-lg text-xs font-bold uppercase tracking-wider hover:bg-emerald-600 transition-colors shadow-lg"
                    >
                        Approve & Publish
                    </button>
                </div>
            </div>
          ))}
       </div>
    </div>
  );
}