/**
 * Builds a full GrowthPlan (robust report) from roadmap inputs + Money Map data.
 * Template-based so every plan has Executive Summary, Playbooks, Measurement, Roadmap, etc.
 */

import type { GrowthPlan, RoadmapItem } from '@/types/marketing-plan'
import type { RoadmapInputs } from './growth-roadmap'
import type { MoneyMapData } from './growth-roadmap'

export function buildFullPlanFromRoadmap(
  inputs: RoadmapInputs,
  businessName: string,
  moneyMap: MoneyMapData
): GrowthPlan {
  const winLabel = inputs.winIn90Days === 'revenue' ? 'Revenue' : inputs.winIn90Days === 'leads' ? 'Leads' : inputs.winIn90Days === 'bookings' ? 'Bookings' : 'Subscribers'
  const buyLabel = inputs.howCustomersBuy.replace('_', ' ')
  const whoLabel = inputs.whoServed === 'consumer' ? 'Consumers' : inputs.whoServed === 'business' ? 'Businesses' : 'Both consumers and businesses'
  const whereLabel = inputs.whereServed === 'local' ? 'Local area' : inputs.whereServed === 'cities' ? 'Specific cities' : 'Nationwide'

  return {
    meta: {
      businessName,
      generatedDate: new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' }),
      version: '1.0 - Growth Roadmap',
      consultantName: 'GoaLine Strategy Engine',
    },
    executiveSummary: {
      diagnosis: [
        `You're focused on ${winLabel} in 90 days but may not have the tracking and systems in place to know what's working.`,
        `Your customers typically buy via ${buyLabel}. Your site and follow-up need to be built around that path, not a generic funnel.`,
        inputs.currentDemand === 'none' || inputs.currentDemand === 'some'
          ? 'Demand isn\'t consistent yet. We need to fix the foundation (tracking, offer clarity) before scaling spend.'
          : 'You have demand; the priority is converting and retaining better while adding predictable channels.',
      ],
      strategyOneLiner: moneyMap.oneLinerStrategy,
      top3Initiatives: getTop3Initiatives(inputs, moneyMap),
    },
    businessBrief: {
      inputs: [
        { label: 'Primary goal', value: winLabel },
        { label: 'Who you serve', value: whoLabel },
        { label: 'Where you serve', value: whereLabel },
        { label: 'Monthly budget', value: inputs.monthlyBudget },
        { label: 'Weekly capacity', value: `${inputs.weeklyHours} hours` },
        { label: 'Fuel', value: inputs.fuelCheck === 'time' ? 'More time than money' : inputs.fuelCheck === 'money' ? 'More money than time' : 'Both' },
      ],
      constraints: [
        inputs.weeklyHours === '1-2' ? 'Limited time (1–2 hrs/week). Plan prioritizes high-impact, low-friction actions.' : '',
        inputs.monthlyBudget === '$0' ? 'No paid budget. Focus is organic, referrals, and conversion.' : '',
        inputs.proofAssets?.length === 0 || (inputs.proofAssets?.length === 1 && inputs.proofAssets[0] === 'none')
          ? 'Limited proof assets (reviews, case studies). Building these is part of the plan.'
          : '',
      ].filter(Boolean),
      competitiveReality: `You're targeting ${whoLabel} ${whereLabel}. Standing out means clear positioning (${inputs.whatCustomersLove || 'your differentiator'}) and consistent follow-up on every ${buyLabel}.`,
    },
    northStar: {
      primaryObjective: `${moneyMap.northStarGoal}: ${moneyMap.targetValue}`,
      kpis: {
        leading: ['Leads or inquiries per month', 'Conversion rate (visit → action)', 'Cost per lead/customer'],
        lagging: [winLabel + ' (90 days)', 'Customer count', 'Revenue or LTV'],
      },
      baselineAssumptions: moneyMap.assumptions.map((a) => `${a.label}: ${a.value}`),
    },
    measurement: {
      concept: "Marketing is math, not magic. Before you scale, you need to know where every lead and customer comes from. This setup ensures you never have to guess 'is this working?'",
      week1Checklist: [
        { task: 'Set up conversion tracking', description: 'So you can see which channels drive results.', howTo: 'Add a tracking pixel or event (e.g. Google Analytics 4, or your CRM) to your main conversion action: ' + (inputs.howCustomersBuy === 'call' ? 'click-to-call and form submit.' : inputs.howCustomersBuy === 'book_online' ? 'booking confirmation page.' : 'purchase or signup.') + ' Mark that as a Key Event.', done: false },
        { task: 'Define your one key metric', description: 'One number you will improve every week.', howTo: `Choose either "Leads per week" or "Customers per month" and put it in a simple dashboard or spreadsheet. Review it every Monday.`, done: false },
        { task: 'Document your current funnel', description: 'How do people find you and what happens next?', howTo: 'Write down: where they come from (e.g. Google, referral), what they see first, and what they do (call, form, book). One page is enough.', done: false },
      ],
      kpisToTrack: ['Leads per month', 'Conversion rate', 'Cost per lead/customer', moneyMap.northStarGoal],
    },
    playbooks: getPlaybooks(inputs),
    demandGeneration: {
      routines: [
        { frequency: 'Weekly', task: 'Review leads and follow-up', role: 'You', why: 'Keeps pipeline moving.' },
        { frequency: 'Weekly', task: 'Post or update one piece of proof (review, case, offer)', role: inputs.weeklyHours === '10+' ? 'You or staff' : 'You', why: 'Builds trust and visibility.' },
        { frequency: 'Monthly', task: 'Check numbers vs. target', role: 'You', why: 'Stay on track to your 90-day goal.' },
      ],
    },
    resources: {
      monthlyBudgetSplit: getBudgetSplit(inputs),
    },
    roadmap: {
      phase1: [
        { week: 1, title: 'Tracking & clarity', description: 'Set up conversion tracking and document your offer and audience in one place.', owner: 'You', impact: 'High' },
        { week: 2, title: 'Fix the first touch', description: 'Ensure your main landing page or listing clearly states who you help and what they get.', owner: 'You', impact: 'High' },
        { week: 3, title: 'Follow-up system', description: 'Define what happens within 24 hours of a lead (email, call, or both).', owner: 'You', impact: 'High' },
      ],
      phase2: [
        { week: 5, title: 'Turn on one channel', description: inputs.fuelCheck === 'money' ? 'Launch one paid channel (e.g. search or social) with a small test budget.' : 'Double down on one organic channel (e.g. content, SEO, or outreach).', owner: 'You', impact: 'High' },
        { week: 6, title: 'Collect proof', description: 'Ask for one review, testimonial, or case study and add it to your site.', owner: 'You', impact: 'Medium' },
      ],
      phase3: [
        { week: 9, title: 'Scale what works', description: 'Increase budget or time on the channel that is already generating leads.', owner: 'You', impact: 'High' },
        { week: 10, title: 'Review and plan next 90', description: 'Compare results to your target and set the next quarter\'s priorities.', owner: 'You', impact: 'Medium' },
      ],
    },
  }
}

