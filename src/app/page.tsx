import PlanBoard from '@/components/PlanBoard';
import { Lane } from '@/types';
import { createClient } from '@/utils/supabase/server'; 

export default async function Home() {
  const supabase = await createClient();

  // --- DEMO MODE: Hardcoded ID for the partner demo ---
  // This ensures everyone sees the same board without logging in.
  const DEMO_PLAN_ID = '11111111-1111-1111-1111-111111111111';

  // 1. Fetch the sections
  const { data: sections } = await supabase
    .from('plan_sections')
    .select('*')
    .eq('plan_id', DEMO_PLAN_ID)
    .order('order_index');

  // 2. Fetch the items
  const { data: items } = await supabase
    .from('plan_items')
    .select('*, tactic:tactics(title, base_budget_estimate)')
    .in('section_id', (sections || []).map(s => s.id))
    .order('order_index');

  // 3. Format for the Board
  const lanes: Lane[] = (sections || []).map(section => ({
    id: section.id,
    title: section.title,
    items: items
      ?.filter(i => i.section_id === section.id)
      .map(i => ({
        id: i.id,
        title: i.tactic?.title || i.custom_notes || 'New Tactic',
        budget: i.allocated_budget || 0,
        content: i.content || '' 
      })) || []
  }));

  return (
    <main className="h-screen w-screen bg-slate-200 flex flex-col overflow-hidden font-sans">
      <div className="flex-1 overflow-hidden relative">
        <PlanBoard initialLanes={lanes} />
      </div>
    </main>
  );
}