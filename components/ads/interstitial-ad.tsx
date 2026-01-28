"use client";

import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InterstitialAdProps {
    ad: any;
    onClose: () => void;
}

export const InterstitialAd = ({ ad, onClose }: InterstitialAdProps) => {
    const [timeLeft, setTimeLeft] = useState(5);

    useEffect(() => {
        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    if (!ad) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white dark:bg-slate-900 rounded-xl overflow-hidden max-w-lg w-full shadow-2xl relative animate-in zoom-in-50 duration-300">
                {/* Header */}
                <div className="bg-purple-600 text-white p-3 flex justify-between items-center">
                    <span className="font-bold text-sm uppercase tracking-wider">Sponsored</span>
                    {timeLeft > 0 ? (
                        <span className="text-xs font-mono bg-black/20 px-2 py-1 rounded">Wait {timeLeft}s</span>
                    ) : (
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={onClose}
                            className="bg-white/20 hover:bg-white/40 text-white h-7 w-7 p-0 rounded-full"
                        >
                            <X className="w-4 h-4" />
                        </Button>
                    )}
                </div>

                {/* Content */}
                <div className="p-0">
                    {ad.type === 'script' ? (
                        <div
                            className="flex justify-center items-center min-h-[300px] bg-gray-100"
                            dangerouslySetInnerHTML={{ __html: ad.script_code }}
                        />
                    ) : (
                        <a href={ad.target_url || "#"} target="_blank" rel="noopener noreferrer" className="block relative group">
                            {/* Native Image */}
                            <img
                                src={ad.image_url}
                                alt={ad.title}
                                className="w-full h-auto object-cover max-h-[400px]"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <span className="bg-white text-black px-4 py-2 rounded-full font-bold shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">
                                    Visit Site
                                </span>
                            </div>
                        </a>
                    )}
                </div>

                {/* Footer */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800 text-center">
                    <p className="text-sm text-muted-foreground mb-3">{ad.title}</p>
                    {timeLeft === 0 && (
                        <Button onClick={onClose} variant="outline" className="w-full border-purple-200 hover:bg-purple-50 hover:text-purple-700">
                            Dismiss Ad
                        </Button>
                    )}
                </div>
            </div>
        </div>
    );
};
