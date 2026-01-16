"use client";

import { useUserProgress } from "@/store/use-user-progress";
import Link from "next/link";
import { useEffect, useState, useRef } from "react";

export const SidebarAds = () => {
    const { hasActiveSubscription } = useUserProgress();
    const [ad, setAd] = useState<any>(null);
    const scriptContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch("/api/ads")
            .then(res => res.json())
            .then(data => setAd(data))
            .catch(err => console.error("Failed to load ads", err));
    }, []);

    // Effect to execute scripts when ad.script_code changes
    useEffect(() => {
        if (ad?.type === 'script' && ad?.script_code && scriptContainerRef.current) {
            const container = scriptContainerRef.current;
            container.innerHTML = ad.script_code;

            // Find and re-execute scripts
            const scripts = container.querySelectorAll("script");
            scripts.forEach((oldScript) => {
                const newScript = document.createElement("script");
                Array.from(oldScript.attributes).forEach((attr) => {
                    newScript.setAttribute(attr.name, attr.value);
                });
                newScript.appendChild(document.createTextNode(oldScript.innerHTML));
                if (oldScript.parentNode) {
                    oldScript.parentNode.replaceChild(newScript, oldScript);
                }
            });
        }
    }, [ad]);

    // 1. If user has active subscription (Super), do not show ads
    if (hasActiveSubscription) {
        return null;
    }

    // 2. If no active ad data, return null (hide section)
    if (!ad || !ad.is_active) {
        return null;
    }

    return (
        <div className="border border-slate-200 rounded-2xl p-4 bg-white flex flex-col items-center gap-4 relative overflow-hidden shadow-sm group mt-6">
            {/* Ad Label */}
            <div className="absolute top-2 right-2 bg-slate-100 text-[10px] text-slate-400 px-1.5 rounded font-bold uppercase tracking-widest border border-slate-200">
                Ad
            </div>

            {ad.type === 'script' ? (
                <div
                    className="w-full flex justify-center min-h-[250px] items-center bg-slate-50 rounded-xl overflow-hidden text-center"
                    ref={scriptContainerRef}
                >
                    {/* Scripts will be injected here by useEffect */}
                </div>
            ) : (
                <>
                    <div className="w-full relative aspect-square rounded-xl overflow-hidden bg-slate-50 flex items-center justify-center">
                        {ad.image_url ? (
                            <img
                                src={ad.image_url}
                                alt="Sponsor"
                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                        ) : (
                            <div className="text-center p-4">
                                <p className="text-slate-400 text-xs">No Image</p>
                            </div>
                        )}
                    </div>

                    {ad.target_url && (
                        <Link href={ad.target_url} target="_blank" className="w-full">
                            <button className="w-full py-2.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm uppercase tracking-wider shadow-md shadow-orange-100 transition-all">
                                Cek Promo
                            </button>
                        </Link>
                    )}
                </>
            )}
        </div>
    );
}
