/**
 * Calculations and derived data for the Bento Growth Roadmap report.
 * Defensible v1 heuristics from GoaLineOnboarding.
 */

import type { GoaLineOnboarding } from '@/types/goaline-onboarding'

// —— Revenue/customer midpoints (for customers-needed math) ——
const AVG_REVENUE_MIDPOINT: Record<string, number> = {
  lt_100: 75,
  '100_250': 175,
  '250_500': 375,
  '500_1000': 750,
  '1000_5000': 3000,
  '5000_plus': 8000,
  not_sure: 400,
}

const PRICE_RANGE_MIDPOINT: Record<string, number> = {
  lt_50: 25,
  '50_150': 100,
  '150_500': 325,
  '500_2000': 1250,
  '2000_plus': 4000,
}

// —— Conversion rate by confidence (lead → customer) ——
const CONV_RATE: Record<GoaLineOnboarding['conversionConfidence'], { low: number; high: number }> = {
  high: { low: 0.25, high: 0.4 },
  medium: { low: 0.1, high: 0.25 },
  low: { low: 0.03, high: 0.1 },
}

// —— Baseline monthly “customers” or “leads” by demand level (for trajectory) ——
const BASELINE_MONTHLY: Record<GoaLineOnboarding['demandLevel'], { low: number; high: number }> = {
  starting: { low: 0, high: 5 },
  some: { low: 5, high: 20 },
  steady: { low: 20, high: 50 },
  busy: { low: 50, high: 100 },
}

export type ConfidenceLevel = 'high' | 'medium' | 'low'

export interface MoneyMapComputed {
  targetDisplay: string
  targetValue: number
  targetUnit: string
  customersNeededLow: number
  customersNeededHigh: number
  leadsNeededLow: number
  leadsNeededHigh: number
  /** e.g. "$25–$80" cost per lead given budget and leads needed */
  cplRange: string
  confidence: ConfidenceLevel
  confidenceInputsProvided: number
  confidenceInputsTotal: number
}

function getTargetValueAndUnit(o: GoaLineOnboarding): { value: number; unit: string; display: string } {
  const t = o.target90Day
  const unit = t?.unit === '$' ? '$' : t?.unit || 'leads'
  let value = 0
  let display = ''
  if (t?.value != null) {
    value = t.value
    display = unit === '$' ? `$${value.toLocaleString()}` : `${value} ${unit}`
  } else if (t?.low != null && t?.high != null) {
    value = (t.low + t.high) / 2
    display = unit === '$' ? `$${t.low.toLocaleString()}–$${t.high.toLocaleString()}` : `${t.low}–${t.high} ${unit}`
  } else {
    value = unit === '$' ? 30000 : 100
    display = unit === '$' ? '$30,000' : '100'
  }
  return { value, unit, display }
}

