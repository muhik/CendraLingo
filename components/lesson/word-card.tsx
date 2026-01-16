"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface WordCardProps {
    text: string;
    onClick: () => void;
    disabled?: boolean;
    active?: boolean;
}

export const WordCard = ({ text, onClick, disabled, active }: WordCardProps) => {
    return (
        <Button
            variant="none"
            onClick={onClick}
            disabled={disabled}
            className={cn(
                "h-14 font-bold text-lg px-6 rounded-2xl border-2 border-b-4 active:border-b-2 transition select-none mx-1 my-1 float-left",
                // Default State (In Bank)
                "bg-white border-slate-200 text-slate-700 hover:bg-slate-50",

                // Active State (In Sentence Line)
                active && "bg-transparent border-transparent text-transparent pointer-events-none shadow-none",

                // Disabled (Used placeholder)
                disabled && "pointer-events-none opacity-50"
            )}
        >
            <span className={cn(active && "invisible")}>{text}</span>
        </Button>
    );
};
