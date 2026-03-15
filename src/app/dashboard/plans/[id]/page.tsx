import React from 'react'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/utils/supabase/server'
import { MoneyMapView } from '@/components/growth-roadmap/MoneyMapView'
import PlanReport from '@/components/plans/PlanReport'
import BentoGrowthReport from '@/components/plans/BentoGrowthReport'
import type { GrowthPlan } from '@/types/marketing-plan'
import type { GoaLineOnboarding } from '@/types/goaline-onboarding'
import type { MoneyMapData } from '@/lib/growth-roadmap'
import { ArrowLeft, FileText } from 'lucide-react'

export default async function PlanDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()
  const { data: plan, error } = await supabase
    .from('plans')
    .select('id, business_name, plan_type, roadmap_data')
    .eq('id', id)
    .single()

  if (error || !plan) notFound()

  const roadmap = plan.roadmap_data as {
    view1?: unknown
    fullPlan?: GrowthPlan
    onboarding?: GoaLineOnboarding
  } | null

  if (roadmap?.onboarding) {
    return <BentoGrowthReport onboarding={roadmap.onboarding} planId={plan.id} />
  }

  if (roadmap?.fullPlan) {
    return <PlanReport plan={roadmap.fullPlan} />
  }

  if (roadmap?.view1) {
    return (
      <MoneyMapView
        data={roadmap.view1 as MoneyMapData}
        businessName={plan.business_name ?? 'My Business'}
      />
    )
  }

  return (
    <div className="space-y-6 pb-20">
      <Link
        href="/dashboard/plans"
        className="inline-flex items-center gap-2 text-slate-600 hover:text-purple-600 font-medium text-sm"
      >
        <ArrowLeft size={18} /> Back to plans
      </Link>
      <div className="bg-white rounded-2xl border border-slate-100 p-8 text-center">
        <FileText size={48} className="mx-auto text-slate-300 mb-4" />
        <h2 className="text-xl font-bold text-slate-900 mb-2">This plan uses the previous format</h2>
        <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
          Create a new <strong>Growth Plan</strong> from the dashboard to get the Money Map and full roadmap.
        </p>
        <Link
          href="/dashboard/plans"
          className="inline-flex items-center gap-2 bg-purple-600 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-purple-700"
        >
          View all plans
        </Link>
      </div>
    </div>
  )
}
