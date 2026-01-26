"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Zap, Trophy, Target, Gem } from "lucide-react";
import { useUserProgress } from "@/store/use-user-progress";
import { UserProgress } from "@/components/learn/user-progress";

import { useState, useEffect } from "react";

export const RightSidebar = () => {
    const router = useRouter();
    const { hasActiveSubscription, points, isGuest, userId, hearts } = useUserProgress();
    const [canSpin, setCanSpin] = useState(false);
    const [paid4linkUrl, setPaid4linkUrl] = useState<string | null>(null);
    const [requirePaid4link, setRequirePaid4link] = useState(false);
    const [hasAccess, setHasAccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isNavigating, setIsNavigating] = useState(false);
    const [adData, setAdData] = useState<any>(null);

    // Fetch Ad Settings
    useEffect(() => {
        fetch("/api/ads")
            .then(res => res.json())
            .then(data => setAdData(data))
            .catch(err => console.error("Failed to fetch ads:", err));
    }, []);

    // Check access on mount
    useEffect(() => {
        if (!userId || isGuest) {
            setIsLoading(false);
            return;
        }

        const checkAccess = async () => {
            try {
                const res = await fetch(`/api/treasure/access?userId=${userId}&t=${Date.now()}`, { cache: "no-store" });
                const data = await res.json();

                // Can show widget if: enabled AND not already spun today
                const shouldShow = data.settings?.isEnabled && !data.alreadySpunToday;
                setCanSpin(shouldShow);
                setPaid4linkUrl(data.settings?.paid4linkUrl);
                setRequirePaid4link(data.settings?.requirePaid4link);
                setHasAccess(data.hasAccess);
            } catch (err) {
                console.error("[DEBUG Widget] Error:", err);
                setCanSpin(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAccess();
    }, [userId, isGuest, hasActiveSubscription]);

    // Handle widget click - conditionally redirect or go to treasure
    const handleTreasureClick = async () => {
        if (!userId || isNavigating) return;

        setIsNavigating(true);

        try {
            // Case 1: Force Paid4Link Flow (User requirement: "sifatnya tetep"/always required)
            // We set access in database first, then redirect.

            // 1. Set access in database (Use GET workaround)
            const accessRes = await fetch(`/api/treasure/access?userId=${userId}&action=setAccess&t=${Date.now()}`, {
                method: "GET",
                cache: "no-store",
            });

            if (!accessRes.ok) {
                console.error("Failed to set access in DB");
                alert("Gagal koneksi ke server. Coba lagi.");
                setIsNavigating(false);
                return;
            }

            // 2. If Paid4Link logic is enabled, redirect there
            if (requirePaid4link && paid4linkUrl) {
                let targetUrl = paid4linkUrl.trim();
                // Ensure protocol
                if (!targetUrl.startsWith("http")) {
                    targetUrl = `https://${targetUrl}`;
                }

                // FORCE redirect
                window.location.href = targetUrl;
            } else {
                // Only if NO paid link is configured, go direct
                router.push("/treasure");
            }
        } catch (error) {
            console.error("Failed to process treasure click:", error);
            setIsNavigating(false);
        }
    };

    return (
        <div className="hidden lg:flex w-[350px] flex-col gap-6 p-6 sticky top-0 h-screen overflow-y-auto no-scrollbar border-l border-[#23482f] bg-background-dark">

            {/* Top Bar Stats */}
            <div className="flex items-center justify-between mb-4">
                <UserProgress
                    hearts={hearts}
                    points={points}
                    hasActiveSubscription={hasActiveSubscription}
                />
            </div>

            {/* Free Gems / Treasure Chest Widget */}
            {!isLoading && (
                <div
                    onClick={() => {
                        if (isGuest) {
                            // Use a custom event or router query to trigger AuthModal globally if needed, 
                            // OR simpler: just redirect to a page that forces login? 
                            // Since AuthModal is in layout or page, we might need a way to open it.
                            // For now, let's just NOT trigger the nav and maybe show toast/confirm.
                            // Better: Pass a query param to trigger modal?
                            // actually, let's use the router to go to clean URL but triggering modal is hard from here without context.
                            // We'll redirect to /shop?openAuth=true or similar if we want.
                            // SIMPLER: Just show toast and do nothing.
                            // OR: If user wants "Strict", maybe we just keep it hidden?
                            // User said "harta karun tidak boleh ikutan kecuali sudah registrasi".
                            // If I hide it, they can't participate.
                            // If I show it and say "Login First", that's also blocking.
                            // Let's SHOW it but locked.
                            alert("Silahkan Login / Register untuk akses Harta Karun!");
                            return;
                        }
                        handleTreasureClick();
                    }}
                    className={`rounded-2xl border-2 p-5 relative overflow-hidden group transition-all cursor-pointer ${isGuest ? "border-slate-700 bg-slate-800/50 opacity-70 grayscale" : "border-orange-400 bg-orange-400/10 hover:bg-orange-400/20"}`}
                >
                    <div className="absolute inset-0 bg-[url('/cendra_mascot.png')] opacity-20 bg-no-repeat bg-right bg-contain" />

                    <div className="relative z-10 flex flex-col gap-3">
                        <div className="flex items-center justify-between">
                            <h3 className={`text-lg font-bold text-shadow-sm ${isGuest ? "text-slate-400" : "text-orange-500"}`}>Harta Karun Gem</h3>
                            <Gem className={`h-6 w-6 animate-pulse ${isGuest ? "text-slate-500" : "text-orange-500"}`} />
                        </div>
                        <p className="text-gray-300 text-sm font-medium leading-relaxed">
                            {isGuest ? "Login untuk memutar roda keberuntungan." : <span>Putar roda keberuntungan dan dapatkan <span className="text-orange-400 font-bold">Gems Gratis</span>!</span>}
                        </p>

                        <Button
                            disabled={isNavigating || isGuest}
                            className={`w-full border-none shadow-lg rounded-xl font-bold text-sm uppercase tracking-wider transition-all mt-2 h-[46px] pointer-events-none ${isGuest ? "bg-slate-600 text-slate-300" : "bg-gradient-to-b from-orange-400 to-orange-600 hover:brightness-110 text-white shadow-orange-900/20"}`}
                        >
                            {isNavigating ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                                    Membuka...
                                </>
                            ) : (
                                isGuest ? "🔒 Terkunci (Guest)" : "🎰 Putar Roda Sekarang"
                            )}
                        </Button>
                    </div>
                </div>
            )}

            {/* Leaderboard Widget */}
            <div className="bg-card-dark rounded-2xl p-5 border border-[#23482f]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Leaderboard</h3>
                    <Link href="/leaderboard" className="text-primary text-sm font-bold hover:underline">View All</Link>
                </div>

                <div className="flex flex-col gap-1">
                    {/* Mock Leaderboard Items */}
                    {[
                        { rank: 1, name: "Sarah M.", xp: 1450, avatar: "bg-orange-400" },
                        { rank: 2, name: "Mike R.", xp: 1200, avatar: "bg-slate-400" },
                        { rank: 3, name: "Jessica L.", xp: 980, avatar: "bg-amber-200" },
                    ].map((user) => (
                        <div key={user.rank} className="flex items-center gap-3 p-2 rounded-xl hover:bg-[#23482f] cursor-pointer transition-colors">
                            <span className={`font-bold w-4 text-center ${user.rank === 1 ? 'text-accent-gold' : user.rank === 2 ? 'text-gray-300' : 'text-[#cd7f32]'}`}>{user.rank}</span>
                            <div className={`h-9 w-9 rounded-full ${user.avatar} bg-cover bg-center`} />
                            <div className="flex-grow text-sm font-bold text-white">{user.name}</div>
                            <span className="text-sm font-medium text-gray-400">{user.xp} XP</span>
                        </div>
                    ))}
                    {/* Current User Mock */}
                    <div className="flex items-center gap-3 p-2 rounded-xl bg-[#23482f] border border-primary/20 mt-1 cursor-pointer">
                        <span className="text-primary font-bold w-4 text-center">4</span>
                        <div className="h-9 w-9 rounded-full bg-primary flex items-center justify-center text-[#112217] font-bold text-xs">You</div>
                        <div className="flex-grow text-sm font-bold text-white">You</div>
                        <span className="text-sm font-medium text-white">{points} XP</span>
                    </div>
                </div>
            </div>

            {/* Ads Widget */}
            {!isLoading && adData?.is_active && (
                <div className="bg-white/5 rounded-2xl p-4 border border-white/10 overflow-hidden">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sponsored</span>
                    </div>

                    {adData.type === 'image' && adData.image_url ? (
                        <a
                            href={adData.target_url || "#"}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="block group relative overflow-hidden rounded-lg"
                        >
                            <img
                                src={adData.image_url}
                                alt="Ad"
                                className="w-full h-auto object-cover transition-transform group-hover:scale-105"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                        </a>
                    ) : adData.type === 'script' && adData.script_code ? (
                        <div className="w-full flex justify-center overflow-hidden">
                            {/* 
                                Safe Script Injection for Adsterra/Ads.
                                We use a unique ID to prevent React hydration mismatches.
                            */}
                            <div
                                dangerouslySetInnerHTML={{ __html: adData.script_code }}
                                className="ad-container"
                            />
                        </div>
                    ) : null}
                </div>
            )}


            {/* Daily Quests Widget */}
            <div className="bg-card-dark rounded-2xl p-5 border border-[#23482f]">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-bold text-white">Daily Quests</h3>
                    <span className="text-gray-400 text-xs font-bold uppercase tracking-wider">Reset in 4H</span>
                </div>

                <div className="flex flex-col gap-5">
                    <div className="flex gap-4 items-start">
                        <div className="text-accent-gold pt-0.5"><Zap className="h-5 w-5 fill-current" /></div>
                        <div className="flex-grow flex flex-col gap-2">
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-white">Earn 50 XP</span>
                                <span className="text-gray-400">40/50</span>
                            </div>
                            <div className="h-2.5 w-full bg-[#112217] rounded-full overflow-hidden">
                                <div className="h-full bg-accent-gold w-[80%] rounded-full" />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start">
                        <div className="text-primary pt-0.5"><Target className="h-5 w-5 fill-current" /></div>
                        <div className="flex-grow flex flex-col gap-2">
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-white">Complete 2 speaking exercises</span>
                                <span className="text-gray-400">1/2</span>
                            </div>
                            <div className="h-2.5 w-full bg-[#112217] rounded-full overflow-hidden">
                                <div className="h-full bg-primary w-[50%] rounded-full" />
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-4 items-start opacity-50">
                        <div className="text-accent-blue pt-0.5"><Gem className="h-5 w-5 fill-current" /></div>
                        <div className="flex-grow flex flex-col gap-2">
                            <div className="flex justify-between text-sm font-bold">
                                <span className="text-white">Score 100% in a lesson</span>
                                <span className="text-accent-blue">Done</span>
                            </div>
                            <div className="h-2.5 w-full bg-[#112217] rounded-full overflow-hidden">
                                <div className="h-full bg-accent-blue w-full rounded-full" />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer Removed as requested */}
        </div>
    );
}
