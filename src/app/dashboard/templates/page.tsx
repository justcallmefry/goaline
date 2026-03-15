"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Search, ChevronDown, X } from 'lucide-react';

// --- DROPDOWN OPTIONS (toolbox v1) ---

const INDUSTRIES = [
  'Home Services (HVAC, plumbing, electricians, roofing, cleaning)',
  'Health & Medical (primary care, dental, chiropractic, PT)',
  'Beauty & Wellness (med spa, salon, fitness, yoga)',
  'Professional Services (law, accounting, financial advisors, consultants)',
  'Real Estate (agents, brokerages, property management)',
  'Auto (repair, detailing, body shop, dealerships)',
  'Restaurants & Food (restaurants, cafes, catering, food trucks)',
  'Retail (brick-and-mortar)',
  'Ecommerce (DTC brands)',
  'B2B Services (agencies, IT, managed services, commercial services)',
  'SaaS / Software',
  'Education (tutoring, courses, training centers)',
  'Construction / Trades (builders, remodelers, specialty trades)',
  'Hospitality & Travel (hotels, tours, short-term rentals)',
  'Nonprofit & Community',
  'Events & Entertainment (venues, DJs, photographers)',
  'Manufacturing / Industrial',
  'Other (describe your industry)',
];

const PLAN_TYPES = [
  'Launch Plan (new business/new product)',
  '90-Day Growth Sprint (general growth)',
  'Lead Generation System',
  'Local Domination (GBP + reviews + local SEO)',
  'Paid Ads Starter (Google/Meta starter system)',
  'Content Engine (blogs/video + distribution)',
  'Social Growth Plan (organic social)',
  'Email & SMS Lifecycle (welcome, abandon, winback)',
  'Referral / Word-of-Mouth Engine',
  'Retention & Repeat Purchase (especially ecommerce)',
  'Rebrand / Reposition Plan',
  'Seasonal Campaign Plan (Black Friday, summer promo, etc.)',
];

const CATEGORIES = [
  'SEO (Website / On-page)',
  'Local SEO + Google Business Profile',
  'Paid Search (Google Ads)',
  'Paid Social (Meta/TikTok/LinkedIn)',
  'Social Organic',
  'Content Marketing',
  'Email Marketing',
  'SMS Marketing',
  'Website Conversion (CRO)',
  'Offers & Pricing (packaging, promos)',
  'Reviews & Reputation',
  'Partnerships & Community',
  'Referrals & Loyalty',
  'Analytics & Tracking',
  'Sales Enablement (scripts, follow-up, pipeline)',
];

const OBJECTIVES = [
  'Get more leads',
  'Get more bookings/appointments',
  'Increase revenue',
  'Increase online sales',
  'Increase store foot traffic',
  'Build local awareness',
  'Improve conversion rate',
  'Grow email/SMS list',
  'Reactivate past customers',
  'Increase repeat purchase/retention',
  'Launch a new product/service',
  'Improve reputation (more reviews)',
  'Improve ROAS / reduce CAC',
  'Expand into a new market/location',
  'Build B2B pipeline (demo requests/consults)',
];

const TIMEFRAMES = [
  '7 Days (Quick Wins)',
  '14 Days (Setup & Launch)',
  '30 Days (Foundation)',
  '60 Days (Growth)',
  '90 Days (Sprint)',
  '6 Months (Scale)',
  '12 Months (Full Strategy)',
];

const COST_BANDS = [
  '$0 (Bootstrapped)',
  '$1–$250 (Tools only)',
  '$250–$750 (Light spend)',
  '$750–$1,500 (Starter ads + tools)',
  '$1,500–$3,500 (Multi-channel starter)',
  '$3,500–$7,500 (Aggressive growth)',
  '$7,500+ (Scale)',
];

const COST_HELPER = 'Estimated monthly ad + tool budget';

