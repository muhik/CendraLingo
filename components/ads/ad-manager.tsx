"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { InterstitialAd } from "./interstitial-ad";
import { BannerAd } from "./banner-ad";
import { useUserProgress } from "@/store/use-user-progress";

export const AdManager = () => {
    const pathname = usePathname();
    const { hasActiveSubscription } = useUserProgress();
    const [ads, setAds] = useState<any[]>([]);
    const [currentInterstitial, setCurrentInterstitial] = useState<any>(null);
    const [currentBanner, setCurrentBanner] = useState<any>(null);
    const [lastAdTime, setLastAdTime] = useState(0);

    // Fetch ads on mount
    useEffect(() => {
        fetch("/api/ads")
            .then(res => res.json())
            .then(data => {
                if (Array.isArray(data)) {
                    setAds(data.filter(a => a.is_active));
                }
            })
            .catch(err => console.error("Failed to fetch ads", err));
    }, []);

    // Helper: Select random ad based on weight
    const selectRandomAd = (placement: string) => {
        const candidates = ads.filter(a => a.placement === placement);
        if (candidates.length === 0) return null;

        const totalWeight = candidates.reduce((sum, a) => sum + (a.weight || 0), 0);
        let random = Math.random() * totalWeight;

        for (const ad of candidates) {
            random -= (ad.weight || 0);
            if (random <= 0) return ad;
        }
        return candidates[0];
    };

    // Helper: Trigger Ad Logic
    const tryTriggerAd = (chance: number) => {
        if (hasActiveSubscription) return; // No ads for PRO
        if (Date.now() - lastAdTime < 10000) return; // Aggressive Cooldown: 10 seconds
        if (Math.random() > chance) return; // Failed dice roll

        const ad = selectRandomAd('interstitial');
        if (ad) {
            setCurrentInterstitial(ad);
            setLastAdTime(Date.now());
        }
    };

    // Trigger on Route Change (70% chance - VERY ANNOYING)
    useEffect(() => {
        // Exclude Landing Page, Admin Dashboard, and Manager Dashboard
        if (pathname === '/' || pathname.includes('/admin') || pathname.includes('/manager')) {
            setCurrentBanner(null);
            return;
        }

        tryTriggerAd(0.7); // 70% chance on every page load/navigation

        // Banner Logic: Always try to show a banner if not PRO
        if (!hasActiveSubscription) {
            const banner = selectRandomAd('banner');
            setCurrentBanner(banner);
        } else {
            setCurrentBanner(null);
        }
    }, [pathname, ads, hasActiveSubscription]);

    // Trigger on Custom Events
    useEffect(() => {
        // 100% chance after lesson (Reward/Punishment for finishing)
        const handleLessonComplete = () => tryTriggerAd(1.0);

        // 80% chance BEFORE lesson (Annoying start)
        const handleLessonStart = () => tryTriggerAd(0.8);

        window.addEventListener('lesson_complete', handleLessonComplete);
        window.addEventListener('lesson_start', handleLessonStart);

        return () => {
            window.removeEventListener('lesson_complete', handleLessonComplete);
            window.removeEventListener('lesson_start', handleLessonStart);
        };
    }, [ads, hasActiveSubscription]); // Dep on ads to ensure we have them

    return (
        <>
            {currentInterstitial && <InterstitialAd ad={currentInterstitial} onClose={() => setCurrentInterstitial(null)} />}
            {currentBanner && <BannerAd ad={currentBanner} onClose={() => setCurrentBanner(null)} />}
        </>
    );
};
