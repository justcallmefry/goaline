/**
 * GoaLine Onboarding Questionnaire (v1) — full data model.
 * Powers: Money Map → Moat → Engine → Sprints → Resources/Risks.
 */

export type BusinessType =
  | 'local_service'
  | 'ecommerce'
  | 'b2b_service'
  | 'saas'
  | 'creator'
  | 'nonprofit'
  | 'other'

export type PrimaryOutcome =
  | 'more_leads'
  | 'more_bookings'
  | 'more_sales'
  | 'more_subscribers'
  | 'brand_awareness'
  | 'launch'

export type WinMetric =
  | 'revenue'
  | 'leads'
  | 'bookings'
  | 'orders'
  | 'subscribers'
  | 'traffic'

export type Urgency = 'asap' | 'soon' | 'steady' | 'long_term'

export type AvgRevenueBand =
  | 'lt_100'
  | '100_250'
  | '250_500'
  | '500_1000'
  | '1000_5000'
  | '5000_plus'
  | 'not_sure'

export type PriceRangeBand =
  | 'lt_50'
  | '50_150'
  | '150_500'
  | '500_2000'
  | '2000_plus'

export type PurchasePath =
  | 'call'
  | 'book_online'
  | 'buy_online'
  | 'request_quote'
  | 'in_person'

export type DemandLevel = 'starting' | 'some' | 'steady' | 'busy'

export type ConversionConfidence = 'high' | 'medium' | 'low'

export type CustomerType = 'consumer' | 'business' | 'both'

export type Geography = 'local' | 'regional' | 'national' | 'online_only'

export type Superpower =
  | 'speed'
  | 'quality'
  | 'price'
  | 'service'
  | 'expertise'
  | 'convenience'
  | 'trust'
  | 'results'

export type ProofAsset =
  | 'reviews'
  | 'testimonials'
  | 'case_studies'
  | 'before_after'
  | 'press'
  | 'social_following'
  | 'none'

export type FuelChoice = 'time' | 'money' | 'both'

export type WeeklyTime = '1_2' | '3_5' | '6_10' | '10_plus'

export type MonthlyBudget = '0' | 'lt_500' | '500_1500' | '1500_5000' | '5000_plus'

export type ChannelOption =
  | 'seo'
  | 'google_ads'
  | 'meta_ads'
  | 'tiktok'
  | 'linkedin'
  | 'email'
  | 'content'
  | 'partnerships'
  | 'events'
  | 'referrals'

export type CustomerListSize = 'yes_big' | 'yes_small' | 'no' | 'not_sure'

export type ExistingAsset =
  | 'website'
  | 'google_business_profile'
  | 'social_accounts'
  | 'analytics'
  | 'crm'
  | 'email_platform'
  | 'past_ads'
  | 'content_library'
  | 'none'

export type PlanNameStyle =
  | 'growth_roadmap'
  | 'ninety_day_sprint'
  | 'market_domination'

export type BiggestChallenge =
  | 'no_strategy'
  | 'no_leads'
  | 'low_conversion'
  | 'no_time'
  | 'no_content'
  | 'tracking'
  | 'competitive'

export interface Target90Day {
  low?: number
  high?: number
  value?: number
  unit: string // e.g. '$', 'leads', 'bookings'
}

export interface GoaLineOnboarding {
  businessName: string
  website?: string
  businessType: BusinessType
  offerDescription: string

  primaryOutcome: PrimaryOutcome
  winMetric: WinMetric
  target90Day: Target90Day
  urgency: Urgency

  avgRevenuePerCustomerBand: AvgRevenueBand
  priceRangeBand?: PriceRangeBand

  purchasePath: PurchasePath
  demandLevel: DemandLevel
  conversionConfidence: ConversionConfidence

  customerType: CustomerType
  idealCustomerText: string
  geography: Geography
  serviceAreaText?: string

  superpower: Superpower[]
  proofAssets: ProofAsset[]

  fuelChoice: FuelChoice
  weeklyTime: WeeklyTime
  monthlyBudget: MonthlyBudget

  channelPreferences: ChannelOption[]
  channelsToAvoid?: ChannelOption[]

  customerList: CustomerListSize
  existingAssets: ExistingAsset[]

  planNameStyle?: PlanNameStyle
  biggestChallenge: BiggestChallenge
}
