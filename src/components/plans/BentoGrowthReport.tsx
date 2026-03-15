'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  LayoutDashboard,
  Shield,
  Zap,
  Calendar,
  DollarSign,
  AlertTriangle,
  Printer,
  Share2,
  Edit3,
  Store,
  ShoppingCart,
  Briefcase,
  Layout,
  Camera,
  Heart,
  HelpCircle,
  CheckCircle2,
  FileText,
} from 'lucide-react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
import type { GoaLineOnboarding } from '@/types/goaline-onboarding'
import {
  computeMoneyMap,
  getTrajectoryData,
  getMonthlyTargetsData,
  getOneSentenceStrategy,
  getQuickWins,
  getChannelCards,
  getSprintTasks,
  getBudgetAllocation,
  getRisks,
  BUSINESS_TYPE_LABELS,
  URGENCY_LABELS,
} from '@/lib/growth-roadmap-calc'

const NAV = [
  { id: 'toc', label: 'Table of Contents', icon: FileText },
  { id: 'money-map', label: 'Executive Money Map', icon: LayoutDashboard },
  { id: 'moat', label: 'The Moat', icon: Shield },
  { id: 'engine', label: 'The Engine', icon: Zap },
  { id: 'sprints', label: '90-Day Sprints', icon: Calendar },
  { id: 'budget-risks', label: 'Budget & Resources', icon: DollarSign },
  { id: 'next-steps', label: 'Your Next Steps', icon: CheckCircle2 },
] as const

const BUSINESS_TYPE_ICON: Record<GoaLineOnboarding['businessType'], React.ElementType> = {
  local_service: Store,
  ecommerce: ShoppingCart,
  b2b_service: Briefcase,
  saas: Layout,
  creator: Camera,
  nonprofit: Heart,
  other: HelpCircle,
}

function Card({
  children,
  className = '',
  title,
}: { children: React.ReactNode; className?: string; title?: string }) {
  return (
    <div className={`rounded-[20px] border border-slate-200/80 bg-white p-6 shadow-sm ${className}`}>
      {title && <h3 className="text-lg font-bold text-slate-900 mb-4">{title}</h3>}
      {children}
    </div>
  )
}

function Chip({ children }: { children: React.ReactNode }) {
  return (
    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-100 text-slate-700 border border-slate-200">
      {children}
    </span>
  )
}

