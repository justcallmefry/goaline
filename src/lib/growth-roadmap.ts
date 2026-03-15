/**
 * Growth Roadmap: field mapping spec + types
 *
 * Maps the 12 consultative questions to plan fields, defaults, confidence impact,
 * and which view(s) they feed. Use for wizard, server action, and View 1–5 rendering.
 */

// —— Inputs (what we collect) ——

export type WinMetric = 'revenue' | 'leads' | 'bookings' | 'subscribers';
export type NowVsLater = 'now' | 'later' | 'balanced';
export type BuyMethod = 'call' | 'book_online' | 'buy_online' | 'request_quote';
export type ConversionConfidence = 'high' | 'medium' | 'low';
export type DemandLevel = 'none' | 'some' | 'consistent' | 'busy_quality';
export type WhoServed = 'consumer' | 'business' | 'both';
export type Geography = 'local' | 'cities' | 'nationwide';
export type FuelCheck = 'time' | 'money' | 'both';
export type ProofAssets = 'reviews' | 'testimonials' | 'case_studies' | 'before_after' | 'none';

export interface RoadmapInputs {
  // Outcome + math
  winIn90Days: WinMetric;
  winIn90DaysAmount?: string; // e.g. "$10k", "50 leads"
  nowVsLater: NowVsLater;
  aovKnown: boolean;
  aovRange?: string; // when aovKnown true
  priceRange?: string; // when aovKnown false ("not sure")
  // Funnel
  howCustomersBuy: BuyMethod;
  closeRateConfidence: ConversionConfidence;
  closeRatePercent?: number;
  currentDemand: DemandLevel;
  // Audience
  whoServed: WhoServed;
  whoServedDescription?: string;
  whereServed: Geography;
  whereServedDetail?: string;
  // Moat
  whatCustomersLove: string; // speed | quality | price | service | expertise | convenience (or free text)
  proofAssets: ProofAssets[];
  // Constraints
  fuelCheck: FuelCheck;
  weeklyHours: string; // "1-2" | "3-5" | "6-10" | "10+"
  monthlyBudget: string; // "$0" | "$100-500" | etc.
  // Optional
  hasEmailList?: boolean;
}

// —— Confidence (input-quality based) ——

export type ConfidenceLevel = 'high' | 'medium' | 'low';

export function computeConfidence(inputs: RoadmapInputs): ConfidenceLevel {
  let score = 0;
  if (inputs.winIn90DaysAmount) score += 1;
  if (inputs.aovKnown && inputs.aovRange) score += 1;
  if (inputs.closeRatePercent != null) score += 1;
  if (inputs.currentDemand !== 'none') score += 0.5;
  if (inputs.whatCustomersLove && inputs.proofAssets?.length) score += 0.5;
  if (score >= 3) return 'high';
  if (score >= 1.5) return 'medium';
  return 'low';
}

// —— View 1: Money Map (computed from inputs) ——

export interface MoneyMapData {
  northStarGoal: string;
  northStarMetric: WinMetric;
  targetValue: string;
  requiredCustomersPerMonth: string;
  requiredLeadsPerMonth: string;
  cplCacRange: string;
  oneLinerStrategy: string;
  confidence: ConfidenceLevel;
  assumptions: { label: string; value: string; editable?: boolean }[];
}

const DEFAULT_AVG_ORDER: Record<string, number> = {
  '$0-50': 25,
  '$50-200': 125,
  '$200-500': 350,
  '$500-2000': 1250,
  '$2000+': 3000,
};

