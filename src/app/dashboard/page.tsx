import React from 'react';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/utils/supabase/server';
import { getQuickWins, computeMoneyMap } from '@/lib/growth-roadmap-calc';
import type { GoaLineOnboarding } from '@/types/goaline-onboarding';
import { FileText, CheckCircle2, ArrowRight, Sparkles } from 'lucide-react';

export default async function DashboardHome() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/');

  const userName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'there';

  const { data: plans } = await supabase
    .from('plans')
    .select('id, business_name, roadmap_data')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })
    .limit(1);

  const plan = plans?.[0];
  const roadmap = plan?.roadmap_data as { onboarding?: GoaLineOnboarding } | null;
  const onboarding = roadmap?.onboarding;

  const quickWins = onboarding ? getQuickWins(onboarding) : [];
  const moneyMap = onboarding ? computeMoneyMap(onboarding) : null;
  const targetDisplay = moneyMap?.targetDisplay;

  return (
    <div className="p-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-1">
          Welcome back, {userName}
        </h1>
        <p className="text-slate-500">
          {plan ? "Here’s your plan and what to do next." : "Get a custom marketing plan and report in about 10 minutes."}
        </p>
      </div>

      {plan ? (
        <>
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-purple-100 flex items-center justify-center shrink-0">
                    <FileText className="text-purple-600" size={24} />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-slate-900">{plan.business_name}</h2>
                    {targetDisplay && (
                      <p className="text-slate-500 text-sm mt-0.5">90-day target: {targetDisplay}</p>
                    )}
                  </div>
                </div>
                <Link
                  href={`/dashboard/plans/${plan.id}`}
                  className="inline-flex items-center gap-2 bg-purple-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-purple-700 transition-colors shrink-0"
                >
                  Open your plan <ArrowRight size={18} />
                </Link>
              </div>
            </div>
          </div>

          {quickWins.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 md:p-8">
              <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-green-500" size={22} />
                Do this week
              </h3>
              <p className="text-slate-500 text-sm mb-4">From your plan — pick at least one to complete.</p>
              <ul className="space-y-3">
                {quickWins.map((win, i) => (
                  <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                    <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">
                      {i + 1}
                    </span>
                    <span className="text-slate-800 font-medium">{win}</span>
                  </li>
                ))}
              </ul>
              <Link
                href={`/dashboard/plans/${plan.id}`}
                className="inline-flex items-center gap-2 text-purple-600 font-bold text-sm mt-4 hover:underline"
              >
                See full report and next steps <ArrowRight size={16} />
              </Link>
            </div>
          )}

          <div className="flex flex-wrap gap-3">
            <Link
              href="/dashboard/tactics"
              className="inline-flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-5 py-2.5 rounded-xl font-bold hover:bg-slate-50 transition-colors"
            >
              Strategy Board
            </Link>
            <Link
              href="/dashboard/plans"
              className="inline-flex items-center gap-2 text-slate-600 font-bold text-sm hover:underline"
            >
              All plans
            </Link>
          </div>
        </>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-8 md:p-12 text-center max-w-xl mx-auto">
          <div className="w-16 h-16 rounded-2xl bg-purple-100 flex items-center justify-center mx-auto mb-6">
            <Sparkles className="text-purple-600" size={32} />
          </div>
          <h2 className="text-xl font-bold text-slate-900 mb-2">Get your marketing plan</h2>
          <p className="text-slate-600 text-sm mb-6">
            Answer a few questions about your business. We’ll build a custom growth roadmap with next steps, charts, and a report you can export.
          </p>
          <Link
            href="/plan"
            className="inline-flex items-center gap-2 bg-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-purple-700 transition-colors"
          >
            Get your plan <ArrowRight size={20} />
          </Link>
        </div>
      )}
    </div>
  );
}
