// types/marketing-plan.ts

export type Impact = 'Low' | 'Medium' | 'High';
export type Effort = 'Low' | 'Medium' | 'High';

export interface GrowthPlan {
  meta: {
    businessName: string;
    generatedDate: string;
    version: string;
    consultantName: string; // e.g. "GoaLine AI Strategist"
  };

  // 1. EXEC SUMMARY (Unchanged - this is the "at a glance" view)
  executiveSummary: {
    diagnosis: string[];
    strategyOneLiner: string;
    top3Initiatives: Array<{
      title: string;
      why: string;
      expectedOutcome: string;
    }>;
  };

  // 2. BUSINESS BRIEF (Unchanged)
  businessBrief: {
    inputs: { label: string; value: string }[];
    constraints: string[];
    competitiveReality: string;
  };

  // 3. NORTH STAR (Unchanged)
  northStar: {
    primaryObjective: string;
    kpis: { leading: string[]; lagging: string[] };
    baselineAssumptions: string[];
  };

  // 4. MEASUREMENT (Deepened)
  measurement: {
    // We add an educational preamble
    concept: string; // e.g. "Why you can't improve what you don't track..."
    week1Checklist: Array<{ 
      task: string; 
      description: string; // "What this means..."
      howTo: string; // "Click here, do this..."
      done: boolean 
    }>;
    kpisToTrack: string[];
  };

  // 5. STRATEGY PLAYBOOKS (The Massive Upgrade)
  playbooks: Array<{
    id: string;
    title: string;
    subtitle: string;
    
    // THE "TEACHING" SECTION
    conceptDefinition: string; // e.g. "What is Local SEO?"
    whyItMatters: string; // "Why this specific tactic wins for Dentists..."
    
    successMetrics: string[];
    
    // THE "DOING" SECTION (Step-by-Step SOP)
    steps: Array<{
      stepNumber: number;
      title: string;
      educationalContext: string; // "Most people fail here because..."
      actionInstruction: string; // "Go to settings > profile > ..."
      proTip?: string; 
    }>;
    
    assets: Array<{ title: string; type: 'Script' | 'Template' | 'Checklist'; content: string }>;
  }>;

  // ... (Roadmap, Demand Engine, Resources remain similar but we will render them differently)
  demandGeneration: {
    routines: Array<{ frequency: string; task: string; role: string; why: string }>;
  };

  resources: {
    monthlyBudgetSplit: Array<{ channel: string; amount: string; percentage: number; rationale: string }>;
  };

  roadmap: {
    phase1: RoadmapItem[];
    phase2: RoadmapItem[];
    phase3: RoadmapItem[];
  };
}

export interface RoadmapItem {
  week: number;
  title: string;
  description: string;
  owner: 'You' | 'Staff' | 'Dev';
  impact: Impact;
}