export function computeMoneyMap(o: GoaLineOnboarding): MoneyMapComputed {
  const { value: targetValue, unit: targetUnit, display: targetDisplay } = getTargetValueAndUnit(o)

  const avgRev =
    o.avgRevenuePerCustomerBand === 'not_sure' && o.priceRangeBand
      ? PRICE_RANGE_MIDPOINT[o.priceRangeBand] ?? 200
      : AVG_REVENUE_MIDPOINT[o.avgRevenuePerCustomerBand] ?? 375

  const targetRevenue = targetUnit === '$' ? targetValue : targetValue * avgRev
  const customersNeeded = targetUnit === '$' ? targetRevenue / avgRev : targetValue
  const customersNeededLow = Math.floor(customersNeeded * 0.8)
  const customersNeededHigh = Math.ceil(customersNeeded * 1.2)

  const conv = CONV_RATE[o.conversionConfidence]
  const leadsNeededLow = Math.ceil(customersNeededHigh / conv.high)
  const leadsNeededHigh = Math.ceil(customersNeededLow / conv.low)

  const leadsPerMonth = (leadsNeededLow + leadsNeededHigh) / 2
  const budgetLow = o.monthlyBudget === '0' ? 0 : o.monthlyBudget === 'lt_500' ? 250 : o.monthlyBudget === '500_1500' ? 1000 : o.monthlyBudget === '1500_5000' ? 3250 : 5000
  const budgetHigh = o.monthlyBudget === '0' ? 0 : o.monthlyBudget === 'lt_500' ? 500 : o.monthlyBudget === '500_1500' ? 1500 : o.monthlyBudget === '1500_5000' ? 5000 : 10000
  const monthlyBudget = (budgetLow + budgetHigh) / 2
  const cplLow = leadsPerMonth > 0 ? Math.round((monthlyBudget / 4) / leadsPerMonth) : 0
  const cplHigh = leadsNeededLow > 0 ? Math.round((monthlyBudget / 4) / Math.max(1, leadsNeededLow * 0.5)) : cplLow * 2
  const cplRange = o.monthlyBudget === '0' ? 'N/A (organic focus)' : `$${cplLow}–$${cplHigh}`

  const moneyMapFields = [
    o.target90Day?.value != null || (o.target90Day?.low != null && o.target90Day?.high != null),
    o.avgRevenuePerCustomerBand && o.avgRevenuePerCustomerBand !== 'not_sure' || !!o.priceRangeBand,
    !!o.demandLevel,
    !!o.conversionConfidence,
    !!o.purchasePath,
    !!o.monthlyBudget,
    !!o.weeklyTime,
  ]
  const provided = moneyMapFields.filter(Boolean).length
  const total = moneyMapFields.length
  let confidence: ConfidenceLevel = 'low'
  if (provided >= 6) confidence = 'high'
  else if (provided >= 4) confidence = 'medium'

  return {
    targetDisplay,
    targetValue: targetUnit === '$' ? targetValue : customersNeeded,
    targetUnit: targetUnit === '$' ? '$' : targetUnit,
    customersNeededLow,
    customersNeededHigh,
    leadsNeededLow,
    leadsNeededHigh,
    cplRange,
    confidence,
    confidenceInputsProvided: provided,
    confidenceInputsTotal: total,
  }
}

// —— Executive summary: 2–3 sentence blurb (dynamic narrative) ——
export function getExecutiveSummaryBlurb(o: GoaLineOnboarding): string {
  const name = o.businessName || 'Your business'
  const offer = o.offerDescription?.trim() || 'your offer'
  const geo = o.serviceAreaText || (o.geography === 'local' ? 'your local area' : o.geography === 'regional' ? 'your region' : o.geography === 'national' ? 'nationally' : 'online')
  const map = computeMoneyMap(o)
  const part1 = `${name}${offer !== 'your offer' ? ` (${offer.slice(0, 80)}${offer.length > 80 ? '…' : ''})` : ''} is focused on reaching ${map.targetDisplay} in 90 days.`
  const part2 = `This roadmap is built for a ${BUSINESS_TYPE_LABELS[o.businessType].toLowerCase()} serving ${geo}, with an estimated need of ${map.leadsNeededLow}–${map.leadsNeededHigh} leads per month to hit that target.`
  return `${part1} ${part2}`
}

// —— Funnel data for report viz: leads/mo, customers/mo, target ——
export function getFunnelData(o: GoaLineOnboarding): { stage: string; value: number; label: string }[] {
  const map = computeMoneyMap(o)
  const leadsMid = Math.ceil((map.leadsNeededLow + map.leadsNeededHigh) / 2)
  const customersMid = Math.ceil((map.customersNeededLow + map.customersNeededHigh) / 2)
  const targetVal = map.targetUnit === '$' ? map.targetValue : map.customersNeededHigh
  return [
    { stage: 'Leads/mo', value: leadsMid, label: `${leadsMid} leads` },
    { stage: 'Customers/mo', value: customersMid, label: `~${customersMid} customers` },
    { stage: '90-day goal', value: targetVal, label: map.targetDisplay },
  ]
}

// —— Human-readable assumptions for report ——
const WEEKLY_LABELS: Record<GoaLineOnboarding['weeklyTime'], string> = {
  '1_2': '1–2 hours/week',
  '3_5': '3–5 hours/week',
  '6_10': '6–10 hours/week',
  '10_plus': '10+ hours/week',
}

