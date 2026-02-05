// lib/mock-plan.ts
import { GrowthPlan } from '@/types/marketing-plan';

export const MOCK_PLAN: GrowthPlan = {
  meta: {
    businessName: "Lumina Dental Studio",
    generatedDate: "February 5, 2026",
    version: "2.0 - Strategic Masterclass",
    consultantName: "GoaLine Strategy Engine",
  },
  executiveSummary: {
    diagnosis: [
      "Clinical Excellence vs. Digital Invisibility: You are likely the best dentist in Lehi, but Google doesn't know it yet.",
      "Trust Gap: Your website functions like a brochure, not a concierge. It lacks the 'instant trust' signals new patients need.",
      "Revenue Rollercoaster: Relying on referrals creates great months and scary months. We need predictable systems.",
    ],
    strategyOneLiner: "Stop chasing 'leads' and start building a 'Digital Moat' that makes you the undeniable choice in Lehi.",
    top3Initiatives: [
      {
        title: "Dominate the 'Map Pack'",
        why: "When someone has a toothache, they don't browse. They look at the top 3 maps results. You are currently invisible there.",
        expectedOutcome: "Become a top-3 result for 'Implants Lehi' within 60 days.",
      },
      {
        title: "The 'High-Trust' Website",
        why: "Strangers are skeptical. Your site needs to prove you are safe, affordable, and expert in under 5 seconds.",
        expectedOutcome: "Double the number of calls from the traffic you already get.",
      },
      {
        title: "Automate Your Reputation",
        why: "Hope is not a strategy. We will install a system that asks for reviews automatically.",
        expectedOutcome: "10 new 5-star reviews every single month.",
      },
    ],
  },
  businessBrief: {
    inputs: [
      { label: "Industry", value: "Dental / Cosmetic" },
      { label: "Location", value: "Lehi, Utah" },
      { label: "Monthly Budget", value: "$1,500" },
      { label: "Marketing Experience", value: "Novice / None" },
    ],
    constraints: [
      "No dedicated marketing staff (Doctor + Admin only).",
      "Strict HIPAA compliance required (Patient privacy).",
      "Goal is high-value cases (Implants), not just cleanings.",
    ],
    competitiveReality: "Lehi has over 15 dental practices. Most compete on 'General Dentistry' (low margin). You must position yourself as the 'Specialist' for high-value outcomes to win.",
  },
  northStar: {
    primaryObjective: "Acquire 20 Qualified New Patients / Month",
    kpis: {
      leading: ["Google Map Views", "Website Click-to-Calls", "Online Booking Starts"],
      lagging: ["New Patient Count", "Treatment Acceptance Rate", "Monthly Revenue"],
    },
    baselineAssumptions: [
      "Average Patient Value (LTV): $1,200 (Conservative estimate)",
      "Conversion Rate: We assume 3% of website visitors will call. Our goal is 5%.",
      "Volume Needed: To get 20 patients, we need roughly 50-60 qualified phone calls.",
    ],
  },
  measurement: {
    concept: "Marketing is math, not magic. Before we spend a dollar, we must be able to track where every penny goes. This setup ensures you never have to guess 'is this working?'",
    week1Checklist: [
      { 
        task: "Set up Google Analytics 4 (GA4)", 
        description: "This is the standard tool for measuring website traffic.", 
        howTo: "Ask your web developer to 'Install the GA4 snippet' on your site. If you use WordPress, use the 'Site Kit by Google' plugin.", 
        done: false 
      },
      { 
        task: "Configure 'Conversion Events'", 
        description: "Traffic doesn't pay the bills; bookings do. We need to tell Google when a 'success' happens.", 
        howTo: "In GA4, mark 'Click to Call' and 'Form Submit' as Key Events. This allows us to see exactly which marketing channel brought the patient.", 
        done: false 
      },
      { 
        task: "Call Tracking (CallRail)", 
        description: "Most patients still pick up the phone. Standard analytics misses this.", 
        howTo: "Sign up for CallRail.com (approx $45/mo). It gives you a 'tracking number' that forwards to your office but records the source of the caller.", 
        done: false 
      },
    ],
    kpisToTrack: ["Total Phone Calls", "Website Conversion Rate", "Cost Per New Patient", "Review Velocity"],
  },
  playbooks: [
    {
      id: "p1",
      title: "Google Maps Domination",
      subtitle: "Capturing the 'High Intent' Patient",
      conceptDefinition: "What is the 'Map Pack'? It is the block of 3 businesses that shows up at the top of Google Search results. 76% of all clicks go to these three spots.",
      whyItMatters: "For a local dentist, this is more valuable than your website. Being here means you are 'Google Verified' and 'Neighbor Approved'. Being absent means you are invisible.",
      successMetrics: ["Appear in Top 3 for 'Dentist Lehi'", "+40% Increase in Direction Requests"],
      steps: [
        {
          stepNumber: 1,
          title: "Optimize Your Primary Category",
          educationalContext: "Google decides who to show based on 'Categories'. Most dentists just pick 'Dentist'. This puts you in a bucket with everyone.",
          actionInstruction: "Log into your Google Business Profile. Set your Primary Category to 'Cosmetic Dentist' (if that is your focus) or 'Dental Implants Periodontist'. This signals to Google you are a specialist.",
          proTip: "Do not stuff keywords in your business name. It is against Google's terms. Just use 'Lumina Dental Studio'."
        },
        {
          stepNumber: 2,
          title: "The 'Photo Freshness' Signal",
          educationalContext: "Google's algorithm loves activity. A profile that uploads photos regularly is seen as 'alive' and gets ranked higher.",
          actionInstruction: "Take your phone. Walk around the office. Take 1 photo of the waiting room, 1 of the front desk team (smiling), and 1 of the exterior. Upload these to the 'Photos' tab.",
          proTip: "Avoid stock photos. Google's AI can recognize them and will ignore them. Real, imperfect photos convert better."
        },
        {
          stepNumber: 3,
          title: "Seed Your 'Q&A' Section",
          educationalContext: "There is a 'Questions & Answers' section on your profile. You don't have to wait for patients to ask! You can post the questions yourself.",
          actionInstruction: "Click 'Ask a Question'. Type: 'Do you accept insurance?' Then switch accounts (or reply as owner) and answer: 'Yes, we accept most major PPO plans including...'. Do this for your top 5 FAQs."
        }
      ],
      assets: [
        { 
          title: "Weekly Offer Post Template", 
          type: "Template", 
          content: "Use this for your weekly Google Update:\n\nHeadline: Free Implant Consultation (This Week Only)\n\nBody: Thinking about restoring your smile? Dr. Smith has opened 3 spots this week for a complimentary implant assessment (Value $150). We will review your options, costs, and financing.\n\nCTA Button: Book Online" 
        },
      ]
    },
    {
      id: "p2",
      title: "The Trust-First Website",
      subtitle: "Turning Visitors into Patients",
      conceptDefinition: "Your website has one job: To reduce anxiety. New patients are scared of pain, cost, and judgment. Your site must answer those fears in 5 seconds.",
      whyItMatters: "You are currently paying for traffic (or working hard for it), but if your website is confusing, you are pouring water into a leaky bucket.",
      successMetrics: ["Conversion Rate > 5%", "Bounce Rate < 40%"],
      steps: [
        {
          stepNumber: 1,
          title: "The 'Above the Fold' Fix",
          educationalContext: "'Above the fold' means what a user sees before they scroll. If they don't see who you are, where you are, and why they should care instantly, they leave.",
          actionInstruction: "Ensure your main headline says: 'Pain-Free Dental Implants in Lehi'. Immediately below it, place 3 badges: 'Insurance Accepted', '0% Financing', and '5-Star Rated'.",
        },
        {
          stepNumber: 2,
          title: "The Sticky Mobile Button",
          educationalContext: "Most people will visit your site on a phone. If they have to scroll back to the top to find your phone number, you lose them.",
          actionInstruction: "Ask your web developer to install a 'Sticky Footer Bar'. This is a bar that stays at the bottom of the phone screen with two buttons: 'Call Now' and 'Book Online'.",
          proTip: "Make the 'Call Now' button green and the 'Book Online' button blue to distinguish them."
        }
      ],
      assets: [
        { 
          title: "High-Converting Headline Formulas", 
          type: "Template", 
          content: "Option 1 (Benefit Focused): 'Wake Up with a Perfect Smile — Same-Day Implants in Lehi.'\n\nOption 2 (Trust Focused): 'Lehi's Most Trusted Cosmetic Dentist. 500+ 5-Star Reviews.'" 
        },
      ]
    },
    {
      id: "p3",
      title: "The Review Engine",
      subtitle: "Automating Social Proof",
      conceptDefinition: "Reviews are the digital version of word-of-mouth. But you cannot rely on patients remembering to leave them. You must operationalize it.",
      whyItMatters: "Recent reviews (last 2 weeks) matter more than total reviews. A steady drip of new reviews tells Google you are the market leader.",
      successMetrics: ["10+ New Reviews/Month", "4.9 Average Rating"],
      steps: [
        {
          stepNumber: 1,
          title: "The '2-Hour' Rule",
          educationalContext: "The best time to ask for a review is not while they are in the chair (too awkward) and not 3 days later (they forgot). It is exactly 2 hours after they leave.",
          actionInstruction: "Configure your patient management software (e.g., NexHealth, Weave) to automatically send an SMS 2 hours after the appointment ends."
        },
        {
          stepNumber: 2,
          title: "The 'Gatekeeper' Logic",
          educationalContext: "You want to protect your reputation. We only want to send the public Google link to happy patients.",
          actionInstruction: "The text should say: 'Hi [Name], how was your visit today? 1-5'. If they reply 1-3, send them to a private feedback form. If they reply 4-5, send them the Google Maps link.",
        }
      ],
      assets: [
        { 
          title: "Perfect Review Request Script", 
          type: "Script", 
          content: "SMS Template:\n'Hi [Name], Dr. Smith loved seeing you today! We are trying to help more Lehi families find a dentist they can trust. Would you mind clicking this link to share your experience? It takes 10 seconds: [Link]'" 
        },
      ]
    }
  ],
  demandGeneration: {
    routines: [
      { frequency: "Weekly", task: "Upload 3 Photos", role: "Admin", why: "Keeps Google profile active." },
      { frequency: "Weekly", task: "Respond to Reviews", role: "Admin", why: "Shows patients you care." },
      { frequency: "Monthly", task: "Refresh Offers", role: "You", why: "Prevents 'ad blindness'." },
    ],
  },
  resources: {
    monthlyBudgetSplit: [
      { channel: "Local Service Ads (LSA)", amount: "$1,000", percentage: 65, rationale: "These are the 'Google Screened' ads at the very top. You only pay when a qualified patient calls you. Highest ROI for dentists." },
      { channel: "Software Tools", amount: "$300", percentage: 20, rationale: "Includes call tracking (CallRail) and review automation software." },
      { channel: "Community", amount: "$200", percentage: 15, rationale: "Sponsoring a local youth team builds brand awareness in Lehi." },
    ],
  },
  roadmap: {
    phase1: [
      { week: 1, title: "Tracking Foundation", description: "We install the 'speedometer' before we drive the car. Setup GA4 and CallRail.", owner: "Dev", impact: "High" },
      { week: 2, title: "Google Profile Cleanup", description: "Fill out every single field on your Google Business Profile.", owner: "You", impact: "High" },
      { week: 3, title: "Review Automation", description: "Turn on the automatic SMS request system.", owner: "Staff", impact: "High" },
    ],
    phase2: [
      { week: 5, title: "Launch LSA Ads", description: "Start the 'Google Screened' ads to generate immediate calls.", owner: "You", impact: "High" },
      { week: 6, title: "Website Conversion Fixes", description: "Update the homepage header and add sticky mobile buttons.", owner: "Dev", impact: "Medium" },
    ],
    phase3: [
      { week: 9, title: "Referral Program", description: "Launch in-office 'Care to Share' cards.", owner: "Staff", impact: "Medium" },
    ],
  },
};