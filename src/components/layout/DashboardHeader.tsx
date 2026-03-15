'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { Bell, UserCircle, Settings, LogOut, Building2 } from 'lucide-react';

export type DashboardHeaderUser = {
  email: string | null;
  fullName: string | null;
  avatarUrl: string | null;
};

export type DashboardHeaderProfile = {
  businessName: string | null;
  logoUrl: string | null;
};

export default function DashboardHeader({
  user,
  profile,
}: {
  user: DashboardHeaderUser;
  profile?: DashboardHeaderProfile | null;
}) {
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const handleSignOut = () => {
    setShowMenu(false);
    window.location.href = '/auth/signout';
  };

  const displayName = user.fullName || user.email || 'My Account';

  const hasCompany = profile?.businessName || profile?.logoUrl;

  return (
    <header className="h-24 min-w-[1200px] flex items-center justify-end px-10 sticky top-0 z-40 bg-[#F8F9FC]">
      <div className="flex items-center gap-4 md:gap-6">
        {/* 1. Personal: image left, name right */}
        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setShowMenu(!showMenu)}
            className="flex items-center gap-3 bg-white pl-2 pr-4 h-12 rounded-2xl shadow-sm hover:shadow-md transition-all border border-slate-100"
          >
            <div className="w-10 h-10 rounded-xl overflow-hidden flex-shrink-0 border-2 border-slate-100">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt=""
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-purple-100 flex items-center justify-center text-purple-600">
                  <UserCircle size={24} />
                </div>
              )}
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <div className="font-bold text-slate-900 text-sm">{displayName}</div>
            </div>
          </button>
          {showMenu && (
            <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-lg border border-slate-100 py-1 z-50">
              <div className="px-4 py-3 border-b border-slate-50">
                <p className="text-sm font-bold text-slate-900 truncate">
                  {displayName}
                </p>
              </div>
              <Link
                href="/dashboard/settings"
                onClick={() => setShowMenu(false)}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                <Settings size={16} /> Settings
              </Link>
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2"
              >
                <LogOut size={16} /> Sign Out
              </button>
            </div>
          )}
        </div>
        {/* 2. Company name and logo to the right of name */}
        {hasCompany && (
          <div className="hidden sm:flex items-center gap-3 bg-white pl-3 pr-5 h-12 rounded-2xl shadow-sm border border-slate-100">
            {profile?.logoUrl ? (
              <img
                src={profile.logoUrl}
                alt=""
                className="w-10 h-10 rounded-xl object-contain border border-slate-100 flex-shrink-0"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 flex-shrink-0">
                <Building2 size={24} />
              </div>
            )}
            {profile?.businessName && (
              <span className="text-sm font-bold text-slate-700 whitespace-nowrap">
                {profile.businessName}
              </span>
            )}
          </div>
        )}
        <button
          type="button"
          className="bg-white w-12 h-12 flex items-center justify-center rounded-2xl text-slate-400 hover:text-purple-600 shadow-sm relative transition-all"
          aria-label="Notifications"
        >
          <Bell size={20} />
        </button>
      </div>
    </header>
  );
}