export function buildMoneyMapData(inputs: RoadmapInputs): MoneyMapData {
  const confidence = computeConfidence(inputs);
  const aov = inputs.aovKnown && inputs.aovRange
    ? (DEFAULT_AVG_ORDER[inputs.aovRange] ?? 200)
    : inputs.priceRange ? (DEFAULT_AVG_ORDER[inputs.priceRange] ?? 200) : 200;
  const closeRate = inputs.closeRatePercent != null
    ? inputs.closeRatePercent / 100
    : inputs.closeRateConfidence === 'high' ? 0.25 : inputs.closeRateConfidence === 'medium' ? 0.15 : 0.08;

  const targetRevenue = inputs.winIn90Days === 'revenue' && inputs.winIn90DaysAmount
    ? parseTargetNumber(inputs.winIn90DaysAmount)
    : 30000; // default $30k/90 days
  const monthlyRevenue = typeof targetRevenue === 'number' ? targetRevenue / 3 : 10000;
  const customersPerMonth = Math.round(monthlyRevenue / aov) || 10;
  const leadsPerMonth = Math.round(customersPerMonth / closeRate) || 50;
  const cplLow = Math.round((parseBudgetLow(inputs.monthlyBudget) / 4) / (leadsPerMonth || 1));
  const cplHigh = Math.round((parseBudgetHigh(inputs.monthlyBudget) / 4) / Math.max(1, leadsPerMonth * 0.5));

  const assumptions = [
    { label: 'Avg. value per customer', value: `$${aov}`, editable: true },
    { label: 'Est. close rate', value: `${(closeRate * 100).toFixed(0)}%`, editable: true },
    { label: 'Monthly budget', value: inputs.monthlyBudget, editable: true },
  ];

  return {
    northStarGoal: inputs.winIn90Days === 'revenue' ? 'Revenue (90 days)' : inputs.winIn90Days === 'leads' ? 'Leads (90 days)' : inputs.winIn90Days === 'bookings' ? 'Bookings (90 days)' : 'Subscribers (90 days)',
    northStarMetric: inputs.winIn90Days,
    targetValue: inputs.winIn90DaysAmount || (inputs.winIn90Days === 'revenue' ? '$30,000' : '100'),
    requiredCustomersPerMonth: String(customersPerMonth),
    requiredLeadsPerMonth: String(leadsPerMonth),
    cplCacRange: `$${cplLow}-$${cplHigh}`,
    oneLinerStrategy: `We'll hit ${inputs.winIn90DaysAmount || 'your goal'} by focusing on ${inputs.howCustomersBuy.replace('_', ' ')} and ${inputs.fuelCheck === 'money' ? 'paid channels' : inputs.fuelCheck === 'time' ? 'organic + outreach' : 'a mix of paid and organic'}, with clear tracking and follow-up.`,
    confidence,
    assumptions,
  };
}

function parseTargetNumber(s: string): number {
  const n = parseFloat(s.replace(/[^0-9.]/g, ''));
  if (s.includes('k') || s.includes('K')) return n * 1000;
  return isNaN(n) ? 30000 : n;
}

function parseBudgetLow(b: string): number {
  const m = b.match(/\$?\s*(\d+)/);
  return m ? parseInt(m[1], 10) : 0;
}

function parseBudgetHigh(b: string): number {
  const parts = b.split('-').map((p) => parseInt(p.replace(/[^0-9]/g, ''), 10)).filter((n) => !isNaN(n));
  return parts.length > 1 ? parts[1] : parts[0] || 500;
}

// —— Field mapping spec (for reference / prompts) ——

export const ROADMAP_FIELD_SPEC = [
  { question_id: 'win_90', plan_field: 'winIn90Days + winIn90DaysAmount', confidence_impact: 'high', views: ['view1'] },
  { question_id: 'now_vs_later', plan_field: 'nowVsLater', confidence_impact: null, views: ['view1', 'view3'] },
  { question_id: 'aov', plan_field: 'aovKnown, aovRange, priceRange', confidence_impact: 'high', views: ['view1'] },
  { question_id: 'how_buy', plan_field: 'howCustomersBuy', confidence_impact: null, views: ['view1', 'view3'] },
  { question_id: 'close_rate', plan_field: 'closeRateConfidence, closeRatePercent', confidence_impact: 'high', views: ['view1'] },
  { question_id: 'demand', plan_field: 'currentDemand', confidence_impact: 'medium', views: ['view1', 'view4'] },
  { question_id: 'who_serve', plan_field: 'whoServed, whoServedDescription', confidence_impact: null, views: ['view2', 'view3'] },
  { question_id: 'where_serve', plan_field: 'whereServed, whereServedDetail', confidence_impact: null, views: ['view2', 'view3'] },
  { question_id: 'what_love', plan_field: 'whatCustomersLove', confidence_impact: null, views: ['view2'] },
  { question_id: 'proof', plan_field: 'proofAssets', confidence_impact: null, views: ['view2'] },
  { question_id: 'fuel', plan_field: 'fuelCheck', confidence_impact: null, views: ['view3', 'view5'] },
  { question_id: 'capacity', plan_field: 'weeklyHours, monthlyBudget', confidence_impact: null, views: ['view3', 'view5'] },
  { question_id: 'email_list', plan_field: 'hasEmailList', confidence_impact: null, views: ['view3', 'view4'] },
] as const;
