"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  LayoutDashboard, Users, Bookmark, Compass, Plus, Settings, LogOut, Layers 
} from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import CreateModal from '@/components/modals/CreateModal';

export default function Sidebar() {
  const pathname = usePathname();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [createModalView, setCreateModalView] = useState<'menu' | 'create-team'>('menu');
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) setUserId(user.id);
    };
    getUser();
  }, []);

  useEffect(() => {
    const handleOpenCreate = (e: Event) => {
      const view = (e as CustomEvent<{ view?: 'menu' | 'create-team' }>)?.detail?.view ?? 'menu';
      setCreateModalView(view);
      setIsModalOpen(true);
    };
    window.addEventListener('openCreateModal', handleOpenCreate);
    return () => window.removeEventListener('openCreateModal', handleOpenCreate);
  }, []);

  const handleCloseCreate = () => {
    setIsModalOpen(false);
    setCreateModalView('menu');
  };

  const isActive = (path: string) => pathname === path;

  return (
    <>
      <div className="h-full flex flex-col bg-white">
        
        {/* LOGO */}
        <div className="h-24 flex items-center px-8">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-purple-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">G</div>
            <span className="text-xl font-extrabold text-slate-900 tracking-tight">GoaLine</span>
          </div>
        </div>

        {/* CREATE BUTTON */}
        <div className="px-6 mb-6">
          <button 
            onClick={() => { setCreateModalView('menu'); setIsModalOpen(true); }}
            className="w-full h-12 flex items-center justify-center gap-2 bg-white border-2 border-purple-600 text-purple-700 hover:bg-purple-50 rounded-2xl font-bold text-sm transition-all shadow-sm active:scale-95"
          >
            <Plus size={20} strokeWidth={3} /> Create New
          </button>
        </div>

        {/* NAVIGATION */}
        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          <NavItem href="/dashboard" icon={<LayoutDashboard size={20} />} label="Dashboard" active={isActive('/dashboard')} />
          <NavItem href="/dashboard/team" icon={<Users size={20} />} label="My Team" active={isActive('/dashboard/team')} />
          
          {/* NEW TACTICS LINK */}
          <NavItem href="/dashboard/tactics" icon={<Layers size={20} />} label="Tactics" active={isActive('/dashboard/tactics')} />
          
          <NavItem href="/dashboard/plans" icon={<Bookmark size={20} />} label="Saved Plans" active={isActive('/dashboard/plans')} />
          <NavItem href="/dashboard/templates" icon={<Compass size={20} />} label="Explore Templates" active={isActive('/dashboard/templates')} />
        </nav>

        {/* FOOTER */}
        <div className="p-6 border-t border-slate-50 mt-auto space-y-1">
          <NavItem href="/dashboard/settings" icon={<Settings size={20} />} label="Settings" active={isActive('/dashboard/settings')} />
          <a href="/auth/signout" className="w-full flex items-center gap-4 px-6 h-12 rounded-2xl text-sm font-bold text-slate-500 hover:bg-slate-50 hover:text-red-600 transition-colors">
            <LogOut size={20} /> Sign Out
          </a>
        </div>
      </div>
      
      <CreateModal 
        isOpen={isModalOpen} 
        onClose={handleCloseCreate} 
        userId={userId ?? undefined}
        initialView={createModalView}
      />
    </>
  );
}

function NavItem({ href, icon, label, active }: any) {
  return (
    <Link 
      href={href} 
      className={`flex items-center gap-4 px-6 h-12 rounded-2xl text-sm font-bold transition-all ${
        active ? 'bg-purple-600 text-white shadow-md shadow-purple-200' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
      }`}
    >
      {icon}
      {label}
    </Link>
  );
}