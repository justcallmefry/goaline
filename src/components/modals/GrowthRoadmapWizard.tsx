'use client'

import React, { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import {
  ArrowRight,
  ArrowLeft,
  Loader2,
  Sparkles,
  Building2,
  Briefcase,
  Target,
  TrendingUp,
  Users,
  Shield,
  Zap,
  FolderOpen,
  FileCheck,
} from 'lucide-react'
import { createBrowserClient } from '@supabase/ssr'
import type { GoaLineOnboarding } from '@/types/goaline-onboarding'
import { saveGrowthRoadmapAction } from '@/app/actions/growth-roadmap-actions'

const STORAGE_KEY = 'goaline_onboarding_draft'

const STEP_META = [
  { id: 0, title: 'Basics', icon: Building2 },
  { id: 1, title: 'Business & Offer', icon: Briefcase },
  { id: 2, title: 'Outcome Target', icon: Target },
  { id: 3, title: 'Unit Economics', icon: TrendingUp },
  { id: 4, title: 'Audience & Moat', icon: Users },
  { id: 5, title: 'Constraints & Channels', icon: Zap },
  { id: 6, title: 'Assets', icon: FolderOpen },
  { id: 7, title: 'Final', icon: FileCheck },
] as const

const TOTAL_STEPS = STEP_META.length

const defaultOnboarding: GoaLineOnboarding = {
  businessName: '',
  website: '',
  businessType: 'local_service',
  offerDescription: '',

  primaryOutcome: 'more_leads',
  winMetric: 'revenue',
  target90Day: { value: 30000, unit: '$' },
  urgency: 'steady',

  avgRevenuePerCustomerBand: '250_500',
  priceRangeBand: undefined,

  purchasePath: 'call',
  demandLevel: 'some',
  conversionConfidence: 'medium',

  customerType: 'both',
  idealCustomerText: '',
  geography: 'local',
  serviceAreaText: '',

  superpower: [],
  proofAssets: [],

  fuelChoice: 'both',
  weeklyTime: '3_5',
  monthlyBudget: 'lt_500',

  channelPreferences: [],
  channelsToAvoid: [],

  customerList: 'no',
  existingAssets: [],

  planNameStyle: 'growth_roadmap',
  biggestChallenge: 'no_strategy',
}

function getTargetUnit(winMetric: GoaLineOnboarding['winMetric']): string {
  switch (winMetric) {
    case 'revenue':
      return '$'
    case 'leads':
      return 'leads'
    case 'bookings':
      return 'bookings'
    case 'orders':
      return 'orders'
    case 'subscribers':
      return 'subscribers'
    case 'traffic':
      return 'visits'
    default:
      return '$'
  }
}

export function GrowthRoadmapWizard({
  onClose,
  onSuccess,
  requireAuthToSave,
  hasUser,
  signInNextUrl,
}: {
  onClose: () => void
  onSuccess?: () => void
  /** When true and hasUser is false, show "Sign in to save" at submit instead of calling save */
  requireAuthToSave?: boolean
  hasUser?: boolean
  /** Redirect after sign-in (e.g. /plan?save=1). Auth callback will use next= this. */
  signInNextUrl?: string
}) {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [showSignInGate, setShowSignInGate] = useState(false)
  const [data, setData] = useState<GoaLineOnboarding>(() => {
    if (typeof window === 'undefined') return defaultOnboarding
    try {
      const raw = localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const parsed = JSON.parse(raw) as Partial<GoaLineOnboarding>
        return { ...defaultOnboarding, ...parsed } as GoaLineOnboarding
      }
    } catch (_) {}
    return defaultOnboarding
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const update = useCallback(<K extends keyof GoaLineOnboarding>(key: K, value: GoaLineOnboarding[K]) => {
    setData((prev) => ({ ...prev, [key]: value }))
    setError(null)
  }, [])

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
    } catch (_) {}
  }, [data])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!data.businessName?.trim()) {
      setError('Business name is required.')
      return
    }
    if (requireAuthToSave && !hasUser && signInNextUrl) {
      setShowSignInGate(true)
      return
    }
    setIsSubmitting(true)
    setError(null)
    try {
      const result = await saveGrowthRoadmapAction(data)
      try {
        localStorage.removeItem(STORAGE_KEY)
      } catch (_) {}
      if (result?.error) {
        setError(result.error)
        return
      }
      if (result?.planId) {
        onSuccess?.()
        router.push(`/dashboard/plans/${result.planId}`)
        return
      }
      setError('Something went wrong. Please try again.')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleSignInToSave = async () => {
    if (!signInNextUrl) return
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    )
    const redirectTo = `${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback?next=${encodeURIComponent(signInNextUrl)}`
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo, queryParams: { access_type: 'offline', prompt: 'consent' } },
    })
  }

  const canProceed = (): boolean => {
    switch (step) {
      case 0:
        return !!data.businessName?.trim()
      case 1:
        return !!data.offerDescription?.trim() && !!data.businessType && !!data.primaryOutcome
      case 2:
        const t = data.target90Day
        return !!data.winMetric && (t?.value != null || (t?.low != null && t?.high != null))
      case 3:
        if (data.avgRevenuePerCustomerBand === 'not_sure') return !!data.priceRangeBand
        return !!data.purchasePath && !!data.demandLevel && !!data.conversionConfidence
      case 4:
        if ((data.geography === 'local' || data.geography === 'regional') && !data.serviceAreaText?.trim()) return false
        return !!data.idealCustomerText?.trim() && data.superpower.length > 0 && data.proofAssets.length > 0
      case 5:
        return data.channelPreferences.length > 0
      case 6:
        return data.existingAssets.length > 0
      case 7:
        return !!data.biggestChallenge
      default:
        return true
    }
  }

  const goNext = () => {
    if (step < TOTAL_STEPS - 1 && canProceed()) setStep((s) => s + 1)
  }
  const goPrev = () => setStep((s) => Math.max(0, s - 1))

  const Progress = () => (
    <div className="w-full bg-slate-100 h-1">
      <div
        className="bg-purple-600 h-1 transition-all duration-300"
        style={{ width: `${((step + 1) / TOTAL_STEPS) * 100}%` }}
      />
    </div>
  )

  const btn = (label: string, selected: boolean) =>
    `p-3 rounded-xl border text-sm font-bold text-left ${selected ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200 text-slate-600 hover:border-purple-200'}`

  return (
    <div className="fixed inset-0 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="bg-slate-900 p-6 shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white/10 rounded-xl flex items-center justify-center">
                {React.createElement(STEP_META[step].icon, { size: 20, className: 'text-purple-400' })}
              </div>
              <div>
                <h2 className="text-lg font-black text-white uppercase tracking-wide">{STEP_META[step].title}</h2>
                <p className="text-slate-400 text-xs">Step {step + 1} of {TOTAL_STEPS}</p>
              </div>
            </div>
            <button type="button" onClick={onClose} className="text-slate-400 hover:text-white text-sm font-bold uppercase tracking-wide">
              Close
            </button>
          </div>
        </div>
        <Progress />

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 overflow-y-auto space-y-6">
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm font-medium">
                {error}
              </div>
            )}

            {showSignInGate ? (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-200 text-center py-6">
                <div className="w-16 h-16 rounded-2xl bg-green-100 flex items-center justify-center mx-auto">
                  <Sparkles size={32} className="text-green-600" />
                </div>
                <h3 className="text-xl font-bold text-white">Your plan is ready</h3>
                <p className="text-slate-300 text-sm max-w-md mx-auto">
                  Sign in with Google to save your roadmap and view your full report with next steps, charts, and PDF export.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                  <button
                    type="button"
                    onClick={() => setShowSignInGate(false)}
                    className="px-6 py-3 bg-white/10 border border-white/20 text-white rounded-xl font-bold text-sm hover:bg-white/20"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={handleSignInToSave}
                    className="px-6 py-3 bg-white text-slate-900 rounded-xl font-bold text-sm flex items-center justify-center gap-2 hover:bg-slate-100 mx-auto"
                  >
                    <svg className="w-5 h-5" viewBox="0 0 24 24"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                    Sign in with Google
                  </button>
                </div>
              </div>
            ) : (
              <>
            {/* Step 0 — Basics */}
            {step === 0 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What’s your business name?</label>
                  <input
                    type="text"
                    placeholder="e.g., Summit Dental Studio"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                    value={data.businessName}
                    onChange={(e) => update('businessName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Do you have a website? (optional)</label>
                  <input
                    type="url"
                    placeholder="https://…"
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                    value={data.website ?? ''}
                    onChange={(e) => update('website', e.target.value || undefined)}
                  />
                </div>
              </div>
            )}

            {/* Step 1 — Business Model & Offer */}
            {step === 1 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Which best describes your business?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: 'local_service' as const, l: 'Local service (calls / bookings)' },
                      { v: 'ecommerce' as const, l: 'Ecommerce (online purchases)' },
                      { v: 'b2b_service' as const, l: 'B2B service (quotes / proposals)' },
                      { v: 'saas' as const, l: 'SaaS / subscription' },
                      { v: 'creator' as const, l: 'Creator / personal brand' },
                      { v: 'nonprofit' as const, l: 'Nonprofit' },
                      { v: 'other' as const, l: 'Other' },
                    ].map(({ v, l }) => (
                      <button key={v} type="button" onClick={() => update('businessType', v)} className={btn(l, data.businessType === v)}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">In one or two sentences, what do you sell and who is it for?</label>
                  <textarea
                    placeholder="We help… / We sell…"
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    value={data.offerDescription}
                    onChange={(e) => update('offerDescription', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What’s the primary outcome you want from marketing?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: 'more_leads' as const, l: 'More leads' },
                      { v: 'more_bookings' as const, l: 'More bookings' },
                      { v: 'more_sales' as const, l: 'More sales' },
                      { v: 'more_subscribers' as const, l: 'More subscribers' },
                      { v: 'brand_awareness' as const, l: 'More awareness (top of funnel)' },
                      { v: 'launch' as const, l: 'Launching something new' },
                    ].map(({ v, l }) => (
                      <button key={v} type="button" onClick={() => update('primaryOutcome', v)} className={btn(l, data.primaryOutcome === v)}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 2 — Outcome Target (Money Map) */}
            {step === 2 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">In the next 90 days, what would make this feel like a win?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: 'revenue' as const, l: 'Revenue' },
                      { v: 'leads' as const, l: 'Leads' },
                      { v: 'bookings' as const, l: 'Bookings' },
                      { v: 'orders' as const, l: 'Orders' },
                      { v: 'subscribers' as const, l: 'Subscribers' },
                      { v: 'traffic' as const, l: 'Website traffic (awareness)' },
                    ].map(({ v, l }) => (
                      <button
                        key={v}
                        type="button"
                        onClick={() => {
                          update('winMetric', v)
                          update('target90Day', { ...data.target90Day, unit: getTargetUnit(v) })
                        }}
                        className={btn(l, data.winMetric === v)}
                      >
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What’s your target in 90 days?</label>
                  <p className="text-slate-500 text-xs mb-2">A rough estimate is fine — you can edit assumptions later.</p>
                  {getTargetUnit(data.winMetric) === '$' ? (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        placeholder="e.g. 30000"
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                        value={data.target90Day?.value ?? ''}
                        onChange={(e) => update('target90Day', { ...data.target90Day, value: e.target.value ? Number(e.target.value) : undefined, unit: '$' })}
                      />
                      <span className="self-center text-slate-500">or range:</span>
                      <input
                        type="number"
                        min={0}
                        placeholder="Low"
                        className="w-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                        value={data.target90Day?.low ?? ''}
                        onChange={(e) => update('target90Day', { ...data.target90Day, low: e.target.value ? Number(e.target.value) : undefined, unit: '$' })}
                      />
                      <input
                        type="number"
                        min={0}
                        placeholder="High"
                        className="w-24 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800"
                        value={data.target90Day?.high ?? ''}
                        onChange={(e) => update('target90Day', { ...data.target90Day, high: e.target.value ? Number(e.target.value) : undefined, unit: '$' })}
                      />
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <input
                        type="number"
                        min={0}
                        placeholder="e.g. 50"
                        className="flex-1 px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium"
                        value={data.target90Day?.value ?? ''}
                        onChange={(e) => update('target90Day', { ...data.target90Day, value: e.target.value ? Number(e.target.value) : undefined, unit: getTargetUnit(data.winMetric) })}
                      />
                      <span className="self-center text-slate-500">{getTargetUnit(data.winMetric)}</span>
                    </div>
                  )}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">How quickly do you need results?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: 'asap' as const, l: 'ASAP (0–30 days)' },
                      { v: 'soon' as const, l: 'Soon (30–60 days)' },
                      { v: 'steady' as const, l: 'Steady (60–90 days)' },
                      { v: 'long_term' as const, l: 'Long-term (90+ days)' },
                    ].map(({ v, l }) => (
                      <button key={v} type="button" onClick={() => update('urgency', v)} className={btn(l, data.urgency === v)}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 3 — Unit Economics */}
            {step === 3 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">About how much revenue does one new customer typically generate?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: 'lt_100' as const, l: 'Under $100' },
                      { v: '100_250' as const, l: '$100–$250' },
                      { v: '250_500' as const, l: '$250–$500' },
                      { v: '500_1000' as const, l: '$500–$1,000' },
                      { v: '1000_5000' as const, l: '$1,000–$5,000' },
                      { v: '5000_plus' as const, l: '$5,000+' },
                      { v: 'not_sure' as const, l: 'Not sure' },
                    ].map(({ v, l }) => (
                      <button key={v} type="button" onClick={() => update('avgRevenuePerCustomerBand', v)} className={btn(l, data.avgRevenuePerCustomerBand === v)}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                {data.avgRevenuePerCustomerBand === 'not_sure' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">No problem — what’s your typical price range?</label>
                    <div className="grid grid-cols-2 gap-2">
                      {[
                        { v: 'lt_50' as const, l: 'Under $50' },
                        { v: '50_150' as const, l: '$50–$150' },
                        { v: '150_500' as const, l: '$150–$500' },
                        { v: '500_2000' as const, l: '$500–$2,000' },
                        { v: '2000_plus' as const, l: '$2,000+' },
                      ].map(({ v, l }) => (
                        <button key={v} type="button" onClick={() => update('priceRangeBand', v)} className={btn(l, data.priceRangeBand === v)}>
                          {l}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">How do customers usually buy from you?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: 'call' as const, l: 'They call me' },
                      { v: 'book_online' as const, l: 'They book online' },
                      { v: 'buy_online' as const, l: 'They buy online' },
                      { v: 'request_quote' as const, l: 'They request a quote / proposal' },
                      { v: 'in_person' as const, l: 'Mostly in person' },
                    ].map(({ v, l }) => (
                      <button key={v} type="button" onClick={() => update('purchasePath', v)} className={btn(l, data.purchasePath === v)}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Which best describes your current situation?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: 'starting' as const, l: 'Just starting / no steady flow yet' },
                      { v: 'some' as const, l: 'Some leads but inconsistent' },
                      { v: 'steady' as const, l: 'Steady leads — want more' },
                      { v: 'busy' as const, l: 'Busy — want higher quality or higher value' },
                    ].map(({ v, l }) => (
                      <button key={v} type="button" onClick={() => update('demandLevel', v)} className={btn(l, data.demandLevel === v)}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">How confident are you in your ability to convert leads into customers?</label>
                  <div className="flex gap-2">
                    {[
                      { v: 'high' as const, l: 'High (we close well)' },
                      { v: 'medium' as const, l: 'Medium' },
                      { v: 'low' as const, l: 'Low (we need help here)' },
                    ].map(({ v, l }) => (
                      <button key={v} type="button" onClick={() => update('conversionConfidence', v)} className={`flex-1 py-3 rounded-xl border text-sm font-bold ${data.conversionConfidence === v ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200 text-slate-600'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Step 4 — Audience, Geography, Moat */}
            {step === 4 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Who do you primarily sell to?</label>
                  <div className="flex gap-2">
                    {[
                      { v: 'consumer' as const, l: 'Consumers (B2C)' },
                      { v: 'business' as const, l: 'Businesses (B2B)' },
                      { v: 'both' as const, l: 'Both' },
                    ].map(({ v, l }) => (
                      <button key={v} type="button" onClick={() => update('customerType', v)} className={`flex-1 py-3 rounded-xl border text-sm font-bold ${data.customerType === v ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200 text-slate-600'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Describe your ideal customer (the best-fit people you want more of).</label>
                  <textarea
                    placeholder="Industry, role, age, needs, pain points…"
                    rows={3}
                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 outline-none resize-none"
                    value={data.idealCustomerText}
                    onChange={(e) => update('idealCustomerText', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Where do you serve customers?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: 'local' as const, l: 'Local (specific city/area)' },
                      { v: 'regional' as const, l: 'Regional (multi-city/state)' },
                      { v: 'national' as const, l: 'Nationwide' },
                      { v: 'online_only' as const, l: 'Online only' },
                    ].map(({ v, l }) => (
                      <button key={v} type="button" onClick={() => update('geography', v)} className={btn(l, data.geography === v)}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                {(data.geography === 'local' || data.geography === 'regional') && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What city/area do you want to dominate?</label>
                    <input
                      type="text"
                      placeholder="e.g., Lehi, UT + 15 miles"
                      className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 font-medium focus:ring-2 focus:ring-purple-500 outline-none"
                      value={data.serviceAreaText ?? ''}
                      onChange={(e) => update('serviceAreaText', e.target.value)}
                      required
                    />
                  </div>
                )}
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What do customers love most about you? (pick up to 3)</label>
                  <div className="flex flex-wrap gap-2">
                    {(['speed', 'quality', 'price', 'service', 'expertise', 'convenience', 'trust', 'results'] as const).map((opt) => {
                      const selected = data.superpower.includes(opt)
                      const atMax = data.superpower.length >= 3 && !selected
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => {
                            if (selected) update('superpower', data.superpower.filter((x) => x !== opt))
                            else if (!atMax) update('superpower', [...data.superpower, opt])
                          }}
                          className={`px-4 py-2 rounded-xl border text-sm font-bold capitalize ${selected ? 'bg-purple-50 border-purple-500 text-purple-700' : atMax ? 'border-slate-100 text-slate-400 cursor-default' : 'border-slate-200 text-slate-600'}`}
                        >
                          {opt}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Which proof assets do you have today?</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { v: 'reviews' as const, l: 'Google/Yelp reviews' },
                      { v: 'testimonials' as const, l: 'Customer testimonials' },
                      { v: 'case_studies' as const, l: 'Case studies' },
                      { v: 'before_after' as const, l: 'Before/after' },
                      { v: 'press' as const, l: 'Press / awards' },
                      { v: 'social_following' as const, l: 'Strong social following' },
                      { v: 'none' as const, l: 'Not yet' },
                    ].map(({ v, l }) => {
                      const selected = data.proofAssets.includes(v)
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => {
                            if (v === 'none') update('proofAssets', ['none'])
                            else update('proofAssets', selected ? data.proofAssets.filter((x) => x !== v) : [...data.proofAssets.filter((x) => x !== 'none'), v])
                          }}
                          className={`px-4 py-2 rounded-xl border text-sm font-bold ${selected ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200 text-slate-600'}`}
                        >
                          {l}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 5 — Constraints & Channels */}
            {step === 5 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Growth requires fuel. What do you have more of right now?</label>
                  <div className="flex gap-2">
                    {[
                      { v: 'time' as const, l: 'Time (I can grind, low budget)' },
                      { v: 'money' as const, l: 'Money (I can spend, low time)' },
                      { v: 'both' as const, l: 'Both' },
                    ].map(({ v, l }) => (
                      <button key={v} type="button" onClick={() => update('fuelChoice', v)} className={`flex-1 py-3 rounded-xl border text-sm font-bold ${data.fuelChoice === v ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200 text-slate-600'}`}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">How much time can you personally commit each week?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: '1_2' as const, l: '1–2 hours' },
                      { v: '3_5' as const, l: '3–5 hours' },
                      { v: '6_10' as const, l: '6–10 hours' },
                      { v: '10_plus' as const, l: '10+ hours' },
                    ].map(({ v, l }) => (
                      <button key={v} type="button" onClick={() => update('weeklyTime', v)} className={btn(l, data.weeklyTime === v)}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What monthly budget can you put toward marketing (ads/tools/help)?</label>
                  <p className="text-slate-500 text-xs mb-2">Pick a range — you can change this later.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: '0' as const, l: '$0 (bootstrapped)' },
                      { v: 'lt_500' as const, l: 'Under $500/mo' },
                      { v: '500_1500' as const, l: '$500–$1,500/mo' },
                      { v: '1500_5000' as const, l: '$1,500–$5,000/mo' },
                      { v: '5000_plus' as const, l: '$5,000+/mo' },
                    ].map(({ v, l }) => (
                      <button key={v} type="button" onClick={() => update('monthlyBudget', v)} className={btn(l, data.monthlyBudget === v)}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Which channels do you want to prioritize? (pick any)</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { v: 'seo' as const, l: 'SEO' },
                      { v: 'google_ads' as const, l: 'Google Ads' },
                      { v: 'meta_ads' as const, l: 'Facebook/Instagram Ads' },
                      { v: 'tiktok' as const, l: 'TikTok' },
                      { v: 'linkedin' as const, l: 'LinkedIn' },
                      { v: 'email' as const, l: 'Email marketing' },
                      { v: 'content' as const, l: 'Content (blogs/video)' },
                      { v: 'partnerships' as const, l: 'Partnerships' },
                      { v: 'events' as const, l: 'Events / community' },
                      { v: 'referrals' as const, l: 'Referral program' },
                    ].map(({ v, l }) => {
                      const selected = data.channelPreferences.includes(v)
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => update('channelPreferences', selected ? data.channelPreferences.filter((x) => x !== v) : [...data.channelPreferences, v])}
                          className={`px-4 py-2 rounded-xl border text-sm font-bold ${selected ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200 text-slate-600'}`}
                        >
                          {l}
                        </button>
                      )
                    })}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Any channels you want to avoid for now? (optional)</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { v: 'seo' as const, l: 'SEO' },
                      { v: 'google_ads' as const, l: 'Google Ads' },
                      { v: 'meta_ads' as const, l: 'Meta Ads' },
                      { v: 'tiktok' as const, l: 'TikTok' },
                      { v: 'linkedin' as const, l: 'LinkedIn' },
                      { v: 'email' as const, l: 'Email' },
                      { v: 'content' as const, l: 'Content' },
                      { v: 'partnerships' as const, l: 'Partnerships' },
                      { v: 'events' as const, l: 'Events' },
                      { v: 'referrals' as const, l: 'Referrals' },
                    ].map(({ v, l }) => {
                      const selected = data.channelsToAvoid?.includes(v)
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => update('channelsToAvoid', selected ? (data.channelsToAvoid ?? []).filter((x) => x !== v) : [...(data.channelsToAvoid ?? []), v])}
                          className={`px-4 py-2 rounded-xl border text-sm font-bold ${selected ? 'bg-amber-50 border-amber-400 text-amber-800' : 'border-slate-200 text-slate-600'}`}
                        >
                          {l}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 6 — Assets */}
            {step === 6 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Do you have a list of past customers or leads (email/SMS)?</label>
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { v: 'yes_big' as const, l: 'Yes (1,000+ contacts)' },
                      { v: 'yes_small' as const, l: 'Yes (under 1,000)' },
                      { v: 'no' as const, l: 'No' },
                      { v: 'not_sure' as const, l: 'Not sure' },
                    ].map(({ v, l }) => (
                      <button key={v} type="button" onClick={() => update('customerList', v)} className={btn(l, data.customerList === v)}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What do you already have in place?</label>
                  <div className="flex flex-wrap gap-2">
                    {[
                      { v: 'website' as const, l: 'Website' },
                      { v: 'google_business_profile' as const, l: 'Google Business Profile' },
                      { v: 'social_accounts' as const, l: 'Social accounts' },
                      { v: 'analytics' as const, l: 'Analytics / tracking' },
                      { v: 'crm' as const, l: 'CRM' },
                      { v: 'email_platform' as const, l: 'Email platform' },
                      { v: 'past_ads' as const, l: 'Past ads run' },
                      { v: 'content_library' as const, l: 'Content library' },
                      { v: 'none' as const, l: 'None of these yet' },
                    ].map(({ v, l }) => {
                      const selected = data.existingAssets.includes(v)
                      return (
                        <button
                          key={v}
                          type="button"
                          onClick={() => {
                            if (v === 'none') update('existingAssets', ['none'])
                            else update('existingAssets', selected ? data.existingAssets.filter((x) => x !== v) : [...data.existingAssets.filter((x) => x !== 'none'), v])
                          }}
                          className={`px-4 py-2 rounded-xl border text-sm font-bold ${selected ? 'bg-purple-50 border-purple-500 text-purple-700' : 'border-slate-200 text-slate-600'}`}
                        >
                          {l}
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            )}

            {/* Step 7 — Final */}
            {step === 7 && (
              <div className="space-y-6 animate-in slide-in-from-right-4 duration-200">
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">How should we title your roadmap? (optional)</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { v: 'growth_roadmap' as const, l: 'The [Target] Growth Roadmap' },
                      { v: 'ninety_day_sprint' as const, l: '90-Day Sprint Plan' },
                      ...(data.geography === 'local' ? [{ v: 'market_domination' as const, l: 'Local Market Domination Plan' }] : []),
                    ].map(({ v, l }) => (
                      <button key={v} type="button" onClick={() => update('planNameStyle', v)} className={btn(l, data.planNameStyle === v)}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">What’s your biggest marketing challenge right now?</label>
                  <div className="grid grid-cols-1 gap-2">
                    {[
                      { v: 'no_strategy' as const, l: "I don't know what to do first" },
                      { v: 'no_leads' as const, l: 'Not enough leads' },
                      { v: 'low_conversion' as const, l: "Leads aren't converting" },
                      { v: 'no_time' as const, l: 'No time to do marketing' },
                      { v: 'no_content' as const, l: "I don't have content" },
                      { v: 'tracking' as const, l: "I can't measure what's working" },
                      { v: 'competitive' as const, l: 'Too much competition' },
                    ].map(({ v, l }) => (
                      <button key={v} type="button" onClick={() => update('biggestChallenge', v)} className={btn(l, data.biggestChallenge === v)}>
                        {l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
              </>
            )}
          </div>

          {!showSignInGate && (
          <div className="p-6 border-t border-slate-100 flex gap-3 shrink-0">
            {step > 0 && (
              <button
                type="button"
                onClick={goPrev}
                className="px-6 py-3 bg-white border border-slate-200 text-slate-600 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-slate-50"
              >
                <ArrowLeft size={18} />
              </button>
            )}
            {step < TOTAL_STEPS - 1 ? (
              <button
                type="button"
                onClick={goNext}
                disabled={!canProceed()}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next <ArrowRight size={18} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !canProceed()}
                className="flex-1 py-3 bg-purple-600 text-white rounded-xl font-bold text-sm uppercase tracking-wide flex items-center justify-center gap-2 hover:bg-purple-700 disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={20} /> : <Sparkles size={20} />}
                {isSubmitting ? 'Creating plan…' : 'Create my roadmap'}
              </button>
            )}
          </div>
          )}
        </form>
      </div>
    </div>
  )
}