export default function BentoGrowthReport({
  onboarding,
  planId,
}: {
  onboarding: GoaLineOnboarding
  planId: string
}) {
  const [activeSection, setActiveSection] = useState<string>(NAV[0].id)

  const moneyMap = useMemo(() => computeMoneyMap(onboarding), [onboarding])
  const trajectoryData = useMemo(() => getTrajectoryData(onboarding), [onboarding])
  const monthlyTargetsData = useMemo(() => getMonthlyTargetsData(onboarding), [onboarding])
  const oneLiner = useMemo(() => getOneSentenceStrategy(onboarding), [onboarding])
  const quickWins = useMemo(() => getQuickWins(onboarding), [onboarding])
  const channelCards = useMemo(() => getChannelCards(onboarding), [onboarding])
  const sprints = useMemo(() => getSprintTasks(onboarding), [onboarding])
  const budgetSlices = useMemo(() => getBudgetAllocation(onboarding), [onboarding])
  const risks = useMemo(() => getRisks(onboarding), [onboarding])

  const reportDate = typeof document !== 'undefined'
    ? new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : ''

  const scrollTo = (id: string) => {
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      setActiveSection(id)
    }
  }

  const businessTypeLabel = BUSINESS_TYPE_LABELS[onboarding.businessType]
  const geographyLabel = onboarding.serviceAreaText || onboarding.geography.replace('_', ' ')
  const HeaderIcon = BUSINESS_TYPE_ICON[onboarding.businessType] || Store

  const reportTitle =
    onboarding.planNameStyle === 'ninety_day_sprint'
      ? `90-Day Sprint Plan for ${onboarding.businessName}`
      : onboarding.planNameStyle === 'market_domination' && onboarding.geography === 'local'
        ? `Local Market Domination Plan for ${onboarding.businessName}`
        : `The ${onboarding.winMetric.replace('_', ' ')} 90-Day Growth Roadmap for ${onboarding.businessName}`

  const PIE_COLORS = ['#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']

  return (
    <div className="min-h-screen bg-slate-50/80 text-slate-900 report-container">
      {/* Top bar: back + actions — hidden when printing */}
      <div className="report-no-print sticky top-0 z-20 border-b border-slate-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="max-w-[1280px] mx-auto px-6 py-4 flex items-center justify-between">
          <Link
            href="/dashboard/plans"
            className="inline-flex items-center gap-2 text-slate-600 hover:text-purple-600 font-medium text-sm"
          >
            <ArrowLeft size={18} /> Back to plans
          </Link>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50"
            >
              <Printer size={16} /> Export PDF
            </button>
            <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 text-sm font-semibold hover:bg-slate-50">
              <Share2 size={16} /> Share
            </button>
            <Link
              href={`/dashboard/plans?edit=${planId}`}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 text-white text-sm font-semibold hover:bg-purple-700"
            >
              <Edit3 size={16} /> Edit Inputs
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left nav — hidden when printing */}
          <aside className="report-no-print hidden lg:block lg:col-span-3">
            <nav className="sticky top-28 space-y-1">
              <p className="px-3 text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Report</p>
              {NAV.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => scrollTo(id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left text-sm font-medium transition-colors ${
                    activeSection === id ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </button>
              ))}
            </nav>
          </aside>

          {/* Main content */}
          <main className="lg:col-span-9 space-y-10">
            {/* Cover — page 1 when printing */}
            <section id="cover" className="report-page-break scroll-mt-24 min-h-[80vh] flex flex-col justify-center py-16">
              <div className="bg-white rounded-3xl border border-slate-200 shadow-xl p-10 md:p-16 text-center">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-8">
                  <HeaderIcon size={40} className="text-white" />
                </div>
                <p className="text-xs font-bold text-slate-400 uppercase tracking-[0.2em] mb-4">Growth Roadmap</p>
                <h1 className="text-3xl md:text-5xl font-bold text-slate-900 tracking-tight mb-4">
                  {onboarding.businessName}
                </h1>
                <p className="text-lg md:text-xl text-slate-600 mb-2 max-w-xl mx-auto">{reportTitle}</p>
                <p className="text-sm text-slate-500">
                  Prepared by GoaLine · {reportDate || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </p>
                <p className="text-xs text-slate-400 mt-8">Confidential — for internal use</p>
              </div>
            </section>

            {/* Table of Contents */}
            <section id="toc" className="report-page-break scroll-mt-24">
              <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <FileText size={24} className="text-purple-500" /> Table of Contents
              </h2>
              <div className="bg-white rounded-2xl border border-slate-200 p-6 md:p-8 shadow-sm">
                <ul className="space-y-3 text-slate-700">
                  <li><a href="#money-map" className="font-medium text-purple-600 hover:underline">1. Executive Money Map</a> — Your target, trajectory & strategy at a glance</li>
                  <li><a href="#moat" className="font-medium text-purple-600 hover:underline">2. The Moat</a> — Who you serve & why you win</li>
                  <li><a href="#engine" className="font-medium text-purple-600 hover:underline">3. The Engine</a> — Channels, tactics & priorities</li>
                  <li><a href="#sprints" className="font-medium text-purple-600 hover:underline">4. 90-Day Sprints</a> — Phased action plan</li>
                  <li><a href="#budget-risks" className="font-medium text-purple-600 hover:underline">5. Budget & Resources</a> — Allocation, risks & DIY vs hire</li>
                  <li><a href="#next-steps" className="font-medium text-purple-600 hover:underline">6. Your Next Steps</a> — What to do this week & first actions</li>
                </ul>
              </div>
            </section>

            {/* View 1 — Executive Money Map */}
            <section id="money-map" className="report-page-break scroll-mt-24">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-8">
                <div>
                  <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">Section 1</p>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight mb-2">{reportTitle}</h1>
                  <p className="text-slate-500 font-medium text-base">
                    Built for a {businessTypeLabel} serving {geographyLabel}
                  </p>
                </div>
                <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-purple-100 text-purple-600 shrink-0">
                  <HeaderIcon size={28} />
                </div>
              </div>

              {/* KPI tiles */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                <Card>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">90-Day Target</p>
                  <p className="text-2xl font-bold text-slate-900">{moneyMap.targetDisplay}</p>
                  <p className="text-slate-500 text-sm mt-1">{URGENCY_LABELS[onboarding.urgency]}</p>
                </Card>
                <Card>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customers Needed (est.)</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {moneyMap.customersNeededLow}–{moneyMap.customersNeededHigh}
                  </p>
                  <p className="text-slate-500 text-xs mt-1">Based on revenue & close rate</p>
                </Card>
                <Card>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Leads Needed (est.)</p>
                  <p className="text-2xl font-bold text-slate-900">
                    {moneyMap.leadsNeededLow}–{moneyMap.leadsNeededHigh}/mo
                  </p>
                  <p className="text-slate-500 text-xs mt-1">Based on conversion confidence</p>
                </Card>
                <Card>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Plan Confidence</p>
                  <p className="text-2xl font-bold text-slate-900 capitalize">{moneyMap.confidence}</p>
                  <p className="text-slate-500 text-xs mt-1">Inputs: {moneyMap.confidenceInputsProvided}/{moneyMap.confidenceInputsTotal}</p>
                </Card>
              </div>

              {/* Trajectory chart */}
              <Card title="Current vs Plan Trajectory" className="mb-6">
                <p className="text-slate-500 text-sm mb-4">Where you are today vs where you need to be by day 90.</p>
                <div className="h-[280px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={trajectoryData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                      <XAxis dataKey="week" tick={{ fontSize: 12 }} tickFormatter={(v) => `Week ${v}`} />
                      <YAxis tick={{ fontSize: 12 }} />
                      <Tooltip
                        formatter={(value: number | undefined) => [value != null ? value.toFixed(1) : '—', '']}
                        labelFormatter={(l) => `Week ${l}`}
                        contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }}
                      />
                      <Line type="monotone" dataKey="current" name="Current trajectory" stroke="#94a3b8" strokeWidth={2} dot={{ r: 3 }} />
                      <Line type="monotone" dataKey="plan" name="Plan trajectory" stroke="#8b5cf6" strokeWidth={2} dot={{ r: 3 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* Monthly targets — required leads & customers per month */}
              <Card title="Monthly Targets (Next 90 Days)" className="mb-8">
                <p className="text-slate-500 text-sm mb-4">To hit your 90-day goal, aim for these numbers each month.</p>
                <div className="h-[240px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={monthlyTargetsData} margin={{ top: 8, right: 16, left: 0, bottom: 24 }} barCategoryGap="30%" barGap={8}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                      <YAxis tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 12, border: '1px solid #e2e8f0' }} />
                      <Bar dataKey="leads" name="Leads needed" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="customers" name="Customers needed" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>

              {/* One sentence strategy */}
              <Card className="mb-8 border-l-4 border-l-purple-500">
                <p className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">One-Sentence Strategy</p>
                <p className="text-xl font-medium text-slate-800 italic">&ldquo;{oneLiner}&rdquo;</p>
              </Card>

              {/* Quick wins */}
              <Card title="Quick Wins (Do This Week)">
                <ul className="space-y-3">
                  {quickWins.map((win, i) => (
                    <li key={i} className="flex items-start gap-3 text-slate-700">
                      <span className="w-6 h-6 rounded-full bg-green-100 text-green-700 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                      {win}
                    </li>
                  ))}
                </ul>
              </Card>
            </section>

            {/* View 2 — The Moat */}
            <section id="moat" className="report-page-break scroll-mt-24">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">Section 2</p>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Shield size={24} className="text-purple-500" /> The Moat
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card title="Best-Fit Customer">
                  <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-wrap">{onboarding.idealCustomerText || 'Your ideal customer (from your answers).'}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {onboarding.superpower.slice(0, 3).map((s) => (
                      <Chip key={s}>{s}</Chip>
                    ))}
                  </div>
                </Card>
                <Card title="Why You Win">
                  <p className="text-slate-600 text-sm mb-3">You win on:</p>
                  <ul className="space-y-2">
                    {onboarding.superpower.slice(0, 3).map((s, i) => (
                      <li key={i} className="flex items-center gap-2 text-slate-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                        {s.charAt(0).toUpperCase() + s.slice(1)}
                      </li>
                    ))}
                  </ul>
                  {(onboarding.proofAssets?.includes('reviews') || onboarding.proofAssets?.includes('case_studies')) && (
                    <p className="text-slate-500 text-xs mt-3">Proof: reviews & case studies reinforce this.</p>
                  )}
                </Card>
              </div>

              <Card title="Message Pillars" className="mb-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {onboarding.superpower.slice(0, 3).map((s, i) => (
                    <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-100">
                      <p className="font-bold text-slate-900 capitalize mb-1">{s}</p>
                      <p className="text-slate-600 text-sm">Use in headlines, CTAs, and social proof.</p>
                    </div>
                  ))}
                </div>
              </Card>

              <Card title="Channels to Avoid (for now)">
                <div className="flex flex-wrap gap-2">
                  {onboarding.channelsToAvoid?.length ? (
                    onboarding.channelsToAvoid.map((c) => <Chip key={c}>{c.replace('_', ' ')}</Chip>)
                  ) : (
                    <p className="text-slate-500 text-sm">None specified — we’ll focus on your chosen channels.</p>
                  )}
                </div>
                {onboarding.monthlyBudget === '0' && (
                  <p className="text-amber-700 text-sm mt-3 bg-amber-50 p-3 rounded-lg border border-amber-100">Paid ads are deprioritized with $0 budget; we’ll lean on organic and referrals.</p>
                )}
              </Card>
            </section>

            {/* View 3 — The Engine */}
            <section id="engine" className="report-page-break scroll-mt-24">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">Section 3</p>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Zap size={24} className="text-purple-500" /> The Engine
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Harvesting (capture existing intent)</h3>
                  <div className="space-y-4">
                    {channelCards.filter((c) => c.role === 'Harvest').map((c) => (
                      <Card key={c.id}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-bold text-slate-900">{c.name}</span>
                          <Chip>{c.role}</Chip>
                        </div>
                        <p className="text-slate-600 text-sm mb-3">{c.why}</p>
                        <ul className="text-slate-600 text-sm space-y-1 list-disc list-inside">
                          {c.tactics.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                        <p className="text-slate-500 text-xs mt-2">Cadence: {c.cadence} · KPI: {c.kpi}</p>
                      </Card>
                    ))}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-slate-800 mb-4">Generating (create demand)</h3>
                  <div className="space-y-4">
                    {channelCards.filter((c) => c.role === 'Generate').map((c) => (
                      <Card key={c.id}>
                        <div className="flex items-start justify-between gap-2 mb-2">
                          <span className="font-bold text-slate-900">{c.name}</span>
                          <Chip>{c.role}</Chip>
                        </div>
                        <p className="text-slate-600 text-sm mb-3">{c.why}</p>
                        <ul className="text-slate-600 text-sm space-y-1 list-disc list-inside">
                          {c.tactics.map((t, i) => (
                            <li key={i}>{t}</li>
                          ))}
                        </ul>
                        <p className="text-slate-500 text-xs mt-2">Cadence: {c.cadence} · KPI: {c.kpi}</p>
                      </Card>
                    ))}
                  </div>
                </div>
              </div>

              {/* Effort vs Impact */}
              <Card title="Effort vs Impact" className="mt-6">
                <p className="text-slate-500 text-sm mb-4">Higher impact with lower effort = prioritize first.</p>
                <div className="h-[280px] w-full min-h-[200px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={channelCards.map((c) => ({ name: c.name, effort: c.effort, impact: c.impact }))}
                      margin={{ top: 8, right: 16, left: 0, bottom: 60 }}
                      barCategoryGap="20%"
                      barGap={4}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis dataKey="name" tick={{ fontSize: 11 }} angle={-25} textAnchor="end" height={50} interval={0} />
                      <YAxis domain={[0, 4]} tick={{ fontSize: 12 }} allowDecimals={false} />
                      <Tooltip contentStyle={{ borderRadius: 12 }} formatter={(v: number) => [v, '']} />
                      <Bar dataKey="effort" name="Effort (1=low, 3=high)" fill="#94a3b8" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="impact" name="Impact (1=low, 3=high)" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </Card>
            </section>

            {/* View 4 — 90-Day Sprints */}
            <section id="sprints" className="report-page-break scroll-mt-24">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">Section 4</p>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <Calendar size={24} className="text-purple-500" /> 90-Day Sprints
              </h2>

              <div className="space-y-8">
                <Card title="Sprint 1 (Days 0–30): Fix the Leaks">
                  <ul className="space-y-3">
                    {sprints.phase1.map((t, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="w-6 h-6 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                        <div>
                          <p className="font-bold text-slate-900">{t.title}</p>
                          <p className="text-slate-600 text-sm">{t.description}</p>
                          <p className="text-slate-500 text-xs mt-1">Owner: {t.owner} · Effort: {t.effort}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card title="Sprint 2 (Days 31–60): Turn on the Faucet">
                  <ul className="space-y-3">
                    {sprints.phase2.map((t, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                        <div>
                          <p className="font-bold text-slate-900">{t.title}</p>
                          <p className="text-slate-600 text-sm">{t.description}</p>
                          <p className="text-slate-500 text-xs mt-1">Owner: {t.owner} · Effort: {t.effort}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
                <Card title="Sprint 3 (Days 61–90): Scale Efficiency">
                  <ul className="space-y-3">
                    {sprints.phase3.map((t, i) => (
                      <li key={i} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                        <span className="w-6 h-6 rounded-full bg-violet-100 text-violet-700 flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                        <div>
                          <p className="font-bold text-slate-900">{t.title}</p>
                          <p className="text-slate-600 text-sm">{t.description}</p>
                          <p className="text-slate-500 text-xs mt-1">Owner: {t.owner} · Effort: {t.effort}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>
            </section>

            {/* View 5 — Budget, KPIs, Resources & Risks */}
            <section id="budget-risks" className="report-page-break scroll-mt-24">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">Section 5</p>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <DollarSign size={24} className="text-purple-500" /> Budget, Measurement & Risks
              </h2>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <Card title="Budget Allocation">
                  <div className="h-[220px] w-full mb-4">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={budgetSlices}
                          dataKey="percentage"
                          nameKey="label"
                          cx="50%"
                          cy="50%"
                          outerRadius={80}
                          label={({ name, value }) => `${String(name).slice(0, 12)} ${value}%`}
                        >
                          {budgetSlices.map((_, i) => (
                            <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(v: number | undefined) => [v != null ? `${v}%` : '—', '']} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <ul className="space-y-2 text-sm text-slate-600">
                    {budgetSlices.map((s, i) => (
                      <li key={i}>
                        <strong>{s.label}</strong>: {s.amount} — {s.rationale}
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card title="Assumptions (editable later)">
                  <ul className="space-y-2 text-sm text-slate-600">
                    <li>Avg revenue/customer: band from questionnaire</li>
                    <li>Demand baseline: {onboarding.demandLevel}</li>
                    <li>Conversion confidence: {onboarding.conversionConfidence}</li>
                    <li>Time & budget: {onboarding.weeklyTime}, {onboarding.monthlyBudget}</li>
                  </ul>
                  <p className="text-slate-500 text-xs mt-3">Edit inputs above to refine these.</p>
                </Card>
              </div>

              <Card title="Risks & Mitigations" className="mb-6">
                {risks.length ? (
                  <ul className="space-y-4">
                    {risks.map((r, i) => (
                      <li key={i} className="flex gap-3 p-4 rounded-xl bg-amber-50/50 border border-amber-100">
                        <AlertTriangle className="text-amber-600 shrink-0 mt-0.5" size={18} />
                        <div>
                          <p className="font-bold text-slate-900">{r.risk}</p>
                          <p className="text-slate-600 text-sm">{r.mitigation}</p>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-slate-500 text-sm">No major risks flagged from your inputs.</p>
                )}
              </Card>

              <Card title="DIY vs Hire">
                {onboarding.weeklyTime === '1_2' && (
                  <p className="text-slate-600 text-sm mb-3">With 1–2 hrs/week, focus on 1–2 channels only; consider a contractor for execution.</p>
                )}
                {onboarding.weeklyTime === '10_plus' && (
                  <p className="text-slate-600 text-sm mb-3">With 10+ hrs/week you can own most execution; use contractors for specialized work (e.g. ads, design).</p>
                )}
                <p className="text-slate-500 text-sm">Hybrid: You lead strategy and one channel; outsource the rest as budget allows.</p>
              </Card>
            </section>

            {/* Your Next Steps — CTA section */}
            <section id="next-steps" className="scroll-mt-24">
              <p className="text-xs font-bold text-purple-600 uppercase tracking-widest mb-2">Section 6</p>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-6 flex items-center gap-2">
                <CheckCircle2 size={24} className="text-green-500" /> Your Next Steps
              </h2>
              <p className="text-slate-600 mb-8 max-w-2xl">
                This report is only as good as the action you take. Use the sections below as your checklist. Start with &ldquo;Do This Week&rdquo; and then move into your first three actions.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
                <Card className="border-2 border-green-200 bg-green-50/30" title="Do This Week">
                  <p className="text-slate-600 text-sm mb-4">Pick at least one. Complete all three if you can.</p>
                  <ul className="space-y-4">
                    {quickWins.map((win, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-green-500 text-white flex items-center justify-center text-sm font-bold shrink-0">✓</span>
                        <span className="text-slate-800 font-medium">{win}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="border-2 border-purple-200 bg-purple-50/30" title="Your First 3 Actions">
                  <p className="text-slate-600 text-sm mb-4">From Sprint 1 — do these in order.</p>
                  <ol className="space-y-4">
                    {sprints.phase1.slice(0, 3).map((t, i) => (
                      <li key={i} className="flex items-start gap-3">
                        <span className="w-7 h-7 rounded-full bg-purple-600 text-white flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                        <div>
                          <p className="font-bold text-slate-900">{t.title}</p>
                          <p className="text-slate-600 text-sm">{t.description}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </Card>
              </div>

              <Card className="mb-6 border-l-4 border-l-purple-500" title="Key Metrics to Track">
                <p className="text-slate-600 text-sm mb-4">Check these at least weekly. Without numbers, you won&apos;t know if the plan is working.</p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-slate-700">
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Leads per month</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Conversion rate (visit → action)</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> Customers per month</li>
                  <li className="flex items-center gap-2"><span className="w-1.5 h-1.5 rounded-full bg-purple-500" /> {moneyMap.targetDisplay} (90-day)</li>
                </ul>
              </Card>

              <Card className="bg-slate-900 text-white border-0" title="What Success Looks Like">
                <p className="text-slate-200 text-sm mb-4">
                  By day 90 you should have: tracking in place, a clear offer and follow-up process, at least one channel actively generating leads, and proof (reviews or case studies) on your site. Revisit this report each month and adjust as you learn.
                </p>
                <p className="text-purple-300 font-semibold text-sm">
                  Need help executing? Return to GoaLine to update your plan or connect with experts who can implement this roadmap for you.
                </p>
              </Card>
            </section>
          </main>
        </div>
      </div>
    </div>
  )
}
