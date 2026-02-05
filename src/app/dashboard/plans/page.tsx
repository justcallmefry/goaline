import { MOCK_PLAN } from '@/lib/mock-plan';
import PlanReport from '@/components/plans/PlanReport';

export default async function PlanPage({ params }: { params: { id: string } }) {
  // const plan = await getPlan(params.id); 
  const plan = MOCK_PLAN;

  return (
    // CHANGE 1: Use 'bg-transparent' or remove bg entirely so the layout shows.
    // CHANGE 2: Add padding so the report floats nicely.
    <div className="min-h-screen p-8 space-y-8">
       <PlanReport plan={plan} />
    </div>
  );
}