const BUDGET_LABELS: Record<GoaLineOnboarding['monthlyBudget'], string> = {
  '0': '$0',
  lt_500: '$100–500/mo',
  '500_1500': '$500–1,500/mo',
  '1500_5000': '$1,500–5,000/mo',
  '5000_plus': '$5,000+/mo',
}

const DEMAND_LABELS: Record<GoaLineOnboarding['demandLevel'], string> = {
  starting: 'Just starting',
  some: 'Some demand',
  steady: 'Steady demand',
  busy: 'Busy (quality focus)',
}

const CONVERSION_LABELS: Record<GoaLineOnboarding['conversionConfidence'], string> = {
  high: 'High (25–40% lead→customer)',
  medium: 'Medium (10–25%)',
  low: 'Low (3–10%)',
}

export function getAssumptionsList(o: GoaLineOnboarding): { label: string; value: string }[] {
  const avgRev = o.avgRevenuePerCustomerBand === 'not_sure' && o.priceRangeBand
    ? PRICE_RANGE_MIDPOINT[o.priceRangeBand]
    : AVG_REVENUE_MIDPOINT[o.avgRevenuePerCustomerBand]
  const items: { label: string; value: string }[] = [
    { label: 'Avg. value per customer', value: avgRev != null ? `~$${avgRev}` : 'From questionnaire' },
    { label: 'Conversion confidence', value: CONVERSION_LABELS[o.conversionConfidence] },
    { label: 'Demand baseline', value: DEMAND_LABELS[o.demandLevel] },
    { label: 'Time commitment', value: WEEKLY_LABELS[o.weeklyTime] },
    { label: 'Monthly budget', value: BUDGET_LABELS[o.monthlyBudget] },
    { label: 'Purchase path', value: o.purchasePath.replace(/_/g, ' ') },
  ]
  return items
}

// —— Monthly targets (for report bar chart: leads + customers per month) ——
export function getMonthlyTargetsData(o: GoaLineOnboarding) {
  const map = computeMoneyMap(o)
  const leadsPerMonth = Math.ceil((map.leadsNeededLow + map.leadsNeededHigh) / 2)
  const customersPerMonth = Math.ceil((map.customersNeededLow + map.customersNeededHigh) / 2)
  return [
    { month: 'Month 1', leads: leadsPerMonth, customers: customersPerMonth },
    { month: 'Month 2', leads: leadsPerMonth, customers: customersPerMonth },
    { month: 'Month 3', leads: leadsPerMonth, customers: customersPerMonth },
  ]
}

// —— Trajectory: baseline monthly and plan monthly (simple heuristic) ——
export function getTrajectoryData(o: GoaLineOnboarding) {
  const baseline = BASELINE_MONTHLY[o.demandLevel]
  const map = computeMoneyMap(o)
  const planMonthly = map.targetUnit === '$'
    ? map.targetValue / 3
    : map.customersNeededHigh / 3
  const uplift = o.urgency === 'asap' ? 1.4 : o.urgency === 'soon' ? 1.2 : o.urgency === 'long_term' ? 1.05 : 1.15
  const weeks = [0, 2, 4, 6, 8, 10, 12]
  return weeks.map((week) => {
    const month = week / 4
    const current = baseline.low + (baseline.high - baseline.low) * Math.min(1, month)
    const plan = current + (planMonthly * uplift - current) * Math.min(1, (month * 3) / 3)
    return { week, current: Math.round(current * 10) / 10, plan: Math.round(plan * 10) / 10 }
  })
}