function getTop3Initiatives(inputs: RoadmapInputs, moneyMap: MoneyMapData): GrowthPlan['executiveSummary']['top3Initiatives'] {
  const base = [
    {
      title: 'Get tracking in place',
      why: "You can't improve what you don't measure. Without conversion tracking, you won't know which channels actually drive " + inputs.winIn90Days + '.',
      expectedOutcome: 'Every lead and customer attributed to a source within 30 days.',
    },
    {
      title: 'Clarify offer and follow-up',
      why: `Your customers buy via ${inputs.howCustomersBuy.replace('_', ' ')}. Your site and process need to make that path obvious and fast.`,
      expectedOutcome: 'Higher conversion from visitor to lead, and from lead to customer.',
    },
    {
      title: 'Hit your lead number',
      why: `You need about ${moneyMap.requiredLeadsPerMonth} leads per month to hit your goal. That means consistent activity on 1–2 channels.`,
      expectedOutcome: `Reach ${moneyMap.requiredLeadsPerMonth}+ qualified leads per month by day 60.`,
    },
  ]
  return base
}

function getPlaybooks(inputs: RoadmapInputs): GrowthPlan['playbooks'] {
  const playbooks: GrowthPlan['playbooks'] = [
    {
      id: 'p1',
      title: 'Conversion foundation',
      subtitle: 'Turn visitors into leads and leads into customers',
      conceptDefinition: 'Most businesses lose leads because the path from "interested" to "customer" is unclear or slow. Your job is to make the next step obvious and easy.',
      whyItMatters: `Your customers typically ${inputs.howCustomersBuy.replace('_', ' ')}. So your site and follow-up must make that action the obvious next step and then respond within hours.`,
      successMetrics: ['Conversion rate from visit to lead', 'Time to first contact', 'Lead-to-customer rate'],
      steps: [
        {
          stepNumber: 1,
          title: 'One clear offer above the fold',
          educationalContext: 'Visitors decide in seconds. If they don\'t see what you do and what they get, they leave.',
          actionInstruction: 'On your main page, add a single headline that states who you help and the one outcome they get (e.g. "Get more qualified leads in 90 days" or "Book your free consultation"). Put your primary CTA (call, form, or book) right below it.',
          proTip: 'Use their words, not jargon. Test with one friend: can they say back what you do and what to do next?',
        },
        {
          stepNumber: 2,
          title: 'Fast follow-up',
          educationalContext: 'Leads go cold fast. The first response should happen within a few hours, not the next day.',
          actionInstruction: 'Set a rule: every new lead gets a reply (email or call) within 4 hours. If you use a CRM, add an automation or reminder. If not, use a simple daily checklist.',
          proTip: 'Even a short "Got your request, I\'ll call you tomorrow at 2pm" dramatically increases conversion.',
        },
        {
          stepNumber: 3,
          title: 'One proof point visible everywhere',
          educationalContext: 'People need a reason to trust you before they act. One strong review or result beats a vague promise.',
          actionInstruction: inputs.proofAssets?.length ? 'Add your best review, testimonial, or case study near the top of your page and next to your CTA.' : 'Ask your best recent customer for a short testimonial or review. Add it to your homepage and thank-you page.',
          proTip: 'Specific results ("Increased leads by 40%") outperform generic praise ("Great service").',
        },
      ],
      assets: [
        {
          title: 'Follow-up email template',
          type: 'Template',
          content: 'Subject: Re: [Their request]\n\nHi [Name],\n\nThanks for reaching out. I\'d like to learn more about [what they asked about] and see if we can help.\n\nAre you free for a quick [call/meeting] this week? I have [Day] at [Time] or [Day] at [Time].\n\nBest,\n[You]',
        },
      ],
    },
  ]

  if (inputs.whereServed === 'local') {
    playbooks.push({
      id: 'p2',
      title: 'Local visibility',
      subtitle: 'Show up when people in your area search',
      conceptDefinition: 'Local search (Google Maps, "near me") drives a huge share of customers for service businesses. Being in the top results means you get the first calls.',
      whyItMatters: 'If you serve a local area, most of your customers will find you through search or maps. Optimizing your profile and listings puts you in front of them.',
      successMetrics: ['Map pack or local ranking', 'Direction requests', 'Calls from listing'],
      steps: [
        {
          stepNumber: 1,
          title: 'Claim and complete your Google Business Profile',
          educationalContext: 'An incomplete or unclaimed profile gets outranked by competitors who took the time to fill everything out.',
          actionInstruction: 'Go to business.google.com. Claim your business (or create it). Fill every section: hours, services, description, photos. Use your real address and phone.',
          proTip: 'Add 3–5 photos of your team, place, or work. Real photos outperform stock.',
        },
        {
          stepNumber: 2,
          title: 'Get and respond to reviews',
          educationalContext: 'Reviews signal trust and freshness. Google favors businesses with recent, positive reviews.',
          actionInstruction: 'Ask your last 5 happy customers to leave a review on Google. Then set a reminder to respond to every new review within 48 hours.',
          proTip: 'Thank them and mention one specific thing they said. It shows you read it.',
        },
      ],
      assets: [],
    })
  }

  if (inputs.fuelCheck === 'money' && inputs.monthlyBudget !== '$0') {
    playbooks.push({
      id: 'p3',
      title: 'Paid acquisition',
      subtitle: 'Use budget to generate predictable leads',
      conceptDefinition: 'Paid ads (Google, Meta, or LinkedIn) can deliver a steady stream of leads if you target the right audience and send them to a clear offer.',
      whyItMatters: 'With a defined budget, you can test one channel and scale what works. The key is tracking so you know your cost per lead and per customer.',
      successMetrics: ['Cost per lead', 'Lead quality', 'ROI vs. target'],
      steps: [
        {
          stepNumber: 1,
          title: 'Start with one campaign',
          educationalContext: 'Spreading budget across many campaigns makes it hard to learn. One campaign, one audience, one offer.',
          actionInstruction: 'Pick one channel (e.g. Google Search for "your service + city" or Meta for your audience). Set a small daily budget. Send traffic to one landing page with one clear CTA.',
          proTip: 'Run for at least 2 weeks before judging. Early data is noisy.',
        },
        {
          stepNumber: 2,
          title: 'Track conversions, not just clicks',
          educationalContext: 'Clicks are cheap; customers are what matter. You need to see which clicks become leads or sales.',
          actionInstruction: 'Install conversion tracking (e.g. Google Ads conversion, Meta Pixel) on your thank-you or confirmation page. Link it to your ad account.',
          proTip: 'If you take calls, use a call-tracking number so phone conversions are counted.',
        },
      ],
      assets: [],
    })
  }

  return playbooks
}

