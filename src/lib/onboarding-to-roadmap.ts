/**
 * Maps GoaLineOnboarding (full questionnaire) to RoadmapInputs
 * so existing Money Map + full plan builders keep working.
 */

import type { GoaLineOnboarding, Target90Day } from '@/types/goaline-onboarding'
import type { RoadmapInputs } from './growth-roadmap'

const WIN_METRIC_TO_LEGACY: Record<GoaLineOnboarding['winMetric'], RoadmapInputs['winIn90Days']> = {
  revenue: 'revenue',
  leads: 'leads',
  bookings: 'bookings',
  orders: 'revenue',
  subscribers: 'subscribers',
  traffic: 'leads',
}

const REVENUE_BAND_TO_LEGACY: Record<string, string> = {
  lt_100: '$50-200',
  '100_250': '$50-200',
  '250_500': '$200-500',
  '500_1000': '$500-2000',
  '1000_5000': '$2000+',
  '5000_plus': '$2000+',
  not_sure: '',
}

const PRICE_BAND_TO_LEGACY: Record<string, string> = {
  lt_50: '$0-50',
  '50_150': '$50-200',
  '150_500': '$200-500',
  '500_2000': '$500-2000',
  '2000_plus': '$2000+',
}

const DEMAND_TO_LEGACY: Record<GoaLineOnboarding['demandLevel'], RoadmapInputs['currentDemand']> = {
  starting: 'none',
  some: 'some',
  steady: 'consistent',
  busy: 'busy_quality',
}

const GEO_TO_LEGACY: Record<GoaLineOnboarding['geography'], RoadmapInputs['whereServed']> = {
  local: 'local',
  regional: 'cities',
  national: 'nationwide',
  online_only: 'nationwide',
}

const PURCHASE_TO_LEGACY: Record<GoaLineOnboarding['purchasePath'], RoadmapInputs['howCustomersBuy']> = {
  call: 'call',
  book_online: 'book_online',
  buy_online: 'buy_online',
  request_quote: 'request_quote',
  in_person: 'call',
}

const WEEKLY_TO_LEGACY: Record<GoaLineOnboarding['weeklyTime'], RoadmapInputs['weeklyHours']> = {
  '1_2': '1-2',
  '3_5': '3-5',
  '6_10': '6-10',
  '10_plus': '10+',
}

const BUDGET_TO_LEGACY: Record<GoaLineOnboarding['monthlyBudget'], RoadmapInputs['monthlyBudget']> = {
  '0': '$0',
  lt_500: '$100-500',
  '500_1500': '$500-2000',
  '1500_5000': '$2000+',
  '5000_plus': '$2000+',
}

function target90DayToString(t: Target90Day): string {
  if (t.value != null) return t.unit === '$' ? `$${t.value}` : `${t.value} ${t.unit}`
  if (t.low != null && t.high != null) return t.unit === '$' ? `$${t.low}-$${t.high}` : `${t.low}-${t.high} ${t.unit}`
  return t.unit === '$' ? '$30,000' : '100'
}

/** Map new onboarding payload to legacy RoadmapInputs for plan generation. */
export function onboardingToRoadmapInputs(o: GoaLineOnboarding): RoadmapInputs {
  const aovKnown = o.avgRevenuePerCustomerBand !== 'not_sure'
  const aovRange = aovKnown ? REVENUE_BAND_TO_LEGACY[o.avgRevenuePerCustomerBand] : undefined
  const priceRange = !aovKnown && o.priceRangeBand ? PRICE_BAND_TO_LEGACY[o.priceRangeBand] : undefined

  const whatCustomersLove =
    o.superpower?.length > 0 ? o.superpower[0] : ''

  const proofAssets = (o.proofAssets ?? []).filter((a) => a !== 'none').map((a) => {
    if (a === 'press' || a === 'social_following') return 'testimonials'
    return a as RoadmapInputs['proofAssets'][number]
  })
  if (o.proofAssets?.includes('none') || proofAssets.length === 0) {
    proofAssets.length = 0
  }

  return {
    winIn90Days: WIN_METRIC_TO_LEGACY[o.winMetric],
    winIn90DaysAmount: target90DayToString(o.target90Day),
    nowVsLater: o.urgency === 'asap' ? 'now' : o.urgency === 'long_term' ? 'later' : 'balanced',
    aovKnown,
    aovRange,
    priceRange,
    howCustomersBuy: PURCHASE_TO_LEGACY[o.purchasePath],
    closeRateConfidence: o.conversionConfidence,
    currentDemand: DEMAND_TO_LEGACY[o.demandLevel],
    whoServed: o.customerType,
    whoServedDescription: o.idealCustomerText || undefined,
    whereServed: GEO_TO_LEGACY[o.geography],
    whereServedDetail: o.serviceAreaText,
    whatCustomersLove,
    proofAssets,
    fuelCheck: o.fuelChoice,
    weeklyHours: WEEKLY_TO_LEGACY[o.weeklyTime],
    monthlyBudget: BUDGET_TO_LEGACY[o.monthlyBudget],
    hasEmailList: o.customerList === 'yes_big' || o.customerList === 'yes_small',
  }
}
