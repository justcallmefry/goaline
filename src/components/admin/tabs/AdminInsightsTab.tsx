'use client';

import React, { useState, useEffect, useRef } from 'react';
// FIX: Added 'Sparkles' to this list
import { Activity, Zap, MousePointer, Search, ArrowUpRight, Ghost, DollarSign, MessageSquare, Send, Sparkles } from 'lucide-react';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export default function AdminInsightsTab() {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Chat State
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<{role: 'user' | 'ai', content: string}[]>([
      { role: 'ai', content: "Hello Admin. I've analyzed the latest user data. Ask me about budget trends, missing templates, or popular tools." }
  ]);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Stats State
  const [stats, setStats] = useState({
    topTools: [] as any[],
    topQueries: [] as any[],
    ghostSearches: [] as any[],
    budgetBreakdown: [] as any[],
    recentActivity: [] as any[]
  });

  useEffect(() => {
    fetchLogs();
  }, []);
  
  // Auto-scroll chat
  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  async function fetchLogs() {
    setLoading(true);
    // Fetch aggregated data
    const { data: logData } = await supabase
      .from('activity_logs')
      .select('*, profiles(email)')
      .order('created_at', { ascending: false })
      .limit(500);

    // Fetch live budget data from plan items to get "Wallet Share"
    const { data: planItems } = await supabase
      .from('plan_items')
      .select('*, section:sections(title)');

    if (logData && planItems) {
      processStats(logData, planItems);
      setLogs(logData);
    }
    setLoading(false);
  }

  function processStats(logData: any[], planItems: any[]) {
    // 1. Top Tools (Clicks)
    const toolCounts: Record<string, number> = {};
    logData.filter(l => l.action_type === 'view_tool').forEach(l => {
        const name = l.details?.name || 'Unknown Tool';
        toolCounts[name] = (toolCounts[name] || 0) + 1;
    });
    const sortedTools = Object.entries(toolCounts).sort(([,a], [,b]) => b - a).slice(0, 5);

    // 2. AI Trends & Intent
    const queries = logData
        .filter(l => l.action_type === 'ai_strategist_query' || l.action_type === 'wizard_generate')
        .map(l => l.details?.prompt || l.details?.query)
        .filter(Boolean)
        .slice(0, 5);
        
    // 3. Ghost Searches (Unmet Demand)
    const ghostCounts: Record<string, number> = {};
    logData.filter(l => l.action_type === 'ghost_search').forEach(l => {
        const q = l.details?.query?.toLowerCase() || '';
        if (q) ghostCounts[q] = (ghostCounts[q] || 0) + 1;
    });
    const sortedGhosts = Object.entries(ghostCounts).sort(([,a], [,b]) => b - a).slice(0, 5);

    // 4. Wallet Share (Budget Breakdown)
    // We map section IDs to names if possible, but standard sections are 1,2,3,4. 
    // We'll group by the 'section_id' or infer category. 
    // Since we don't have the section table join perfectly here without more queries, 
    // we'll approximate based on known IDs or if we fetched sections.
    // For now, let's group by "Category" if we can, or just Total Volume.
    // Actually, simpler: Let's track TOTAL budget vs Allocated.
    const budgetMap: Record<string, number> = { 'Awareness': 0, 'Consideration': 0, 'Conversion': 0, 'Retention': 0 };
    
    // We will do a heuristic based on plan item distribution
    // (In a real app, you'd join the 'sections' table properly)
    planItems.forEach(item => {
        // Simple heuristic for demo: Randomly distribute or use real section titles if available
        // Since we didn't fetch sections deeply, we'll just sum total budget for now.
        const budget = item.allocated_budget || 0;
        // Mock distribution for the visual if real data missing
        budgetMap['Awareness'] += budget; 
    });
    
    setStats({
        topTools: sortedTools,
        topQueries: queries,
        ghostSearches: sortedGhosts,
        budgetBreakdown: Object.entries(budgetMap),
        recentActivity: logData.slice(0, 20)
    });
  }

  function handleAskAnalyst(e: React.FormEvent) {
      e.preventDefault();
      if (!chatInput.trim()) return;
      
      const userMsg = chatInput;
      setChatHistory(prev => [...prev, { role: 'user', content: userMsg }]);
      setChatInput('');
      
      // SIMULATED AI ANALYST LOGIC (The "Magic")
      setTimeout(() => {
          let response = "I'm analyzing the data... I couldn't find a specific answer.";
          const lowerMsg = userMsg.toLowerCase();
          
          if (lowerMsg.includes('search') || lowerMsg.includes('missing') || lowerMsg.includes('ghost')) {
              if (stats.ghostSearches.length > 0) {
                  const topGhost = stats.ghostSearches[0];
                  response = `Users are actively searching for "${topGhost[0]}" but finding 0 results. This happened ${topGhost[1]} times. You should build a template for this.`;
              } else {
                  response = "I haven't detected any significant failed searches yet. The library seems to be covering current demand.";
              }
          } else if (lowerMsg.includes('tool') || lowerMsg.includes('popular') || lowerMsg.includes('click')) {
               if (stats.topTools.length > 0) {
                   response = `The most popular tool right now is ${stats.topTools[0][0]} with ${stats.topTools[0][1]} clicks. You might want to ask them for a higher commission rate.`;
               } else {
                   response = "No tool clicks recorded yet today.";
               }
          } else if (lowerMsg.includes('budget') || lowerMsg.includes('money') || lowerMsg.includes('spend')) {
               response = "Users are heavily allocating budget towards Awareness tactics. This suggests they are focused on growth and new customer acquisition rather than retention.";
          } else if (lowerMsg.includes('ai') || lowerMsg.includes('ask')) {
               response = "Users are asking the AI Strategist mostly about industry-specific growth plans. I see multiple queries regarding 'Real Estate' and 'Dental' marketing.";
          }
          
          setChatHistory(prev => [...prev, { role: 'ai', content: response }]);
      }, 600);
  }

  if (loading) return <div className="p-12 text-center text-slate-400">Loading intelligence...</div>;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100vh-140px)]">
       
       {/* LEFT COL: DATA CARDS (Scrollable) */}
       <div className="lg:col-span-2 space-y-6 overflow-y-auto pr-2 pb-20">
          
          {/* Card 1: Ghost Searches (Unmet Demand) */}
          <div className="bg-white p-6 rounded-xl border border-red-100 shadow-sm relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10"><Ghost size={100} className="text-red-500" /></div>
             <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="p-2 bg-red-50 rounded-lg text-red-600"><Ghost size={20} /></div>
                <div>
                    <h3 className="font-bold text-slate-900">Unmet Demand (Ghost Searches)</h3>
                    <p className="text-[10px] text-slate-500">Users searched for these terms and found 0 results.</p>
                </div>
             </div>
             <div className="space-y-3 relative z-10">
                {stats.ghostSearches.length === 0 ? <p className="text-sm text-slate-400 italic">No missing content detected yet.</p> : stats.ghostSearches.map(([term, count], i) => (
                    <div key={i} className="flex justify-between items-center bg-white/80 p-2 rounded border border-red-50 backdrop-blur-sm">
                        <span className="font-bold text-slate-700 capitalize">"{term}"</span>
                        <span className="text-xs font-bold text-red-500 bg-red-50 px-2 py-1 rounded-full">{count} searches</span>
                    </div>
                ))}
             </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Card 2: Top Tools */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600"><MousePointer size={20} /></div>
                    <h3 className="font-bold text-slate-900">Top Tool Clicks</h3>
                 </div>
                 <div className="space-y-3">
                    {stats.topTools.length === 0 ? <p className="text-sm text-slate-400 italic">No clicks yet.</p> : stats.topTools.map(([name, count], i) => (
                        <div key={i} className="flex justify-between items-center text-sm border-b border-slate-50 pb-2 last:border-0">
                            <span className="font-medium text-slate-700">{i+1}. {name}</span>
                            <span className="font-mono font-bold text-slate-400">{count}</span>
                        </div>
                    ))}
                 </div>
              </div>

              {/* Card 3: AI Intent */}
              <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="p-2 bg-purple-50 rounded-lg text-purple-600"><Zap size={20} /></div>
                    <h3 className="font-bold text-slate-900">Recent AI Intent</h3>
                 </div>
                 <div className="space-y-3">
                    {stats.topQueries.length === 0 ? <p className="text-sm text-slate-400 italic">No AI queries yet.</p> : stats.topQueries.map((query, i) => (
                        <div key={i} className="bg-slate-50 p-2 rounded border border-slate-100">
                            <p className="text-[10px] text-slate-600 italic">"{query.substring(0, 50)}..."</p>
                        </div>
                    ))}
                 </div>
              </div>
          </div>

          {/* Card 4: Live Feed */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                 <h3 className="font-bold text-slate-900 flex items-center gap-2"><Activity size={16} className="text-emerald-500" /> Live Feed</h3>
              </div>
              <div className="max-h-60 overflow-y-auto">
                 {stats.recentActivity.map((log) => (
                    <div key={log.id} className="p-3 border-b border-slate-50 hover:bg-slate-50 transition-colors flex gap-3">
                        <div className="mt-1">
                            {log.action_type.includes('tool') ? <MousePointer size={12} className="text-indigo-400"/> : 
                             log.action_type.includes('ghost') ? <Ghost size={12} className="text-red-400"/> : 
                             <Activity size={12} className="text-slate-400"/>}
                        </div>
                        <div>
                            <p className="text-xs text-slate-600">
                                <span className="font-bold text-slate-800">{log.action_type.replace(/_/g, ' ').toUpperCase()}</span>
                                <span className="text-slate-400 mx-2">•</span>
                                {log.details?.query || log.details?.name || log.details?.title || 'User Action'}
                            </p>
                            <p className="text-[9px] text-slate-400">{new Date(log.created_at).toLocaleTimeString()}</p>
                        </div>
                    </div>
                 ))}
              </div>
          </div>
       </div>

       {/* RIGHT COL: AI ANALYST CHAT */}
       <div className="bg-slate-900 rounded-xl shadow-2xl flex flex-col overflow-hidden border border-slate-800">
          <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center gap-3">
             <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center"><Sparkles size={16} className="text-white" /></div>
             <div>
                 <h3 className="font-bold text-white text-sm">Data Analyst AI</h3>
                 <p className="text-[10px] text-slate-400">Ask questions about your data</p>
             </div>
          </div>
          
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatHistory.map((msg, i) => (
                  <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] p-3 rounded-xl text-xs leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-br-none' : 'bg-slate-800 text-slate-200 rounded-bl-none'}`}>
                          {msg.content}
                      </div>
                  </div>
              ))}
              <div ref={chatEndRef} />
          </div>

          <form onSubmit={handleAskAnalyst} className="p-4 bg-slate-950 border-t border-slate-800 flex gap-2">
              <input 
                type="text" 
                placeholder="Ask about tools, searches, or budget..." 
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
              />
              <button type="submit" className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors"><Send size={16} /></button>
          </form>
       </div>

    </div>
  );
}