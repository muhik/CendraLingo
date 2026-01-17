"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UserProgress } from "@/components/learn/user-progress";
import { useUserProgress } from "@/store/use-user-progress";
import { ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";

interface StickyHeaderProps {
    title?: string;
}

export const StickyHeader = ({ title }: StickyHeaderProps = {}) => {
    const { hearts, points, hasActiveSubscription } = useUserProgress();
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    if (!isClient) return <div className="h-16 w-full bg-[#022c22] border-b border-white/10"></div>; // Loading state

    return (
        <div className="sticky top-0 w-full z-50 bg-background-light/95 dark:bg-background-dark/95 backdrop-blur-sm border-b border-gray-200 dark:border-[#23482f] px-6 py-3 lg:hidden">
            <div className="flex items-center justify-between h-full">
                <div className="flex items-center gap-3">
                    <div className="relative h-8 w-8">
                        <Image src="/mascot.svg" fill alt="Logo" className="object-contain" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-[#112217] dark:text-white">{title || "Cendra"}</span>
                </div>
                <UserProgress
                    hearts={hearts}
                    points={points}
                    hasActiveSubscription={hasActiveSubscription}
                />
                {/* Mobile Menu Button could go here */}
            </div>
        </div>
    );
};