// —— One-sentence strategy: top harvest + top gen channels ——
export function getOneSentenceStrategy(o: GoaLineOnboarding): string {
  const harvest: string[] = []
  const gen: string[] = []
  const prefs = o.channelPreferences || []
  if (o.geography === 'local' && !prefs.includes('seo')) harvest.push('Google Business Profile')
  if (prefs.includes('seo')) harvest.push('SEO')
  if (prefs.includes('google_ads')) harvest.push('Google Ads')
  if (prefs.includes('email') && (o.customerList === 'yes_big' || o.customerList === 'yes_small')) harvest.push('email reactivation')
  if (prefs.includes('content')) gen.push('content')
  if (prefs.includes('meta_ads')) gen.push('Meta Ads')
  if (prefs.includes('referrals')) gen.push('referrals')
  const topHarvest = harvest[0] || 'your best channel'
  const topGen = gen[0] || 'one growth channel'
  const fuel = o.fuelChoice === 'time' ? 'time' : o.fuelChoice === 'money' ? 'budget' : 'time and budget'
  const flow = o.purchasePath.replace('_', ' ')
  return `We'll reach your target by prioritizing ${topHarvest} + ${topGen}, because you have ${fuel} and your buying flow is ${flow}.`
}

// —— Quick wins (do this week) ——
export function getQuickWins(o: GoaLineOnboarding): string[] {
  const wins: string[] = []
  const assets = o.existingAssets || []
  const proof = o.proofAssets || []

  if (!assets.includes('analytics')) wins.push('Install tracking + baseline dashboard')
  if (o.geography === 'local' && !assets.includes('google_business_profile')) wins.push('Create or optimize your Google Business Profile')
  if (proof.includes('none') || proof.length === 0) wins.push('Start your review engine (ask one happy customer for a review)')
  if (o.biggestChallenge === 'no_strategy') wins.push('Define your one primary KPI and where you’ll check it weekly')
  if (o.biggestChallenge === 'low_conversion') wins.push('Document your follow-up flow (what happens within 24h of a lead)')
  if (o.biggestChallenge === 'tracking') wins.push('Add one conversion event to your site or booking tool')
  return wins.slice(0, 3)
}

// —— Channel selection: preferences minus avoided, with budget/local defaults ——
export type ChannelRole = 'Harvest' | 'Generate'
export interface ChannelCard {
  id: string
  name: string
  role: ChannelRole
  why: string
  tactics: string[]
  cadence: string
  kpi: string
  assetsNeeded: string[]
  effort: number
  impact: number
}

const CHANNEL_LABELS: Record<string, string> = {
  google_business_profile: 'Google Business Profile',
  seo: 'SEO',
  google_ads: 'Google Ads',
  meta_ads: 'Facebook/Instagram Ads',
  tiktok: 'TikTok',
  linkedin: 'LinkedIn',
  email: 'Email marketing',
  content: 'Content (blogs/video)',
  partnerships: 'Partnerships',
  events: 'Events / community',
  referrals: 'Referral program',
}