function getBudgetSplit(inputs: RoadmapInputs): GrowthPlan['resources']['monthlyBudgetSplit'] {
  if (inputs.monthlyBudget === '$0') {
    return [
      { channel: 'Organic (content, SEO, outreach)', amount: '$0', percentage: 100, rationale: 'Focus on time and consistency. No ad spend.' },
    ]
  }
  if (inputs.monthlyBudget === '$100-500') {
    return [
      { channel: 'Tools & tracking', amount: '$50–100', percentage: 20, rationale: 'Call tracking or analytics so you know what works.' },
      { channel: 'Paid test (one channel)', amount: '$150–300', percentage: 50, rationale: 'One small campaign to learn what converts.' },
      { channel: 'Content / organic', amount: 'Time', percentage: 30, rationale: 'Build assets that keep working without ongoing spend.' },
    ]
  }
  if (inputs.monthlyBudget === '$500-2000') {
    return [
      { channel: 'Paid acquisition', amount: '$400–1200', percentage: 60, rationale: 'Scale the channel that already generates leads.' },
      { channel: 'Tools & creative', amount: '$100–300', percentage: 20, rationale: 'Tracking, creative, or freelancer support.' },
      { channel: 'Reserve / test', amount: '$100–500', percentage: 20, rationale: 'Test a second channel or offer.' },
    ]
  }
  return [
    { channel: 'Paid acquisition', amount: 'Majority', percentage: 70, rationale: 'Scale what works with clear attribution.' },
    { channel: 'Tools & team', amount: '20%', percentage: 20, rationale: 'Tracking, creative, or part-time help.' },
    { channel: 'Test & learn', amount: '10%', percentage: 10, rationale: 'New channels or offers.' },
  ]
}
