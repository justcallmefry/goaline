"use client";

import React, { useState, useRef, useEffect } from 'react';
import { 
  FileText, Target, Users, Sprout, Megaphone, CheckSquare, 
  Sparkles, Send, ArrowUpRight
} from 'lucide-react';

export default function DashboardHome() {
  // --- CHAT STATE ---
  const [messages, setMessages] = useState([
    { role: 'ai', content: "Hi! I'm GoaLine. How can I help you grow your business today?" }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // We use a ref for the CONTAINER, not the message
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logic (Only scrolls the chat box, not the page)
  useEffect(() => {
    if (scrollContainerRef.current) {
      const { scrollHeight, clientHeight } = scrollContainerRef.current;
      scrollContainerRef.current.scrollTo({
        top: scrollHeight - clientHeight,
        behavior: 'smooth'
      });
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMessage = input;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: userMessage }),
      });
      
      const data = await response.json();
      setMessages(prev => [...prev, { role: 'ai', content: data.reply }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. TOP STATS */}
      <div className="dashboard-grid">
        <StatCard label="Growth Plans" value="12" icon={<FileText className="text-purple-600" size={24} />} />
        <StatCard label="Strategies" value="24" icon={<Target className="text-purple-600" size={24} />} />
        <StatCard label="Teams" value="10" icon={<Users className="text-purple-600" size={24} />} />
        <StatCard label="Members" value="38" icon={<Users className="text-purple-600" size={24} />} />
      </div>

      {/* 2. CHART + CHAT */}
      {/* Fixed height of 450px applied to the grid */}
      <div className="chart-grid h-[450px]">
        
        {/* GRAPH */}
        <div className="bg-white rounded-[32px] p-8 shadow-sm border border-slate-100 flex flex-col relative overflow-hidden h-full">
          <div className="flex justify-between items-start mb-4 z-10">
            <h3 className="text-lg font-bold text-slate-900">Success Rate</h3>
            <div className="flex gap-4 text-xs font-bold text-slate-500">
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-purple-600"></span> Plans</div>
              <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-cyan-400"></span> Strategy</div>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-[350px] w-full px-4">
            <SuccessChart />
          </div>
        </div>

        {/* CHAT WIDGET */}
        {/* Added overflow-hidden and min-h-0 to stop expansion */}
        <div className="bg-white rounded-[32px] p-6 shadow-sm border border-slate-100 flex flex-col relative h-full overflow-hidden min-h-0">
          <div className="flex items-center gap-3 mb-4 flex-shrink-0">
            <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-lg shadow-purple-200">
              <Sparkles size={20} fill="currentColor" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">Ask me anything</h3>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">AI Strategist</p>
            </div>
          </div>

          {/* Messages Container */}
          {/* Added flex-1, overflow-y-auto to enable internal scroll */}
          <div 
            ref={scrollContainerRef}
            className="flex-1 space-y-4 overflow-y-auto mb-4 pr-2 custom-scrollbar min-h-0"
          >
             {messages.map((msg, idx) => (
               <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                 <div className={`
                   text-xs py-3 px-4 rounded-2xl max-w-[90%] font-medium leading-relaxed whitespace-pre-wrap
                   ${msg.role === 'user' 
                     ? 'bg-slate-100 text-slate-700 rounded-tr-sm' 
                     : 'bg-purple-50 text-purple-900 rounded-tl-sm border border-purple-100'}
                 `}>
                   {msg.content}
                 </div>
               </div>
             ))}
             
             {isLoading && (
               <div className="flex justify-start">
                 <div className="bg-purple-50 text-purple-400 text-xs py-3 px-4 rounded-2xl rounded-tl-sm border border-purple-100 flex gap-1">
                   <span className="animate-bounce">●</span>
                   <span className="animate-bounce delay-100">●</span>
                   <span className="animate-bounce delay-200">●</span>
                 </div>
               </div>
             )}
          </div>

          {/* Input Area (Pinned to bottom) */}
          <div className="relative mt-auto flex-shrink-0 pt-2 border-t border-slate-50">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder="Type your question..." 
              className="w-full pl-4 pr-10 py-3 bg-white border border-slate-200 rounded-2xl text-xs font-medium focus:outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all shadow-sm"
            />
            <button 
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
              className="absolute right-3 top-1/2 mt-1 -translate-y-1/2 text-slate-400 hover:text-purple-600 disabled:opacity-50"
            >
              <Send size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* 3. CREATE WITH AI */}
      <div>
        <h3 className="font-bold text-slate-900 text-lg mb-6">Create with AI</h3>
        <div className="dashboard-grid">
          <AiCard title="Growth Plan" desc="Craft a comprehensive plan." icon={<Sprout className="text-green-500" size={32} />} />
          <AiCard title="Strategy" desc="Design a focused strategy." icon={<Target className="text-blue-500" size={32} />} />
          <AiCard title="Campaign" desc="Targeted marketing push." icon={<Megaphone className="text-pink-500" size={32} />} />
          <AiCard title="Action Plan" desc="Break down objectives." icon={<CheckSquare className="text-orange-400" size={32} />} />
        </div>
      </div>
      
       {/* 4. STRATEGIES LIST */}
      <div className="grid grid-cols-2 gap-6 pt-2">
         <StrategyCard title="Digital Domination" desc="Enhance your visibility in local search." icon={<Target className="text-purple-600" size={24}/>} />
         <StrategyCard title="Strategic Partnerships" desc="Drive organic traffic by sharing findings." icon={<Users className="text-purple-600" size={24} />} />
      </div>

    </div>
  );
}