export function getChannelCards(o: GoaLineOnboarding): ChannelCard[] {
  const avoid = new Set<string>(o.channelsToAvoid || [])
  const prefs = new Set<string>(o.channelPreferences || [])
  const budget = o.monthlyBudget
  const noPaid = budget === '0' || budget === 'lt_500'
  const cards: ChannelCard[] = []
  const add = (id: string, role: ChannelRole, why: string, tactics: string[], cadence: string, kpi: string, effort: number, impact: number) => {
    if (avoid.has(id)) return
    const assetsNeeded: string[] = []
    if (id === 'seo' && !o.existingAssets?.includes('website')) assetsNeeded.push('Website')
    if (id === 'google_ads' && !o.existingAssets?.includes('analytics')) assetsNeeded.push('Tracking')
    cards.push({
      id,
      name: CHANNEL_LABELS[id] || id,
      role,
      why,
      tactics,
      cadence,
      kpi,
      assetsNeeded,
      effort,
      impact,
    })
  }

  if (o.geography === 'local') {
    add('google_business_profile', 'Harvest', 'Local customers search here first.', ['Claim & complete profile', 'Add photos & hours', 'Get and respond to reviews'], 'Weekly', 'Calls & direction requests', 1, 2)
  }
  if (prefs.has('seo') || o.geography === 'local') {
    add('seo', 'Harvest', 'Captures existing intent when people search.', ['On-page SEO', 'Local keywords', 'Content that answers questions'], '1–2x/week', 'Organic traffic & leads', 2, 2)
  }
  if (prefs.has('google_ads') && !noPaid) {
    add('google_ads', 'Harvest', 'Paid search captures high-intent visitors.', ['Search campaign', 'Keyword + location targeting', 'Landing page'], 'Ongoing', 'CPL & conversion rate', 2, 3)
  }
  if ((o.customerList === 'yes_big' || o.customerList === 'yes_small') && prefs.has('email')) {
    add('email', 'Harvest', 'Reactivation is your fastest revenue.', ['Segment list', 'Simple offer email', 'Follow-up sequence'], 'Weekly', 'Open rate & conversions', 1, 3)
  }
  if (prefs.has('content')) {
    add('content', 'Generate', 'Builds trust and demand over time.', ['Blog or video series', 'One pillar topic', 'Share on social'], '1–2x/week', 'Traffic & engagement', 3, 2)
  }
  if (prefs.has('meta_ads') && !noPaid) {
    add('meta_ads', 'Generate', 'Reach and retarget your audience.', ['Audience setup', 'Creative test', 'Retargeting'], 'Ongoing', 'Reach & CPL', 2, 2)
  }
  if (prefs.has('referrals')) {
    add('referrals', 'Generate', 'Your best customers bring more.', ['Referral offer', 'Simple tracking', 'Thank them'], 'Ongoing', 'Referral count', 1, 2)
  }
  if (prefs.has('linkedin') && o.customerType !== 'consumer') {
    add('linkedin', 'Generate', 'B2B buyers research here.', ['Profile optimization', 'Content or ads', 'Outreach'], '2–3x/week', 'Connections & leads', 2, 2)
  }

  // Fallback: always show at least 2 channels so the Engine and Effort/Impact chart have data
  if (cards.length === 0) {
    cards.push(
      { id: 'seo', name: 'SEO', role: 'Harvest', why: 'Captures existing intent when people search.', tactics: ['On-page SEO', 'Keywords', 'Content that answers questions'], cadence: '1–2x/week', kpi: 'Organic traffic & leads', assetsNeeded: [], effort: 2, impact: 2 },
      { id: 'content', name: 'Content', role: 'Generate', why: 'Builds trust and demand over time.', tactics: ['Blog or video', 'One pillar topic', 'Share on social'], cadence: '1–2x/week', kpi: 'Traffic & engagement', assetsNeeded: [], effort: 3, impact: 2 },
    )
  }

  return cards
}

// —— Sprint tasks (0–30, 31–60, 61–90) ——
export interface SprintTask {
  title: string
  description: string
  owner: 'You' | 'Contractor' | 'GoaLine'
  effort: 'Low' | 'Medium' | 'High'
}

export function getSprintTasks(o: GoaLineOnboarding): { phase1: SprintTask[]; phase2: SprintTask[]; phase3: SprintTask[] } {
  const assets = o.existingAssets || []
  const proof = o.proofAssets || []
  const phase1: SprintTask[] = []
  const phase2: SprintTask[] = []
  const phase3: SprintTask[] = []

  if (!assets.includes('analytics')) {
    phase1.push({ title: 'Install tracking + baseline KPI dashboard', description: 'Add conversion event and one key metric.', owner: 'You', effort: 'Medium' })
  }
  if (o.biggestChallenge === 'low_conversion' || o.purchasePath === 'call') {
    phase1.push({ title: 'Landing page / offer clarity', description: 'One headline, one CTA, one proof point.', owner: 'You', effort: 'Low' })
  }
  if (proof.includes('none') || proof.length === 0) {
    phase1.push({ title: 'Proof capture (reviews or testimonials)', description: 'Ask 3–5 happy customers.', owner: 'You', effort: 'Low' })
  }
  phase1.push({ title: 'Sales/booking friction reduction', description: 'Document and speed up follow-up within 24h.', owner: 'You', effort: 'Medium' })

  phase2.push({ title: 'Launch 1–2 primary channels', description: 'From your Engine plan.', owner: 'You', effort: 'High' })
  phase2.push({ title: 'Launch one core offer/campaign', description: 'One clear offer, one CTA.', owner: 'You', effort: 'Medium' })

  phase3.push({ title: 'Double down on winning channel(s)', description: 'Scale what’s already working.', owner: 'You', effort: 'Medium' })
  phase3.push({ title: 'Add automation (email flows, retargeting, CRM)', description: 'Reduce manual follow-up.', owner: 'You', effort: 'High' })

  return { phase1, phase2, phase3 }
}

