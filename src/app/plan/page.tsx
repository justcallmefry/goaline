import React, { Suspense } from 'react';
import { PlanClient } from './PlanClient';

export default function PlanPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          <div className="text-slate-500 font-medium">Loading…</div>
        </div>
      }
    >
      <PlanClient />
    </Suspense>
  );
}
