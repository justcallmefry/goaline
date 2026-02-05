import React from 'react';
import { Search, ChevronDown } from 'lucide-react';

export default function ExploreTemplates() {
  return (
    <div className="space-y-8 pb-10">
      
      {/* 1. HEADER & CONTROLS */}
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Explore Templates</h1>
          <p className="text-slate-500 mt-1">Browse industry-standard growth plans to kickstart your strategy.</p>
        </div>

        {/* Search & Filter Bar */}
        <div className="flex flex-col lg:flex-row gap-4 justify-between">
          
          {/* Search Input */}
          <div className="relative w-full lg:w-96">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
            <input 
              type="text" 
              placeholder="Search templates..." 
              className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm outline-none focus:border-purple-500 focus:ring-4 focus:ring-purple-50 transition-all"
            />
          </div>

          {/* Filters Row */}
          <div className="flex flex-wrap gap-3">
            <FilterButton label="Industry" />
            <FilterButton label="Plans" />
            <FilterButton label="Category" />
            <FilterButton label="Objective" />
            <FilterButton label="Timeframe" />
            <FilterButton label="$145 - $175" />
          </div>
        </div>
      </div>

      {/* 2. TEMPLATES GRID */}
      {/* Using dashboard-grid from globals.css for consistent layout */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {TEMPLATES.map((template, i) => (
          <TemplateCard key={i} data={template} />
        ))}
      </div>

    </div>
  );
}

// --- SUB COMPONENTS ---

function FilterButton({ label }: { label: string }) {
  return (
    <button className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 rounded-lg text-sm font-semibold text-slate-600 hover:border-purple-300 hover:text-purple-600 transition-all">
      {label}
      <ChevronDown size={14} className="text-slate-400" />
    </button>
  );
}

function TemplateCard({ data }: { data: any }) {
  return (
    <div className="bg-white rounded-[24px] overflow-hidden border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-purple-100/50 hover:-translate-y-1 transition-all cursor-pointer group h-full flex flex-col">
      
      {/* Image Area */}
      <div className="h-48 overflow-hidden relative bg-slate-100">
        <img 
          src={data.image} 
          alt={data.title} 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      {/* Content Area */}
      <div className="p-6 flex-1 flex flex-col">
        
        {/* Tags */}
        <div className="flex flex-wrap gap-2 mb-4">
          {data.tags.map((tag: string, i: number) => (
            <span key={i} className="px-3 py-1 rounded-md bg-purple-50 text-purple-700 text-[10px] font-bold uppercase tracking-wide">
              {tag}
            </span>
          ))}
        </div>

        {/* Text */}
        <h3 className="text-xl font-bold text-slate-900 mb-2">{data.title}</h3>
        <p className="text-sm text-slate-500 leading-relaxed mb-6 flex-1">
          {data.description}
        </p>

        {/* Footer / CTA */}
        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
           <span className="text-xs font-bold text-slate-400">{data.stats}</span>
           <button className="text-sm font-bold text-purple-600 hover:text-purple-700">View Template →</button>
        </div>
      </div>
    </div>
  );
}

// --- UPDATED MOCK DATA WITH WORKING IMAGES ---

const TEMPLATES = [
  {
    title: "Startup Expansion Goal",
    description: "Delivering innovative software solutions that empower businesses through subscription-based models.",
    tags: ["Software", "TechSolutions"],
    // Clean Laptop/Chart image
    image: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800&auto=format&fit=crop&q=60",
    stats: "1.2k Uses"
  },
  {
    title: "Home Service",
    description: "Providing reliable home services, from repairs to installations, ensuring comfort and convenience for homeowners.",
    tags: ["HomeImprovement", "Maintenance"],
    // NEW IMAGE: Clean kitchen/interior renovation
    image: "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=60",
    stats: "850 Uses"
  },
  {
    title: "Marketing Agency",
    description: "Helping businesses grow through tailored marketing strategies that drive awareness and customer engagement.",
    tags: ["DigitalMarketing", "BrandStrategy"],
    // Creative office vibe
    image: "https://images.unsplash.com/photo-1552664730-d307ca884978?w=800&auto=format&fit=crop&q=60",
    stats: "2.4k Uses"
  },
  {
    title: "E-Commerce",
    description: "Running online stores and offering a seamless shopping experience to boost product sales and customer loyalty.",
    tags: ["OnlineRetail", "SalesGrowth"],
    // NEW IMAGE: Online shopping/laptop vibe
    image: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&auto=format&fit=crop&q=60",
    stats: "3.1k Uses"
  },
  {
    title: "Manufacturing",
    description: "Optimizing production processes and improving supply chain efficiency to deliver high-quality products at scale.",
    tags: ["Production", "Efficiency"],
    // Industrial factory line
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&auto=format&fit=crop&q=60",
    stats: "500 Uses"
  },
  {
    title: "Medical Spa",
    description: "Providing luxurious medical spa services that promote wellness, beauty through specialized treatments.",
    tags: ["HealthAndBeauty", "Wellness"],
    // Spa/Massage vibe
    image: "https://images.unsplash.com/photo-1600334089648-b0d9d3028eb2?w=800&auto=format&fit=crop&q=60",
    stats: "920 Uses"
  }
];