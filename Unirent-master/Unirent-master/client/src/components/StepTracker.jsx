import React from 'react';
import { Check, Clock, Package, Share2, Flag } from 'lucide-react';

const StepTracker = ({ currentStatus, type = 'renter' }) => {
    const steps = [
        {
            id: 'pending',
            label: 'Request',
            icon: <Clock size={14} />,
            matches: ['pending']
        },
        {
            id: 'approved',
            label: 'Approved',
            icon: <Check size={14} />,
            matches: ['approved']
        },
        {
            id: 'active',
            label: 'Handover',
            icon: <Package size={14} />,
            matches: ['active']
        },
        {
            id: 'returning',
            label: 'Return',
            icon: <Share2 size={14} />,
            matches: ['requested_return']
        },
        {
            id: 'completed',
            label: 'Done',
            icon: <Flag size={14} />,
            matches: ['completed']
        },
    ];

    // Determine current index
    const currentIndex = steps.findIndex(step => step.matches.includes(currentStatus));

    // Fallback if status doesn't match exactly (e.g. cancelled)
    const effectiveIndex = currentIndex === -1 ? 0 : currentIndex;

    return (
        <div className="w-full py-4 mb-2">
            <div className="relative flex justify-between items-center">
                {/* Background Line */}
                <div className="absolute top-1/2 left-0 w-full h-0.5 bg-slate-100 -translate-y-1/2 z-0" />

                {/* Progress Line */}
                <div
                    className="absolute top-1/2 left-0 h-0.5 bg-indigo-500 -translate-y-1/2 z-0 transition-all duration-700 ease-out"
                    style={{ width: `${(effectiveIndex / (steps.length - 1)) * 100}%` }}
                />

                {steps.map((step, index) => {
                    const isCompleted = index < effectiveIndex;
                    const isActive = index === effectiveIndex;
                    const isFuture = index > effectiveIndex;

                    return (
                        <div key={step.id} className="relative z-10 flex flex-col items-center">
                            <div className={`
                                w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300
                                ${isActive ? 'bg-indigo-600 text-white scale-125 shadow-lg shadow-indigo-200 ring-4 ring-white' : ''}
                                ${isCompleted ? 'bg-indigo-500 text-white' : ''}
                                ${isFuture ? 'bg-white text-slate-300 border border-slate-100' : ''}
                            `}>
                                {isCompleted ? <Check size={14} /> : step.icon}
                            </div>
                            <span className={`
                                absolute top-10 text-[8px] font-black uppercase tracking-wider whitespace-nowrap italic
                                ${isActive ? 'text-indigo-600 scale-110' : 'text-slate-400'}
                                ${isCompleted ? 'text-indigo-400' : ''}
                            `}>
                                {step.label}
                            </span>
                        </div>
                    );
                })}
            </div>
            <div className="mt-8" /> {/* Spacer for labels */}
        </div>
    );
};

export default StepTracker;
