"use client";

import { StickyHeader } from "@/components/layout/sticky-header";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Shield, Zap, Crown, Gem, Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUserProgress } from "@/store/use-user-progress";
import Image from "next/image";
import { Sidebar } from "@/components/layout/sidebar";
import { AdSidebar } from "@/components/layout/ad-sidebar";

// Mock Data (Static Bots)
const botUsers = [
    { userId: 1, name: "Master Polyglot", xp: 1200, avatar: "/avatars/1.png" },
    { userId: 2, name: "Learning Machine", xp: 850, avatar: "/avatars/2.png" },
    { userId: 3, name: "Sarah Connor", xp: 600, avatar: "/avatars/3.png" },
    { userId: 5, name: "Guest User", xp: 300, avatar: "" },
    { userId: 6, name: "Another One", xp: 150, avatar: "" },
    { userId: 7, name: "Beginner", xp: 50, avatar: "" },
];

export default function LeaderboardPage() {
    const { points: userPoints } = useUserProgress();

    // Dynamic Leaderboard: Merge User + Bots & Sort
    const leaderboard = [
        ...botUsers,
        { userId: 999, name: "You (Cendra)", xp: userPoints, avatar: "/mascot_headset.png", isCurrentUser: true }
    ].sort((a, b) => b.xp - a.xp); // Sort Descending by XP/Gems

    return (
        <div className="flex min-h-screen bg-[#112217] text-white">

            <Sidebar className="hidden lg:flex" />

            {/* Main Wrapper pushing content right of Fixed Sidebar */}
            <div className="flex-1 lg:pl-[256px] flex flex-row-reverse">

                {/* RIGHT SIDEBAR: AD SPACE / PROMO */}
                <AdSidebar />

                {/* MAIN CONTENT */}
                <div className="flex-1 max-w-[900px] px-4 mx-auto pb-40">
                    <StickyHeader title="Leaderboard" />

                    <div className="flex flex-col items-center mt-10">
                        <div className="relative mb-14 group cursor-pointer">
                            <div className="absolute inset-0 bg-orange-500 blur-[60px] opacity-30 group-hover:opacity-50 transition-opacity duration-500" />
                            <Shield className="h-32 w-32 text-orange-500 fill-orange-500/20 drop-shadow-2xl relative z-10" />
                            <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-orange-600 to-orange-500 text-white text-xs font-black uppercase px-4 py-1.5 rounded-full border-4 border-[#112217] shadow-xl z-20 whitespace-nowrap flex items-center gap-1">
                                <Crown className="w-3 h-3 fill-white" />
                                Bronze League
                            </div>
                        </div>

                        <h1 className="text-3xl font-black text-white mb-2 tracking-wide">
                            Hall of Fame
                        </h1>
                        <p className="text-slate-400 text-center mb-10 max-w-md">
                            Bersaing dengan pelajar lain dan buktikan kemampuanmu!
                            Top 3 akan naik ke liga Silver minggu depan.
                        </p>

                        <div className="w-full max-w-2xl flex flex-col gap-3">
                            {leaderboard.map((user, index) => {
                                const isCurrentUser = 'isCurrentUser' in user ? user.isCurrentUser : false;
                                const isTop1 = index === 0;
                                const isTop2 = index === 1;
                                const isTop3 = index === 2;

                                return (
                                    <div
                                        key={user.userId}
                                        className={cn(
                                            "flex items-center w-full p-4 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden group hover:scale-[1.02]",
                                            isCurrentUser
                                                ? "bg-[#1B3B24] border-green-500 shadow-[0_0_20px_rgba(34,197,94,0.2)]"
                                                : "bg-[#1B3B24]/50 border-transparent hover:border-white/10 hover:bg-[#1B3B24]",
                                            isTop1 && "border-amber-400/50 bg-gradient-to-r from-amber-500/10 to-transparent",
                                            isTop2 && "border-slate-400/50",
                                            isTop3 && "border-orange-400/50"
                                        )}
                                    >
                                        {/* Rank Badge */}
                                        <div className="flex items-center justify-center w-10 mr-4">
                                            {isTop1 ? <Crown className="h-8 w-8 text-amber-400 fill-amber-400 animate-pulse" /> :
                                                isTop2 ? <div className="text-2xl font-black text-slate-300">#2</div> :
                                                    isTop3 ? <div className="text-2xl font-black text-orange-400">#3</div> :
                                                        <div className="text-lg font-bold text-slate-500">#{index + 1}</div>
                                            }
                                        </div>

                                        <UserAvatar
                                            src={user.avatar || "/mascot.svg"}
                                            className={cn("mr-4 h-12 w-12 border-2",
                                                isTop1 ? "border-amber-400" :
                                                    isCurrentUser ? "border-green-500" : "border-transparent"
                                            )}
                                        />

                                        <div className="flex-1">
                                            <div className={cn("font-bold text-lg", isCurrentUser ? "text-green-400" : "text-white")}>
                                                {user.name}
                                                {isCurrentUser && " (You)"}
                                            </div>
                                            {isCurrentUser && <div className="text-[10px] text-green-500/70 font-semibold uppercase tracking-wider">Sedang Aktif</div>}
                                        </div>

                                        <div className="flex items-center gap-2 bg-black/20 px-3 py-1.5 rounded-lg border border-white/5">
                                            <Zap className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                                            <span className="font-mono font-bold text-yellow-100">
                                                {user.xp} XP
                                            </span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
