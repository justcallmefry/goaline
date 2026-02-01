'use client';

import React, { useState, useEffect } from 'react';
import { Activity, Zap, MousePointer, Search, ArrowUpRight } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminInsightsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    topTools: [] as any[],
    topQueries: [] as any[],
    recentActivity: [] as any[]
  });

  useEffect(() => {
    fetchLogs();
  }, []);

  async function fetchLogs() {
    setLoading(true);
    // Fetch last 500 actions
    const { data } = await supabase
      .from('activity_logs')
      .select('*, profiles(email)') // Join with profile to get email
      .order('created_at', { ascending: false })
      .limit(500);

    if (data) {
      processStats(data);
      setLogs(data);
    }
    setLoading(false);
  }

  function processStats(data: any[]) {
    // 1. Top Tools (Clicks)
    const toolCounts: Record<string, number> = {};
    data.filter(l => l.action_type === 'view_tool').forEach(l => {
        const name = l.details?.name || 'Unknown Tool';
        toolCounts[name] = (toolCounts[name] || 0) + 1;
    });
    const sortedTools = Object.entries(toolCounts)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 5);

    // 2. AI Trends (Queries)
    // We just grab the last 5 unique queries to see "Recent Intent"
    const queries = data
        .filter(l => l.action_type === 'ai_strategist_query' || l.action_type === 'wizard_generate')
        .map(l => l.details?.prompt || l.details?.query)
        .filter(Boolean)
        .slice(0, 10);

    setStats({
        topTools: sortedTools,
        topQueries: queries,
        recentActivity: data.slice(0, 20) // Last 20 raw actions
    });
  }

  if (loading) return <div className="p-12 text-center text-slate-400">Loading intelligence...</div>;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
       
       {/* LEFT COL: AGGREGATED INSIGHTS */}
       <div className="space-y-6">
          
          {/* Card 1: Revenue Drivers */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><MousePointer size={20} /></div>
                <h3 className="font-bold text-slate-900">Top Tool Interest</h3>
             </div>
             <div className="space-y-3">
                {stats.topTools.length === 0 ? <p className="text-sm text-slate-400 italic">No clicks yet.</p> : stats.topTools.map(([name, count], i) => (
                    <div key={i} className="flex justify-between items-center text-sm">
                        <span className="font-medium text-slate-700">{i+1}. {name}</span>
                        <span className="font-mono font-bold text-slate-400">{count} clicks</span>
                    </div>
                ))}
             </div>
          </div>

          {/* Card 2: User Intent (AI Prompts) */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
             <div className="flex items-center gap-3 mb-4">
                <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Zap size={20} /></div>
                <h3 className="font-bold text-slate-900">Recent AI Requests</h3>
             </div>
             <div className="space-y-3">
                {stats.topQueries.length === 0 ? <p className="text-sm text-slate-400 italic">No AI queries yet.</p> : stats.topQueries.map((query, i) => (
                    <div key={i} className="bg-slate-50 p-3 rounded-lg border border-slate-100">
                        <p className="text-xs text-slate-600 italic">"{query.substring(0, 80)}{query.length > 80 && '...'}"</p>
                    </div>
                ))}
             </div>
          </div>

       </div>

       {/* RIGHT COL: LIVE FEED */}
       <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden flex flex-col h-[600px]">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
             <h3 className="font-bold text-slate-900 flex items-center gap-2"><Activity size={16} className="text-emerald-500" /> Live Activity Feed</h3>
             <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Real-time</span>
          </div>
          <div className="overflow-y-auto p-0">
             {stats.recentActivity.map((log) => (
                <div key={log.id} className="p-4 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3">
                    <div className="mt-1">
                        {log.action_type.includes('tool') ? <MousePointer size={14} className="text-indigo-400"/> : 
                         log.action_type.includes('ai') ? <Zap size={14} className="text-purple-400"/> : 
                         <Activity size={14} className="text-slate-400"/>}
                    </div>
                    <div>
                        <p className="text-xs font-bold text-slate-700">
                            {log.profiles?.email || 'Anonymous User'} 
                            <span className="font-normal text-slate-500"> performed </span> 
                            <span className="uppercase tracking-wide text-[9px] font-bold bg-slate-100 px-1 py-0.5 rounded">{log.action_type.replace(/_/g, ' ')}</span>
                        </p>
                        <p className="text-[10px] text-slate-400 mt-1">
                            {new Date(log.created_at).toLocaleString()}
                        </p>
                    </div>
                </div>
             ))}
          </div>
       </div>

    </div>
  );
}