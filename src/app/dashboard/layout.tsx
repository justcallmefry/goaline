import React from 'react';
import Sidebar from '@/components/layout/Sidebar';
import { Bell } from 'lucide-react';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen bg-[#F8F9FC] overflow-hidden">
      
      {/* 1. SIDEBAR */}
      <aside className="w-[280px] flex-shrink-0 hidden md:block border-r border-slate-100 bg-white z-50">
        <Sidebar />
      </aside>

      {/* 2. MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 overflow-x-auto">
        
        {/* HEADER (Search Removed) */}
        <header className="h-24 min-w-[1200px] flex items-center justify-end px-10 sticky top-0 z-40 bg-[#F8F9FC]"> 
          
          {/* User Profile Area */}
          <div className="flex items-center gap-6">
            <button className="bg-white p-3 rounded-full text-slate-400 hover:text-purple-600 shadow-sm relative transition-all">
              <Bell size={20} />
              <span className="absolute top-2.5 right-3 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
            </button>
            <div className="flex items-center gap-3">
              <div className="text-right leading-tight">
                <div className="font-bold text-slate-900">John Doe</div>
                <div className="text-xs text-slate-500 font-medium">Premium Plan</div>
              </div>
              <div className="w-12 h-12 bg-white rounded-full p-1 shadow-sm">
                 <div className="w-full h-full bg-slate-200 rounded-full overflow-hidden">
                   <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix" alt="User" />
                 </div>
              </div>
            </div>
          </div>
        </header>

        {/* CONTENT */}
        <main className="flex-1 p-10 pt-4 overflow-y-auto">
          <div className="min-w-[1200px] max-w-[1600px] mx-auto pb-20">
            {children}
          </div>
        </main>

      </div>
    </div>
  );
}