// --- SUB COMPONENTS ---

function StatCard({ label, value, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-[24px] shadow-sm border border-slate-100 flex items-center gap-5 hover:shadow-md transition-all cursor-default h-32">
      <div className="w-16 h-16 rounded-2xl bg-[#F8F9FC] flex items-center justify-center flex-shrink-0">
        {icon}
      </div>
      <div>
        <div className="text-4xl font-extrabold text-slate-900 tracking-tight">{value}</div>
        <div className="text-xs font-bold text-slate-400 uppercase tracking-wide mt-1">{label}</div>
      </div>
    </div>
  );
}

function AiCard({ title, desc, icon }: any) {
  return (
    <button className="bg-white p-8 rounded-[32px] shadow-sm border border-slate-100 flex flex-col items-center text-center hover:shadow-xl hover:shadow-purple-100 hover:-translate-y-1 transition-all group h-64 justify-center w-full">
      <div className="w-20 h-20 rounded-3xl bg-[#F8F9FC] flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
        {icon}
      </div>
      <h4 className="font-bold text-slate-900 text-lg mb-2">{title}</h4>
      <p className="text-xs text-slate-500 leading-relaxed font-medium px-4">{desc}</p>
    </button>
  );
}

function StrategyCard({ title, desc, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm flex gap-5 items-center hover:border-purple-200 cursor-pointer transition-colors group h-28">
       <div className="p-4 bg-purple-50 rounded-2xl shrink-0 group-hover:bg-purple-100 transition-colors">
         {icon}
       </div>
       <div>
         <h4 className="font-bold text-slate-900 text-base">{title}</h4>
         <p className="text-xs text-slate-500 mt-1 font-medium">{desc}</p>
       </div>
       <ArrowUpRight className="ml-auto text-slate-300 group-hover:text-purple-600 transition-colors" />
    </div>
  );
}

function SuccessChart() {
  return (
    <svg viewBox="0 0 800 350" className="w-full h-full block" preserveAspectRatio="none">
      <defs>
        <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#9333ea" stopOpacity="0.1"/>
          <stop offset="100%" stopColor="#9333ea" stopOpacity="0"/>
        </linearGradient>
      </defs>
      <line x1="0" y1="75" x2="800" y2="75" stroke="#f1f5f9" strokeWidth="2" strokeDasharray="6 6"/>
      <line x1="0" y1="150" x2="800" y2="150" stroke="#f1f5f9" strokeWidth="2" strokeDasharray="6 6"/>
      <line x1="0" y1="225" x2="800" y2="225" stroke="#f1f5f9" strokeWidth="2" strokeDasharray="6 6"/>
      <text x="50" y="320" className="text-xs fill-slate-400 font-bold">Jan</text>
      <text x="200" y="320" className="text-xs fill-slate-400 font-bold">Feb</text>
      <text x="350" y="320" className="text-xs fill-slate-400 font-bold">Mar</text>
      <text x="500" y="320" className="text-xs fill-slate-400 font-bold">Apr</text>
      <text x="650" y="320" className="text-xs fill-slate-400 font-bold">May</text>
      <path d="M0,250 C100,150 200,50 300,250 C400,400 500,50 600,50 C700,50 750,150 800,200" fill="url(#purpleGradient)" stroke="#9333ea" strokeWidth="6" strokeLinecap="round" className="drop-shadow-md" />
      <path d="M0,300 C100,250 200,100 300,200 C400,250 500,300 600,150 C700,100 750,150 800,200" fill="none" stroke="#22d3ee" strokeWidth="6" strokeLinecap="round" />
    </svg>
  );
}