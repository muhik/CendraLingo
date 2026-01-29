"use client";

import { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ScriptRenderer } from "./script-renderer";

interface BannerAdProps {
    ad: any;
    onClose: () => void;
}

export const BannerAd = ({ ad, onClose }: BannerAdProps) => {
    const [isVisible, setIsVisible] = useState(true);

    if (!isVisible || !ad) return null;

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg p-2 animate-in slide-in-from-bottom duration-500">
            <div className="max-w-screen-xl mx-auto relative flex items-center justify-between sm:justify-center gap-4">

                {/* Close Button Mobile */}
                <button
                    onClick={() => { setIsVisible(false); onClose(); }}
                    className="absolute -top-3 right-2 bg-slate-900 text-white rounded-full p-1 shadow-md hover:bg-slate-700 sm:hidden"
                >
                    <X className="h-4 w-4" />
                </button>

                {/* Content */}
                <div className="flex-1 flex justify-center">
                    {ad.type === 'script' ? (
                        <div className="h-[60px] w-full flex justify-center overflow-hidden">
                            <ScriptRenderer html={ad.script_code} />
                        </div>
                    ) : (
                        <a href={ad.target_url} target="_blank" rel="noopener noreferrer" className="block max-w-full">
                            <img
                                src={ad.image_url}
                                alt={ad.title}
                                className="h-16 md:h-20 object-contain rounded-md"
                            />
                        </a>
                    )}
                </div>

                {/* Close Button Desktop */}
                <button
                    onClick={() => { setIsVisible(false); onClose(); }}
                    className="hidden sm:block absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700"
                >
                    <X className="h-5 w-5" />
                </button>
            </div>
            <div className="text-[10px] text-slate-400 text-center mt-1">
                Sponsored • <span className="underline cursor-pointer">Remove Ads</span>
            </div>
        </div>
    );
};
