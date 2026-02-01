import PlanBoard from '@/components/PlanBoard';

export default function Home() {
  // We provide these default empty lanes so the board can render immediately.
  // Once the page loads, PlanBoard.tsx will wake up, check if the user is logged in,
  // and fetch their real data (or show the Login Screen if they aren't).
  const defaultLanes = [
    { id: 'lane-1', title: 'Awareness', items: [] },
    { id: 'lane-3', title: 'Conversion', items: [] },
    { id: 'lane-4', title: 'Retention', items: [] },
  ];

  return (
    <main className="h-screen w-screen bg-slate-200 flex flex-col overflow-hidden font-sans">
      <div className="flex-1 overflow-hidden relative">
        <PlanBoard initialLanes={defaultLanes} />
      </div>
    </main>
  );
}