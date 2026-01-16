"use client";

import { useCallback } from "react";

export const useSpeech = () => {
    const speak = useCallback((text: string, lang: string = "en-US", rate: number = 0.9) => {
        if (typeof window === "undefined" || !window.speechSynthesis) return;

        // Cancel current speech to avoid queue buildup
        window.speechSynthesis.cancel();

        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = lang;
        utterance.rate = rate;
        utterance.pitch = 1;

        // Try to find a good voice (optional, browsers handle default well)
        const voices = window.speechSynthesis.getVoices();
        // Prefer "Google US English" or similar if available, else default
        const preferredVoice = voices.find(v => v.name.includes("Google") && v.lang.includes("en")) || null;
        if (preferredVoice) utterance.voice = preferredVoice;

        window.speechSynthesis.speak(utterance);
    }, []);

    return { speak };
};
