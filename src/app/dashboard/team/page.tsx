"use client";

import React, { useState } from 'react';
import { 
  Search, Plus, UserPlus, Edit2, Trash2, 
  Settings, X, ChevronDown 
} from 'lucide-react';

export default function TeamsPage() {
  const [editingMember, setEditingMember] = useState<any | null>(null);

  return (
    <div className="space-y-8 pb-10 relative">
      
      {/* 1. HEADER SECTION */}
      <div className="flex flex-col space-y-6">
        
        {/* Tabs & Add Button Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-1">
          <div className="flex gap-8">
            <button className="pb-3 text-sm font-bold text-purple-600 border-b-2 border-purple-600">
              Team(s)
            </button>
            <button className="pb-3 text-sm font-bold text-slate-500 hover:text-slate-800 transition-colors">
              Members
            </button>
          </div>
          <div className="hidden md:block pb-2">
             <button className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2.5 rounded-xl font-bold text-sm shadow-md shadow-purple-200 transition-all active:scale-95 flex items-center gap-2">
               Add Team
             </button>
          </div>
        </div>

        {/* Search */}
        <div className="flex justify-between items-center gap-4">
          <div className="relative w-full md:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
            <input 
              type="text" 
              placeholder="Search team name" 
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all"
            />
          </div>
        </div>
      </div>

      {/* 2. TEAMS GRID */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        <TeamCard 
          title="Product or R&D Team" 
          count={4} 
          members={PRODUCT_TEAM} 
          onEdit={(member) => setEditingMember(member)} 
        />
        <TeamCard 
          title="Sales Team" 
          count={6} 
          members={SALES_TEAM} 
          onEdit={(member) => setEditingMember(member)} 
        />
        <TeamCard 
          title="Marketing Team" 
          count={5} 
          members={MARKETING_TEAM} 
          onEdit={(member) => setEditingMember(member)} 
        />
      </div>

      {/* 3. EDIT MODAL (Shows when editingMember is set) */}
      {editingMember && (
        <MemberModal 
          member={editingMember} 
          onClose={() => setEditingMember(null)} 
        />
      )}

    </div>
  );
}

// --- SUB COMPONENTS ---

function TeamCard({ title, count, members, onEdit }: { title: string, count: number, members: any[], onEdit: (m: any) => void }) {
  return (
    <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm flex flex-col h-[400px]">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-900 text-lg">
          {title} <span className="text-slate-400 font-medium text-sm ml-1">- {count} Members</span>
        </h3>
        <div className="flex items-center gap-3">
          <button className="text-slate-400 hover:text-purple-600 transition-colors"><UserPlus size={18} /></button>
          <button className="text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={18} /></button>
          <button className="text-slate-400 hover:text-red-500 transition-colors"><Trash2 size={18} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-slate-50">
            {members.map((member, i) => (
              <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                <td className="py-4 px-4"><div className="font-bold text-slate-700 text-sm">{member.name}</div></td>
                <td className="py-4 px-4"><div className="text-slate-500 text-xs">{member.email}</div></td>
                <td className="py-4 px-4 text-center">
                  <span className="inline-block px-3 py-1 rounded-full border border-green-200 text-green-600 text-[10px] font-bold bg-green-50">Active</span>
                </td>
                <td className="py-4 px-4 text-right">
                  <button 
                    onClick={() => onEdit(member)}
                    className="p-2 rounded-lg text-slate-300 hover:bg-purple-50 hover:text-purple-600 transition-all"
                  >
                    <Settings size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function MemberModal({ member, onClose }: { member: any, onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-[24px] shadow-2xl w-full max-w-lg overflow-hidden animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
          <h3 className="text-xl font-bold text-slate-900">Edit Member</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors">
            <X size={24} />
          </button>
        </div>

        {/* Body */}
        <div className="p-8 space-y-5">
          
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Name</label>
            <input type="text" defaultValue={member.name} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-100 outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Email</label>
            <input type="email" defaultValue={member.email} className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-purple-100 outline-none" />
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Team</label>
            <div className="relative">
              <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium appearance-none focus:ring-2 focus:ring-purple-100 outline-none">
                <option>Product or R&D Team</option>
                <option>Sales Team</option>
                <option>Marketing Team</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-500 uppercase">Status</label>
            <div className="relative">
              <select className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl text-sm font-medium appearance-none focus:ring-2 focus:ring-purple-100 outline-none">
                <option>Active</option>
                <option>Inactive</option>
                <option>On Leave</option>
              </select>
              <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={16} />
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="p-6 border-t border-slate-50 flex justify-between items-center bg-slate-50/50">
          <button className="px-6 py-2.5 rounded-xl border border-purple-200 text-purple-600 font-bold text-sm hover:bg-purple-50 transition-colors">
            Remove From Team
          </button>
          <button onClick={onClose} className="px-8 py-2.5 rounded-xl bg-purple-600 text-white font-bold text-sm hover:bg-purple-700 shadow-md shadow-purple-200 transition-all active:scale-95">
            Update
          </button>
        </div>

      </div>
    </div>
  );
}

// --- MOCK DATA ---

const PRODUCT_TEAM = [
  { name: "Ricky Laningrad", email: "rickylaningrad@gmail.com" },
  { name: "Liam Miller", email: "liammiller@gmail.com" },
  { name: "Ricky Ponting", email: "rickyponting@gmail.com" },
  { name: "James Anderson", email: "jamesanderson@gmail.com" },
];

const SALES_TEAM = [
  { name: "Ross Laningrad", email: "rosslaningrad@gmail.com" },
  { name: "Liam Make", email: "liammake@gmail.com" },
  { name: "Ricky Ponting", email: "rickyponting@gmail.com" },
  { name: "James Anderson", email: "jamesanderson@gmail.com" },
  { name: "Brett Lee", email: "blee@gmail.com" },
  { name: "Shane Warne", email: "spinking@gmail.com" },
];

const MARKETING_TEAM = [
  { name: "Ricky Laningrad", email: "rickylaningrad@gmail.com" },
  { name: "Liam Miller", email: "liammiller@gmail.com" },
  { name: "Ricky Ponting", email: "rickyponting@gmail.com" },
  { name: "James Anderson", email: "jamesanderson@gmail.com" },
  { name: "Adam Gilchrist", email: "gilly@gmail.com" },
];