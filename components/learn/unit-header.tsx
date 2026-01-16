"use client";

import { CheckCircle2, Lock } from "lucide-react";
import { cn } from "@/lib/utils";

interface UnitHeaderProps {
    title: string;
    description: string;
    isActive: boolean;
    isCompleted: boolean;
    isLocked: boolean;
}

export const UnitHeader = ({
    title,
    description,
    isActive,
    isCompleted,
    isLocked
}: UnitHeaderProps) => {

    // Active State: Primary Green Background
    if (isActive) {
        return (
            <div className="w-full bg-primary rounded-2xl p-4 mb-6 flex items-center justify-between shadow-[0_4px_0_0_#1e9e49] border-b-0 relative overflow-hidden transition-transform hover:-translate-y-1">
                <div className="relative z-10">
                    <h3 className="text-xl font-bold text-[#112217] mb-1">{title}</h3>
                    <p className="text-[#112217]/80 font-medium text-sm mt-1">{description}</p>
                </div>
                <div className="bg-[#112217]/10 px-3 py-1 rounded-lg text-[#112217] text-sm font-bold flex items-center gap-1 backdrop-blur-sm">
                    <div className="h-2 w-2 rounded-full bg-[#112217] animate-pulse" />
                    <span className="uppercase tracking-widest text-xs">Current</span>
                </div>
            </div>
        );
    }

    // Completed State: Dark Green Background
    if (isCompleted) {
        return (
            <div className="w-full bg-[#23482f] rounded-2xl p-4 mb-6 flex items-center justify-between shadow-sm hover:opacity-100 transition-opacity">
                <div>
                    <h3 className="text-lg font-bold text-white mb-1">{title}</h3>
                    <p className="text-gray-300 text-sm mt-1">{description}</p>
                </div>
                <div className="bg-card-dark px-3 py-1 rounded-lg border border-primary/20 text-primary text-sm font-bold flex items-center gap-1">
                    <CheckCircle2 className="h-4 w-4" />
                    <span className="uppercase tracking-wider text-xs">Completed</span>
                </div>
            </div>
        )
    }

    // Locked State
    return (
        <div className="w-full bg-[#23482f] rounded-2xl p-4 mb-6 flex items-center justify-between opacity-70 grayscale select-none">
            <div>
                <h3 className="text-lg font-bold text-gray-300">{title}</h3>
                <p className="text-gray-500 text-sm mt-1">{description}</p>
            </div>
            <Lock className="h-5 w-5 text-gray-500" />
        </div>
    );
};
