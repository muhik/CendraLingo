"use client";

import { Check, Star, Lock, Video, Dumbbell, BookOpen, Headphones, Archive } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { MascotHeadset } from "@/components/learn/mascot-headset";
import Image from "next/image";
import { useUserProgress } from "@/store/use-user-progress";

interface LessonButtonProps {
    id: number;
    index: number;
    totalCount: number;
    locked?: boolean;
    current?: boolean;
    percentage: number;
    type?: "STAR" | "VIDEO" | "PRACTICE" | "STORY" | "HEADSET"; // Matches Curriculum Type
    onClick: (id: number, isCompleted: boolean, isLast: boolean) => void;
}

export const LessonButton = ({
    id,
    index,
    totalCount,
    locked,
    current,
    percentage,
    type = "STAR", // Default
    onClick,
}: LessonButtonProps) => {

    const cycleLength = 8;
    const cycleIndex = index % cycleLength;

    let indentationLevel;

    if (cycleIndex <= 2) {
        indentationLevel = cycleIndex;
    } else if (cycleIndex <= 4) {
        indentationLevel = 4 - cycleIndex;
    } else if (cycleIndex <= 6) {
        indentationLevel = 4 - cycleIndex;
    } else {
        indentationLevel = cycleIndex - 8;
    }

    const rightPosition = indentationLevel * 40;

    const isFirst = index === 0;
    const isLast = index === totalCount - 1;
    const isCompleted = !current && !locked;

    // Dynamic Icon Logic
    let Icon = Star;
    if (type === "VIDEO") Icon = Video;
    if (type === "PRACTICE") Icon = Dumbbell;
    if (type === "STORY") Icon = BookOpen;
    if (type === "HEADSET") Icon = Headphones;

    // Override: Last Lesson is a Treasure Chest
    if (isLast) Icon = Archive;

    // Override: If locked, use Lock
    if (locked) Icon = Lock;
    if (isCompleted && !isLast) Icon = Check;

    // Get isGuest state from store (login removed - guest stays guest until lesson completion)
    const { isGuest } = useUserProgress();

    const handleClick = () => {
        // Allow clicking if current (active) or completed (review)
        if (current || isCompleted || (isLast && !locked)) {
            // Guest stays guest - registration is prompted AFTER lesson completion
            onClick(id, isCompleted, isLast);
        }
    };

    return (
        <div
            className="relative flex justify-center"
            style={{
                right: `${rightPosition}px`,
                marginTop: isFirst ? 20 : 40, // More spacing for path
            }}
        >
            {current ? (
                <div className="size-20 relative cursor-pointer group" onClick={handleClick}>

                    {/* START BUBBLE */}
                    <div className="absolute -top-12 left-1/2 -translate-x-1/2 z-40 animate-bounce transition-transform group-hover:scale-110">
                        <div className="bg-white text-primary font-bold px-3 py-1.5 rounded-xl shadow-lg border border-primary/20 uppercase tracking-widest text-sm whitespace-nowrap relative">
                            Start
                            <div className="absolute -bottom-1.5 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45 border-b border-r border-primary/20" />
                        </div>
                    </div>

                    {/* Pulse Animation */}
                    <div className="absolute inset-0 rounded-full bg-primary opacity-20 animate-ping pointer-events-none" />

                    {/* Active Button */}
                    <Button
                        size="rounded"
                        className="h-20 w-20 bg-primary border-none shadow-[0_6px_0_0_#1e9e49] active:shadow-none active:translate-y-[6px] rounded-full z-30 relative hover:bg-primary hover:scale-105 transition-all text-[#112217]"
                        onClick={handleClick}
                    >
                        <Icon className="h-8 w-8 fill-current" />
                    </Button>
                </div>
            ) : (
                <Button
                    size="rounded"
                    variant="ghost"
                    className={cn(
                        "h-16 w-16 rounded-full relative transition-all z-10",
                        // Locked
                        locked && "bg-[#23482f] border-4 border-[#336342] text-gray-500 hover:bg-[#23482f]",
                        // Completed
                        isCompleted && !isLast && "bg-accent-gold shadow-[0_4px_0_0_#b8860b] active:shadow-none active:translate-y-[4px] border-none text-[#112217] hover:bg-accent-gold hover:scale-105",
                        // Chest (Last)
                        isLast && !locked && "bg-accent-gold/20 border-2 border-accent-gold text-accent-gold hover:bg-accent-gold/30"
                    )}
                    disabled={locked}
                    onClick={handleClick}
                >
                    <Icon
                        className={cn(
                            "h-6 w-6",
                            locked ? "text-gray-400" : "fill-current",
                            isLast && !locked && "h-8 w-8"
                        )}
                    />
                    {/* Checkmark Overlay (Optional, removed in template but kept for clarity if needed) 
                         Template doesn't show checkmark on nodes, so removing for fidelity. 
                     */}
                </Button>
            )}
        </div>
    );
};
