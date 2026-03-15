'use client'

import React from 'react'
import { Target, TrendingUp, DollarSign, Users, AlertCircle } from 'lucide-react'
import type { MoneyMapData } from '@/lib/growth-roadmap'

export function MoneyMapView({
  data,
  businessName,
}: {
  data: MoneyMapData
  businessName: string
}) {
  const confidenceLabel = data.confidence === 'high' ? 'High (key inputs provided)' : data.confidence === 'medium' ? 'Medium (some defaults used)' : 'Low (many defaults used)'

  return (
    <div className="space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-1">The Money Map</h1>
          <p className="text-slate-500 font-medium">Growth Roadmap for <span className="text-purple-600 font-bold">{businessName}</span></p>
        </div>
      </div>

      {/* North Star + One-liner */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Target size={20} className="text-purple-500" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">North Star Goal</span>
          </div>
          <p className="text-xl font-bold text-slate-900 mb-1">{data.northStarGoal}</p>
          <p className="text-2xl font-black text-purple-600">{data.targetValue}</p>
        </div>
        <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100">
          <div className="flex items-center gap-2 mb-3">
            <AlertCircle size={18} className="text-slate-400" />
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Confidence</span>
          </div>
          <p className="text-sm font-bold text-slate-700">{confidenceLabel}</p>
        </div>
      </div>

      <p className="text-slate-600 text-sm leading-relaxed bg-purple-50/50 border border-purple-100 rounded-xl p-4">
        <strong className="text-slate-800">One-liner:</strong> {data.oneLinerStrategy}
      </p>

      {/* Required Throughput — KPI tiles */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
          <TrendingUp size={20} className="text-purple-500" />
          Required Throughput
        </h2>
        <p className="text-slate-500 text-sm mb-4">What it takes to hit your goal (based on your inputs and assumptions below).</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Customers / month needed</div>
            <div className="text-2xl font-black text-slate-900">{data.requiredCustomersPerMonth}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Leads / month needed</div>
            <div className="text-2xl font-black text-slate-900">{data.requiredLeadsPerMonth}</div>
          </div>
          <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Target CPL/CAC range</div>
            <div className="text-2xl font-black text-slate-900">{data.cplCacRange}</div>
          </div>
        </div>
      </div>

      {/* Assumptions (editable later) */}
      <div className="bg-slate-50 rounded-2xl border border-slate-100 p-6">
        <h3 className="text-sm font-bold text-slate-700 mb-3 flex items-center gap-2">
          <DollarSign size={16} className="text-slate-500" />
          Assumptions used
        </h3>
        <ul className="space-y-2 text-sm text-slate-600">
          {data.assumptions.map((a, i) => (
            <li key={i} className="flex justify-between items-center">
              <span>{a.label}</span>
              <span className="font-bold text-slate-800">{a.value}</span>
            </li>
          ))}
        </ul>
        <p className="text-xs text-slate-500 mt-3">You can edit these in a future update to refine your roadmap.</p>
      </div>
    </div>
  )
}
