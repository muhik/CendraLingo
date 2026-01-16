"use client";

import { Progress } from "@/components/ui/progress";
import { X, InfinityIcon, Heart, Gem } from "lucide-react";
import Image from "next/image";
import { useExitModal } from "@/store/use-exit-modal"; // We'll make this later or just use router for now
import { useRouter } from "next/navigation";

export const Header = ({
    hearts,
    percentage,
    hasActiveSubscription,
    points,
}: {
    hearts: number;
    percentage: number;
    hasActiveSubscription: boolean;
    points: number;
}) => {
    const router = useRouter();

    return (
        <header className="lg:pt-[50px] pt-[20px] px-10 flex gap-x-7 items-center justify-between max-w-[1140px] mx-auto w-full">
            <X
                onClick={() => router.push("/learn")} // Simple exit for now
                className="text-slate-500 hover:opacity-75 transition cursor-pointer"
            />

            <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden">
                <div
                    className="bg-green-500 h-full transition-all duration-500 ease-in-out rounded-full"
                    style={{ width: `${percentage}%` }}
                />
            </div>

            <div className="flex items-center gap-x-4">
                <div className="text-sky-500 flex items-center font-bold">
                    <Gem className="mr-2 h-6 w-6" />
                    {points}
                </div>
                <div className="text-rose-500 flex items-center font-bold">
                    <Heart className="mr-2 fill-rose-500 w-6 h-6" />
                    {hasActiveSubscription ? <InfinityIcon className="h-6 w-6 stroke-[3]" /> : hearts}
                </div>
            </div>
        </header>
    );
};
