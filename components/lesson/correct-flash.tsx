"use client";

import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

interface CorrectFlashProps {
    show: boolean;
    onComplete: () => void;
}

/**
 * A quick flash/glow animation that appears on the screen when the user answers correctly.
 * Similar to Duolingo's celebratory flash effect.
 */
export const CorrectFlashAnimation = ({ show, onComplete }: CorrectFlashProps) => {
    useEffect(() => {
        if (show) {
            const timer = setTimeout(() => {
                onComplete();
            }, 600); // Flash lasts 600ms
            return () => clearTimeout(timer);
        }
    }, [show, onComplete]);

    return (
        <AnimatePresence>
            {show && (
                <>
                    {/* Full Screen Flash Overlay */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        className="fixed inset-0 z-[90] pointer-events-none bg-gradient-to-b from-green-400/30 via-green-300/20 to-transparent"
                    />

                    {/* Radial Glow from Center */}
                    <motion.div
                        initial={{ scale: 0.5, opacity: 0 }}
                        animate={{ scale: 2.5, opacity: 0 }}
                        transition={{ duration: 0.6, ease: "easeOut" }}
                        className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-[89] pointer-events-none w-64 h-64 rounded-full bg-green-400/50 blur-3xl"
                    />

                    {/* Sparkle Particles */}
                    <motion.div
                        className="fixed inset-0 z-[91] pointer-events-none overflow-hidden"
                        initial={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                    >
                        {[...Array(12)].map((_, i) => (
                            <motion.div
                                key={i}
                                initial={{
                                    x: "50vw",
                                    y: "50vh",
                                    scale: 0,
                                    opacity: 1
                                }}
                                animate={{
                                    x: `${Math.random() * 100}vw`,
                                    y: `${Math.random() * 100}vh`,
                                    scale: [0, 1, 0],
                                    opacity: [1, 1, 0]
                                }}
                                transition={{
                                    duration: 0.5,
                                    delay: i * 0.03,
                                    ease: "easeOut"
                                }}
                                className="absolute w-3 h-3 bg-yellow-400 rounded-full shadow-lg shadow-yellow-400/50"
                                style={{
                                    boxShadow: "0 0 10px 3px rgba(250, 204, 21, 0.7)"
                                }}
                            />
                        ))}
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
};
