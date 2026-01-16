"use client";

import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { useEffect, useState } from "react";
import { useSounds } from "@/hooks/use-sounds";

interface StreakAnimationProps {
    open: boolean;
    onClose: () => void;
}

export const StreakAnimation = ({ open, onClose }: StreakAnimationProps) => {
    const { playCorrectSound } = useSounds();

    useEffect(() => {
        if (open) {
            playCorrectSound(); // Or a special streak sound if we had one
            const timer = setTimeout(() => {
                onClose();
            }, 3000); // Show for 3 seconds
            return () => clearTimeout(timer);
        }
    }, [open, onClose, playCorrectSound]);

    return (
        <AnimatePresence>
            {open && (
                <motion.div
                    initial={{ opacity: 0, scale: 0.5, y: -50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.8, y: -50 }}
                    className="fixed top-[15%] left-1/2 -translate-x-1/2 z-[100] flex flex-col items-center justify-center pointer-events-none"
                >
                    <div className="relative w-48 h-48 md:w-64 md:h-64">
                        {/* Glowing Background */}
                        <div className="absolute inset-0 bg-yellow-400/30 blur-3xl rounded-full scale-110 animate-pulse" />

                        {/* Mascot GIF */}
                        <Image
                            src="/cendralingo.gif"
                            alt="Streak Cendra GIF"
                            fill
                            unoptimized // Important for GIFs in Next.js
                            className="object-contain drop-shadow-2xl"
                        />

                        {/* Text Badge */}
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-orange-500 text-white font-black text-2xl px-6 py-2 rounded-xl border-b-4 border-orange-700 shadow-xl whitespace-nowrap rotate-[-5deg]">
                            5x STREAK! 🔥
                        </div>
                    </div>

                    {/* Confetti / Particles? (Simplified CSS) */}
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full overflow-hidden pointer-events-none">
                        {/* We can add canvas confetti here later if needed */}
                    </div>

                </motion.div>
            )}
        </AnimatePresence>
    );
};
