"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Search, GraduationCap, X } from "lucide-react"; // Using Lucide icons as placeholders
import { motion, AnimatePresence } from "framer-motion";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";

export default function OnboardingPage() {
    const router = useRouter();

    const handleStartLevel1 = () => {
        router.push("/learn");
    };

    const handlePlacementTest = () => {
        router.push("/learn"); // For now, just go to learn
        setTimeout(() => {
            toast.info("Placement Test Coming Soon!", {
                description: "We've placed you in Unit 1 for now."
            });
        }, 500);
    };

    return (
        <div className="min-h-screen bg-background-dark text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">

            {/* Background Glows */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-[128px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-emerald-900/10 rounded-full blur-[128px] translate-y-1/3 -translate-x-1/4 pointer-events-none" />


            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="max-w-4xl w-full z-10"
            >
                <div className="text-center mb-12 space-y-4">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight">How much English do you know?</h1>
                    <p className="text-gray-400 text-lg">Choose the path that best fits your current skill level.</p>
                </div>

                <div className="grid md:grid-cols-2 gap-8">
                    {/* Path 1: New User */}
                    <div className="bg-card-dark border border-[#23482f] rounded-3xl p-8 flex flex-col items-center text-center hover:border-primary/50 transition-all group shadow-lg">
                        <div className="mb-6 bg-[#23482f] p-6 rounded-full group-hover:scale-110 transition-transform duration-300">
                            {/* Simple Egg/Start Icon */}
                            <div className="h-12 w-12 rounded-xl bg-primary rotate-12" />
                        </div>

                        <h3 className="text-2xl font-bold mb-3">I'm new to this</h3>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Start fresh from the beginning. We'll cover the basics like "Hello" and "Goodbye".
                        </p>

                        <Button
                            onClick={handleStartLevel1}
                            className="w-full bg-transparent border-2 border-slate-600 text-white hover:bg-white/5 hover:border-white font-bold h-12 rounded-xl uppercase tracking-wider"
                        >
                            Start Level 1
                        </Button>
                    </div>

                    {/* Path 2: Existing User */}
                    <div className="bg-card-dark border border-[#23482f] rounded-3xl p-8 flex flex-col items-center text-center hover:border-primary/50 transition-all group shadow-lg">
                        <div className="mb-6 bg-[#23482f] p-6 rounded-full group-hover:scale-110 transition-transform duration-300">
                            <GraduationCap className="h-12 w-12 text-primary" />
                        </div>

                        <h3 className="text-2xl font-bold mb-3">I know some already</h3>
                        <p className="text-gray-400 mb-8 leading-relaxed">
                            Take a quick placement test to skip the basics and find your level.
                        </p>

                        <Button
                            onClick={handlePlacementTest}
                            className="w-full bg-transparent border-2 border-slate-600 text-white hover:bg-white/5 hover:border-white font-bold h-12 rounded-xl uppercase tracking-wider"
                        >
                            Take Placement Test
                        </Button>
                    </div>
                </div>

                <div className="mt-12 text-center">
                    <div className="inline-flex items-center gap-2 text-gray-500 text-sm font-medium bg-[#162f21] px-4 py-2 rounded-full border border-[#23482f]">
                        <span className="material-symbols-outlined text-base">timer</span>
                        <span>The placement test only takes about 5 minutes</span>
                    </div>
                </div>

            </motion.div>
        </div>
    );
}
