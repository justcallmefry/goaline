import PlanBoard, { Lane } from '@/components/PlanBoard';
import { createClient } from '@/utils/supabase/server'; 
import { redirect } from 'next/navigation';

export default async function Home() {
  const supabase = await createClient();
  
  // --- BYPASS START ---
  // const { data: { user } } = await supabase.auth.getUser();
  // if (!user) {
  //   redirect('/login');
  // }
  // --- BYPASS END ---

  const planId = '11111111-1111-1111-1111-111111111111';

  const { data: sections } = await supabase.from('plan_sections').select('*').eq('plan_id', planId).order('order_index');
  const { data: items } = await supabase.from('plan_items').select('*, tactic:tactics(title, base_budget_estimate)').in('section_id', (sections || []).map(s => s.id)).order('order_index');

  const lanes: Lane[] = (sections || []).map(section => ({
    id: section.id,
    title: section.title,
    items: items?.filter(i => i.section_id === section.id).map(i => ({
        id: i.id,
        title: i.tactic?.title || i.custom_notes || 'New Tactic',
        budget: i.allocated_budget || 0,
        content: i.content || '' 
      })) || []
  }));

  return (
    // FULL SCREEN LAYOUT
    <main className="h-screen w-screen bg-slate-100 flex flex-col overflow-hidden">
      
      {/* Header - Stretches Full Width */}
      <header className="flex-shrink-0 h-16 bg-white border-b border-gray-200 px-6 flex justify-between items-center shadow-sm z-10 relative">
        <div className="flex items-center gap-4">
          <div className="bg-black text-white w-8 h-8 flex items-center justify-center rounded-lg font-black text-lg tracking-tighter">
            G
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 tracking-tight leading-none">GROWTH PLAN</h1>
            <p className="text-[10px] text-slate-400 font-bold tracking-widest uppercase">Q1 Strategy</p>
          </div>
        </div>
        
        {/* User Badge */}
        <div className="flex items-center gap-3">
           <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-md border border-indigo-100 uppercase tracking-wide">
              Dev Mode
           </span>
           <div className="w-8 h-8 rounded-full bg-slate-200 border-2 border-white shadow-sm"></div>
        </div>
      </header>
      
      {/* The Board Container - Fills remaining space */}
      <div className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 bg-slate-100/50">
            <PlanBoard initialLanes={lanes} />
        </div>
      </div>
    </main>
  );
}