// —— Budget allocation (time or money) ——
export interface BudgetSlice {
  label: string
  amount: string
  percentage: number
  rationale: string
}

export function getBudgetAllocation(o: GoaLineOnboarding): BudgetSlice[] {
  const budget = o.monthlyBudget
  const fuel = o.fuelChoice
  if (budget === '0') {
    return [{ label: 'Time (organic, content, outreach)', amount: 'Your time', percentage: 100, rationale: 'Focus on high-impact, no-cost channels.' }]
  }
  if (budget === 'lt_500') {
    return [
      { label: 'Tools & tracking', amount: '$50–150', percentage: 25, rationale: 'Baseline measurement.' },
      { label: 'One paid experiment', amount: '$150–300', percentage: 50, rationale: 'Test one channel.' },
      { label: 'Content/creative', amount: 'Rest', percentage: 25, rationale: 'Assets that compound.' },
    ]
  }
  if (budget === '500_1500') {
    return [
      { label: 'Paid acquisition', amount: '$400–800', percentage: 55, rationale: 'Scale what works.' },
      { label: 'Tools & creative', amount: '$100–300', percentage: 25, rationale: 'Tracking and assets.' },
      { label: 'Reserve / test', amount: '$100–400', percentage: 20, rationale: 'New channel test.' },
    ]
  }
  if (budget === '1500_5000') {
    return [
      { label: 'Paid acquisition', amount: 'Majority', percentage: 60, rationale: 'Multi-channel.' },
      { label: 'Tools & team', amount: '25%', percentage: 25, rationale: 'Creative or freelancer.' },
      { label: 'Test & learn', amount: '15%', percentage: 15, rationale: 'Experiments.' },
    ]
  }
  return [
    { label: 'Paid acquisition', amount: '60%', percentage: 60, rationale: 'Full funnel.' },
    { label: 'Tools & team', amount: '25%', percentage: 25, rationale: 'Scale support.' },
    { label: 'Reserve', amount: '15%', percentage: 15, rationale: 'Opportunity.' },
  ]
}

// —— Risks & mitigations ——
export interface RiskCard {
  risk: string
  mitigation: string
}

export function getRisks(o: GoaLineOnboarding): RiskCard[] {
  const risks: RiskCard[] = []
  if (o.weeklyTime === '1_2') risks.push({ risk: 'Low time availability', mitigation: 'Focus on 1–2 channels only; consider a contractor for execution.' })
  if (o.proofAssets?.includes('none') || (o.proofAssets?.length === 0)) risks.push({ risk: 'No proof assets yet', mitigation: 'Prioritize review engine and one case study in Sprint 1.' })
  if (!o.existingAssets?.includes('analytics')) risks.push({ risk: 'No tracking in place', mitigation: 'Install baseline tracking before scaling spend.' })
  if (o.urgency === 'asap' && o.monthlyBudget === '0') risks.push({ risk: 'High urgency with no paid budget', mitigation: 'Focus on reactivation and referrals; set expectation for 60–90 days for organic.' })
  if (o.biggestChallenge === 'competitive') risks.push({ risk: 'Highly competitive space', mitigation: 'Double down on differentiation (superpower) and niche targeting.' })
  return risks
}

// —— Labels for UI ——
export const BUSINESS_TYPE_LABELS: Record<GoaLineOnboarding['businessType'], string> = {
  local_service: 'Local service (calls/bookings)',
  ecommerce: 'Ecommerce',
  b2b_service: 'B2B service',
  saas: 'SaaS / subscription',
  creator: 'Creator / personal brand',
  nonprofit: 'Nonprofit',
  other: 'Other',
}

export const URGENCY_LABELS: Record<GoaLineOnboarding['urgency'], string> = {
  asap: 'ASAP (0–30 days)',
  soon: 'Soon (30–60 days)',
  steady: 'Steady (60–90 days)',
  long_term: 'Long-term (90+ days)',
}
