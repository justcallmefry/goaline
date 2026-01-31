'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

type TourGuideProps = {
  active: boolean;
  onClose: () => void;
  onNext: () => void;
  stepIndex: number;
  totalSteps: number;
};

export function TourGuide({ active, onClose, onNext, stepIndex, totalSteps }: TourGuideProps) {
    const [position, setPosition] = useState<{top: number, left: number, width: number, height: number} | null>(null);
    
    const steps = [
        { id: 'lane-awareness', title: 'The Awareness Phase', text: 'Start here. These tactics are purely for getting noticed by new people who don\'t know you yet.' },
        { id: 'lane-conversion', title: 'The Conversion Phase', text: 'This is where money is made. Tactics here turn "interested leads" into "paying customers".' },
        { id: 'lane-retention', title: 'The Retention Phase', text: 'Don\'t forget your existing customers! Use these tactics to increase Lifetime Value (LTV).' },
        { id: 'tour-library-btn', title: 'Tactic Library', text: 'Stuck? Click here to open our curated library of growth hacks and drag them onto your board.' },
        { id: 'tour-ai-btn', title: 'AI Strategist', text: 'Need a custom plan? Tell our AI your business goals, and it will generate a tailored strategy for you instantly.' },
        { id: 'tour-download-btn', title: 'Export Report', text: 'Ready to present? Click here to download your entire strategy as a professional PDF with budget breakdowns.' },
        { id: 'tour-profile-btn', title: 'Branding Settings', text: 'Important! Click here to add your Company Name and Logo so your PDF reports look professional.' }
    ];

    const currentStep = steps[stepIndex];

    useEffect(() => {
        if (!active) return;
        
        // MOBILE GUARD: Double check to kill tour on mobile
        if (window.innerWidth < 768) { 
            onClose(); 
            return; 
        }

        const timer = setTimeout(() => {
            // Find the element by ID or by partial ID match
            const element = document.getElementById(currentStep.id) || document.querySelector(`[id*="${currentStep.id}"]`);
            if (element) {
                const rect = element.getBoundingClientRect();
                setPosition({
                    top: rect.top,
                    left: rect.left,
                    width: rect.width,
                    height: rect.height
                });
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
        return () => clearTimeout(timer);
    }, [stepIndex, active, currentStep.id, onClose]);

    if (!active || !position) return null;

    // Safety Calculations to keep tooltip on screen
    const tooltipTop = position.top + position.height + 20;
    const isTooLow = tooltipTop + 200 > window.innerHeight;
    const finalTop = isTooLow ? position.top - 220 : tooltipTop; 
    const maxLeft = window.innerWidth - 420; 
    const finalLeft = Math.min(Math.max(20, position.left), maxLeft);

    return (
        <div 
            className="fixed inset-0 z-[100] bg-slate-900/70 transition-all duration-300 cursor-pointer hidden md:block"
            onClick={onClose} // CLICK BACKGROUND TO CLOSE
        >
            {/* The Highlight Box (Hole in the darkness) */}
            <div 
                className="absolute bg-transparent border-4 border-indigo-500 rounded-xl shadow-[0_0_0_9999px_rgba(15,23,42,0.8)] transition-all duration-500 ease-in-out pointer-events-none"
                style={{ top: position.top - 10, left: position.left - 10, width: position.width + 20, height: position.height + 20 }}
            />
            
            {/* The Tooltip Card */}
            <div 
                onClick={(e) => e.stopPropagation()} 
                className="absolute bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full transition-all duration-500 ease-in-out cursor-default"
                style={{ top: finalTop, left: finalLeft }}
            >
                <div className="flex justify-between items-start mb-3">
                    <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-2 py-1 rounded">Step {stepIndex + 1} of {totalSteps}</span>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-600"><X size={16} /></button>
                </div>
                <h3 className="text-lg font-black text-slate-900 mb-2">{currentStep.title}</h3>
                <p className="text-sm text-slate-500 mb-6 leading-relaxed">{currentStep.text}</p>
                <div className="flex justify-end gap-2">
                    {stepIndex < totalSteps - 1 ? (
                        <button onClick={onNext} className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-200 cursor-pointer">Next Step</button>
                    ) : (
                        <button onClick={onClose} className="bg-emerald-500 text-white px-6 py-2 rounded-lg font-bold text-xs uppercase tracking-widest hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200 cursor-pointer">Finish Tour</button>
                    )}
                </div>
            </div>
        </div>
    );
}