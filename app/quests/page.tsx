"use client";

import { StickyHeader } from "@/components/layout/sticky-header";
import { Sidebar } from "@/components/layout/sidebar";
import { AdSidebar } from "@/components/layout/ad-sidebar";
import { Progress } from "@/components/ui/progress";
import { Zap, Target, Star, Gem, CheckCircle, Lock } from "lucide-react";
import Image from "next/image";
import { useUserProgress } from "@/store/use-user-progress";

const quests = [
    { title: "Hasilkan 20 XP", value: 20, type: "xp" },
    { title: "Selesaikan 1 Unit", value: 1, type: "unit" },
    { title: "Benar 5x Berturut-turut", value: 5, type: "streak" },
    { title: "Habiskan 15 Menit Belajar", value: 15, type: "time" },
];

export default function QuestsPage() {
    const { points } = useUserProgress();

    // Mock progress for now - in real app this would come from store/db
    const getProgress = (quest: any) => {
        if (quest.type === "xp") return Math.min(points, quest.value);
        if (quest.type === "streak") return 2; // Mock
        return 0;
    }

    return (
        <div className="flex min-h-screen bg-[#112217] text-white">
            <Sidebar className="hidden lg:flex" />

            {/* Main Wrapper pushing content right of Fixed Sidebar */}
            <div className="flex-1 lg:pl-[256px] flex flex-row-reverse">

                {/* RIGHT SIDEBAR: AD SPACE / PROMO */}
                <AdSidebar />

                {/* MAIN CONTENT */}
                <div className="flex-1 max-w-[900px] px-4 mx-auto pb-40">
                    <StickyHeader title="Quests" />

                    <div className="flex flex-col items-center mt-10">
                        <div className="relative mb-10 group cursor-pointer">
                            <div className="absolute inset-0 bg-fuchsia-500 blur-[60px] opacity-20 group-hover:opacity-40 transition-opacity duration-500" />
                            <Target className="h-24 w-24 text-fuchsia-500 drop-shadow-2xl relative z-10" />
                            <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-gradient-to-r from-fuchsia-600 to-fuchsia-500 text-white text-xs font-black uppercase px-4 py-1.5 rounded-full border-4 border-[#112217] shadow-xl z-20 whitespace-nowrap flex items-center gap-1">
                                <Zap className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                                Daily Quests
                            </div>
                        </div>

                        <h1 className="text-3xl font-black text-white mb-2 tracking-wide text-center">
                            Misi Harian
                        </h1>
                        <p className="text-slate-400 text-center mb-10 max-w-md">
                            Selesaikan misi harianmu untuk mendapatkan lebih banyak hadiah dan XP!
                        </p>

                        <div className="w-full max-w-2xl px-4 flex flex-col gap-4">
                            {quests.map((quest, index) => {
                                const progress = getProgress(quest);
                                const percentage = (progress / quest.value) * 100;
                                const isCompleted = percentage >= 100;

                                return (
                                    <div key={index} className="bg-[#1B3B24] border-2 border-[#23482f] p-5 rounded-xl hover:border-white/10 transition-colors group relative overflow-hidden">
                                        {isCompleted && (
                                            <div className="absolute top-0 right-0 p-2">
                                                <CheckCircle className="h-6 w-6 text-green-500 fill-green-500/20" />
                                            </div>
                                        )}

                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="bg-[#112217] p-3 rounded-lg border border-[#23482f]">
                                                {quest.type === 'xp' ? <Zap className="h-6 w-6 text-yellow-400 fill-yellow-400" /> :
                                                    quest.type === 'streak' ? <Target className="h-6 w-6 text-red-400" /> :
                                                        <Star className="h-6 w-6 text-blue-400" />
                                                }
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-bold text-lg text-white">{quest.title}</h3>
                                                <p className="text-slate-400 text-sm font-medium">
                                                    +{quest.value * 2} Gems Reward
                                                </p>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3">
                                            <Progress value={percentage} className="h-3 bg-[#112217]" indicatorClassName={isCompleted ? "bg-green-500" : "bg-fuchsia-500"} />
                                            <span className="font-mono font-bold text-sm text-white w-12 text-right">
                                                {progress}/{quest.value}
                                            </span>
                                        </div>
                                    </div>
                                )
                            })}

                            <div className="bg-[#1B3B24]/50 border-2 border-[#23482f] border-dashed p-6 rounded-xl flex items-center justify-center gap-3 opacity-70 mt-4">
                                <Lock className="h-5 w-5 text-slate-500" />
                                <span className="text-slate-400 font-bold">More quests unlocking at Level 5</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
