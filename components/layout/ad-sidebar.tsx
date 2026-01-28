"use client";

import { useUserProgress } from "@/store/use-user-progress";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";
import { ScriptRenderer } from "@/components/ads/script-renderer";

export const AdSidebar = () => {
    const { hasActiveSubscription } = useUserProgress();
    const [ad, setAd] = useState<any>(null);
    const scriptContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`/api/ads?t=${Date.now()}`)
            .then(res => res.json())
            .then(data => {
                console.log("[AdSidebar] Fetched data:", data);
                if (Array.isArray(data) && data.length > 0) {
                    setAd(data[0]); // Pick first active ad for now
                } else {
                    console.log("[AdSidebar] No active ads found or invalid format");
                }
            })
            .catch(err => console.error("Failed to load ads", err));
    }, []);



    // Hide if Super user
    if (hasActiveSubscription) {
        return null;
    }

    // Default Placeholder (Upgrade to Super) if NO AD is active
    if (!ad || !ad.is_active) {
        return (
            <div className="hidden lg:flex w-[300px] flex-col gap-4 p-4 sticky top-6 h-fit border-l border-white/5">
                <div className="text-gray-500 text-xs font-bold uppercase tracking-widest text-center mb-2">Advertisement</div>
                <div className="w-full h-[400px] bg-white/5 rounded-xl border border-white/10 flex flex-col items-center justify-center p-6 text-center group hover:bg-white/10 transition-colors cursor-pointer relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
                    <div className="absolute inset-0 bg-[url('/cendra_mascot.png')] bg-cover opacity-20 bg-center" />
                    <div className="relative z-20 flex flex-col items-center gap-4">
                        <h3 className="text-xl font-bold text-white text-shadow">Upgrade to PRO (Debug)</h3>
                        <p className="text-gray-300 text-sm">Remove ads & support us!</p>
                        <Link href="/shop" className="w-full">
                            <button className="w-full py-3 rounded-xl bg-primary text-[#112217] font-bold shadow-lg hover:scale-105 transition-transform">
                                Remove Ads
                            </button>
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    // Render Active Ad
    return (
        <div className="hidden lg:flex w-[300px] flex-col gap-4 p-4 sticky top-6 h-fit border-l border-white/5">
            <div className="text-gray-500 text-xs font-bold uppercase tracking-widest text-center mb-2">Partner Info</div>

            {ad.type === 'script' ? (
                <div className="w-full min-h-[600px] bg-white/5 rounded-xl flex items-center justify-center border border-white/10">
                    <ScriptRenderer html={ad.script_code} />
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    <div className="w-full relative rounded-xl overflow-hidden bg-white/5 border border-white/10">
                        {ad.image_url ? (
                            <img src={ad.image_url} alt="Ad" className="w-full h-auto object-cover" />
                        ) : (
                            <div className="p-10 text-center text-gray-500">No Image</div>
                        )}
                    </div>
                    {ad.target_url && (
                        <Link href={ad.target_url} target="_blank" className="w-full">
                            <button className="w-full py-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold transition-all shadow-lg">
                                Buka Link
                            </button>
                        </Link>
                    )}
                </div>
            )}
        </div>
    );
}
