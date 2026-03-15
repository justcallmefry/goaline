"use client";

import React, { useEffect, useState } from 'react';
import { getTeamsForUserAction } from '@/app/actions/team-actions';
import { 
  Search, UserPlus, Edit2, Settings, User, Plus
} from 'lucide-react';

export default function TeamsPage() {
  const [teams, setTeams] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editingMember, setEditingMember] = useState<any | null>(null);
  const [fetchError, setFetchError] = useState<string | null>(null);

  const loadTeams = async () => {
    setLoading(true);
    setFetchError(null);
    const { data, error } = await getTeamsForUserAction();
    if (error) setFetchError(error);
    else setTeams(data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    loadTeams();
  }, []);

  return (
    <div className="space-y-8 pb-10 relative">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-1">
          <div className="flex gap-8">
            <button className="pb-3 text-sm font-bold text-purple-600 border-b-2 border-purple-600">
              Team(s)
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

      {/* TEAMS GRID */}
      {loading ? (
         <div className="text-center py-20 text-slate-400">Loading teams...</div>
      ) : fetchError ? (
         <div className="text-center py-20 bg-red-50 rounded-3xl border border-red-100">
            <h3 className="text-slate-900 font-bold text-lg mb-2">Could not load teams</h3>
            <p className="text-slate-600 text-sm mb-4">{fetchError}</p>
            <p className="text-slate-500 text-sm">You can still create a team using <strong>Create New</strong> in the sidebar.</p>
         </div>
      ) : teams.length === 0 ? (
         <div className="text-center py-20 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
            <h3 className="text-slate-900 font-bold text-lg mb-2">No teams found</h3>
            <p className="text-slate-500 text-sm mb-6">Create your first team to get started.</p>
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('openCreateModal', { detail: { view: 'create-team' } }))}
              className="inline-flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold px-6 py-3 rounded-xl shadow-lg shadow-purple-200 transition-all active:scale-95"
            >
              <Plus size={20} strokeWidth={3} /> Create New
            </button>
         </div>
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {teams.map((team) => (
            <TeamCard 
              key={team.id}
              title={team.name} 
              count={team.team_members.length} 
              members={team.team_members} 
              onEdit={(member: any) => setEditingMember(member)} 
            />
          ))}
        </div>
      )}

      {/* EDIT MODAL PLACEHOLDER */}
      {editingMember && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 backdrop-blur-sm">
           <div className="bg-white p-8 rounded-2xl shadow-xl">
              <h2 className="font-bold mb-4">Edit Role</h2>
              <p className="text-sm text-slate-500 mb-4">Editing {editingMember.profiles?.email}</p>
              <button onClick={() => setEditingMember(null)} className="px-4 py-2 bg-slate-100 rounded-lg text-sm font-bold">Close</button>
           </div>
        </div>
      )}

    </div>
  );
}

// --- SUB COMPONENTS ---

function TeamCard({ title, count, members, onEdit }: any) {
  return (
    <div className="bg-white rounded-[20px] border border-slate-100 shadow-sm flex flex-col h-[400px]">
      <div className="p-6 border-b border-slate-50 flex justify-between items-center">
        <h3 className="font-bold text-slate-900 text-lg">
          {title} <span className="text-slate-400 font-medium text-sm ml-1">- {count} Members</span>
        </h3>
        <div className="flex items-center gap-3">
          <button className="text-slate-400 hover:text-purple-600 transition-colors"><UserPlus size={18} /></button>
          <button className="text-slate-400 hover:text-blue-600 transition-colors"><Edit2 size={18} /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-slate-50">
            {members.map((member: any, i: number) => {
               // Handle safe access to profile data
               const email = member.profiles?.email || 'Unknown Email';
               // If full_name is null, fallback to email prefix
               const name = member.profiles?.full_name || email.split('@')[0];
               
               return (
                <tr key={i} className="group hover:bg-slate-50/50 transition-colors">
                  <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-slate-100 rounded-full flex items-center justify-center text-slate-400">
                             <User size={14} />
                          </div>
                          <div className="font-bold text-slate-700 text-sm">{name}</div>
                      </div>
                  </td>
                  <td className="py-4 px-4"><div className="text-slate-500 text-xs">{email}</div></td>
                  <td className="py-4 px-4 text-center">
                    <span className={`inline-block px-3 py-1 rounded-full border text-[10px] font-bold 
                        ${member.role === 'owner' ? 'bg-purple-50 border-purple-200 text-purple-600' : 'bg-blue-50 border-blue-200 text-blue-600'}`}>
                        {member.role}
                    </span>
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
               );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}