export default function ExploreTemplates() {
  const [search, setSearch] = useState('');
  const [industry, setIndustry] = useState<string | null>(null);
  const [plan, setPlan] = useState<string | null>(null);
  const [categories, setCategories] = useState<string[]>([]);
  const [objective, setObjective] = useState<string | null>(null);
  const [timeframe, setTimeframe] = useState<string | null>(null);
  const [cost, setCost] = useState<string | null>(null);

  return (
    <div className="space-y-8 pb-10">
      {/* 1. HEADER & CONTROLS */}
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Explore Templates</h1>
          <p className="text-slate-500 mt-1">Browse industry-standard growth plans to kickstart your strategy.</p>
        </div>

        {/* Search (own row so dropdowns don’t crowd it) */}
        <div className="relative w-full max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
          <input
            type="text"
            placeholder="Search templates..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all"
          />
        </div>

        {/* Filter dropdowns (separate row, can wrap) */}
        <div className="flex flex-wrap gap-3 items-center">
            <FilterDropdown
              label="Industry"
              options={INDUSTRIES}
              value={industry}
              onChange={setIndustry}
              placeholder="Any industry"
            />
            <FilterDropdown
              label="Plans"
              options={PLAN_TYPES}
              value={plan}
              onChange={setPlan}
              placeholder="Any plan"
            />
            <FilterDropdown
              label="Category"
              options={CATEGORIES}
              value={categories}
              onChange={setCategories}
              placeholder="Any category"
              multi
            />
            <FilterDropdown
              label="Objective"
              options={OBJECTIVES}
              value={objective}
              onChange={setObjective}
              placeholder="Any objective"
            />
            <FilterDropdown
              label="Timeframe"
              options={TIMEFRAMES}
              value={timeframe}
              onChange={setTimeframe}
              placeholder="Any timeframe"
            />
            <FilterDropdown
              label="Cost"
              options={COST_BANDS}
              value={cost}
              onChange={setCost}
              placeholder="Any budget"
              helper={COST_HELPER}
            />
        </div>
      </div>

      {/* 2. TEMPLATES GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {TEMPLATES.map((template, i) => (
          <TemplateCard key={i} data={template} />
        ))}
      </div>
    </div>
  );
}

// --- FILTER DROPDOWN (single or multi) ---

type SingleFilterProps = {
  label: string;
  options: string[];
  value: string | null;
  onChange: (v: string | null) => void;
  placeholder: string;
  helper?: string;
  multi?: false;
};

type MultiFilterProps = {
  label: string;
  options: string[];
  value: string[];
  onChange: (v: string[]) => void;
  placeholder: string;
  helper?: string;
  multi: true;
};

function FilterDropdown(props: SingleFilterProps | MultiFilterProps) {
  const { label, options, placeholder, helper, multi } = props;
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const singleValue = !multi ? (props.value as string | null) : null;
  const multiValue = multi ? (props.value as string[]) : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);

  const displayLabel = multi
    ? (multiValue.length ? `${label} (${multiValue.length})` : label)
    : (singleValue ? truncate(singleValue, 22) : label);

  const hasSelection = multi ? multiValue.length > 0 : !!singleValue;

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className={`flex items-center gap-2 px-4 py-2.5 bg-white border rounded-xl text-sm font-semibold transition-all min-w-[120px] ${
          hasSelection
            ? 'border-purple-300 text-purple-700 ring-2 ring-purple-50'
            : 'border-slate-200 text-slate-600 hover:border-purple-300 hover:text-purple-600'
        }`}
      >
        <span className="truncate">{displayLabel}</span>
        <ChevronDown size={14} className={`text-slate-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 w-72 max-h-80 overflow-y-auto bg-white border border-slate-200 rounded-xl shadow-lg shadow-slate-200/50 py-2 z-50">
          {helper && (
            <p className="px-4 py-2 text-[10px] text-slate-400 border-b border-slate-50">{helper}</p>
          )}
          {multi ? (
            <div className="px-2 py-1">
              {multiValue.length > 0 && (
                <button
                  type="button"
                  onClick={() => (props as MultiFilterProps).onChange([])}
                  className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50 rounded-lg"
                >
                  <X size={14} /> Clear all
                </button>
              )}
              {options.map((opt) => {
                const checked = multiValue.includes(opt);
                return (
                  <label
                    key={opt}
                    className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-slate-50 cursor-pointer text-sm text-slate-700"
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => {
                        const next = checked ? multiValue.filter((x) => x !== opt) : [...multiValue, opt];
                        (props as MultiFilterProps).onChange(next);
                      }}
                      className="rounded border-slate-300 text-purple-600 focus:ring-purple-500"
                    />
                    <span>{opt}</span>
                  </label>
                );
              })}
            </div>
          ) : (
            <div className="py-1">
              <button
                type="button"
                onClick={() => {
                  (props as SingleFilterProps).onChange(null);
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2 px-4 py-2 text-sm text-slate-500 hover:bg-slate-50"
              >
                <X size={14} /> Clear
              </button>
              {options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => {
                    (props as SingleFilterProps).onChange(opt);
                    setOpen(false);
                  }}
                  className={`w-full text-left px-4 py-2.5 text-sm rounded-lg mx-1 ${
                    singleValue === opt ? 'bg-purple-50 text-purple-700 font-semibold' : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function truncate(s: string, max: number) {
  return s.length <= max ? s : s.slice(0, max - 1) + '…';
}

// --- TEMPLATE CARD ---

function TemplateCard({ data }: { data: any }) {
  return (
    <div className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-purple-100/50 hover:-translate-y-1 transition-all cursor-pointer group h-full flex flex-col">
      <div className="h-48 overflow-hidden relative bg-slate-100">
        <img
          src={data.image}
          alt={data.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="p-6 flex-1 flex flex-col">
        <div className="flex flex-wrap gap-2 mb-4">
          {data.tags.map((tag: string, i: number) => (
            <span key={i} className="px-3 py-1 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wide">
              {tag}
            </span>
          ))}
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-2">{data.title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">{data.description}</p>
        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-400">{data.stats}</span>
          <button className="text-sm font-bold text-purple-600 hover:text-purple-700">View Template →</button>
        </div>
      </div>
    </div>
  );
}

// --- MOCK DATA ---

const TEMPLATES = [
  {
    title: 'Startup Expansion Goal',
    description: 'Delivering innovative software solutions that empower businesses through subscription-based models.',
    tags: ['Software', 'TechSolutions'],
    image: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60',
    stats: '1.2k Uses',
  },
  {
    title: 'Home Service',
    description: 'Providing reliable home services, from repairs to installations, ensuring comfort and convenience for homeowners.',
    tags: ['HomeImprovement', 'Maintenance'],
    image: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=60',
    stats: '850 Uses',
  },
  {
    title: 'Marketing Agency',
    description: 'Helping businesses grow through tailored marketing strategies that drive awareness and customer engagement.',
    tags: ['DigitalMarketing', 'BrandStrategy'],
    image: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=60',
    stats: '2.4k Uses',
  },
  {
    title: 'E-Commerce',
    description: 'Running online stores and offering a seamless shopping experience to boost product sales and customer loyalty.',
    tags: ['OnlineRetail', 'SalesGrowth'],
    image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60',
    stats: '3.1k Uses',
  },
  {
    title: 'Manufacturing',
    description: 'Optimizing production processes and improving supply chain efficiency to deliver high-quality products at scale.',
    tags: ['Production', 'Efficiency'],
    image: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60',
    stats: '500 Uses',
  },
  {
    title: 'Medical Spa',
    description: 'Providing luxurious medical spa services that promote wellness, beauty through specialized treatments.',
    tags: ['HealthAndBeauty', 'Wellness'],
    image: 'https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&auto=format&fit=crop&q=60',
    stats: '920 Uses',
  },
];
