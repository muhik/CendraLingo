"use client";

import Link from "next/link";
import Image from "next/image"; // Or use Lucide icons
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Home, Store, Trophy, BookOpen, LogOut } from "lucide-react";
import { CourseSwitcher } from "./course-switcher";
import { useUserProgress } from "@/store/use-user-progress";

import { useState } from "react";
import { MessageSquare } from "lucide-react";
import { FeedbackModal } from "@/components/modals/feedback-modal";

export const Sidebar = ({ className }: { className?: string }) => {
    const pathname = usePathname();
    const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);

    const isMath = pathname.includes("/math");

    const items = [
        { label: "Learn", href: isMath ? "/math" : "/learn", icon: Home },
        { label: "Leaderboard", href: "/leaderboard", icon: Trophy },
        { label: "Quests", href: "/quests", icon: BookOpen },
        { label: "Shop", href: "/shop", icon: Store },
    ];

    return (
        <div className={cn(
            "flex h-full lg:w-[256px] lg:fixed left-0 top-0 px-4 border-r border-[#23482f] flex-col",
            "bg-background-dark shadow-xl z-50",
            className
        )}>
            <div className="pt-8 pl-2 pb-8">
                <CourseSwitcher />
            </div>

            <div className="flex flex-col gap-y-2 flex-1">
                {items.map((item) => {
                    const active = item.href === "/math" ? pathname.includes("/math") : pathname === item.href;
                    const Icon = item.icon;

                    return (
                        <Link key={item.href} href={item.href}>
                            <div
                                className={cn(
                                    "flex items-center gap-x-3 p-3 text-sm font-bold transition-all duration-200 rounded-xl cursor-pointer mb-1 mx-2",
                                    active
                                        ? "bg-card-dark text-primary border border-primary/30"
                                        : "text-gray-400 hover:text-white hover:bg-card-dark border border-transparent"
                                )}
                            >
                                <Icon className={cn("h-5 w-5 mr-1 transition-colors", active ? "text-primary" : "text-gray-400 group-hover:text-white")} />
                                <span>{item.label}</span>
                            </div>
                        </Link>
                    )
                })}

                {/* Feedback Button (Styled as Sidebar Item) */}
                <div
                    onClick={() => setIsFeedbackOpen(true)}
                    className={cn(
                        "flex items-center gap-x-3 p-3 text-sm font-bold transition-all duration-200 rounded-xl cursor-pointer mb-1 mx-2",
                        "text-gray-400 hover:text-white hover:bg-card-dark border border-transparent"
                    )}
                >
                    <MessageSquare className="h-5 w-5 mr-1 text-gray-400 group-hover:text-white" />
                    <span>Feedback</span>
                </div>

                {/* DEV: Reset Guest Button */}
                {/* DEV: Reset Guest Button - HIDDEN
                <Button
                    variant="ghost"
                    onClick={async (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        console.log("Resetting guest session...");
                        if (confirm("Reset Guest Session? This will clear your progress.")) {
                            try {
                                await fetch("/api/auth/reset");
                                window.location.assign("/");
                            } catch (err) {
                                alert("Failed to reset: " + err);
                            }
                        }
                    }}
                    className={cn(
                        "flex items-center gap-x-3 p-3 text-sm font-bold transition-all duration-200 rounded-xl cursor-pointer mb-1 mx-2 mt-auto w-auto justify-start h-auto",
                        "text-red-400 hover:text-red-300 hover:bg-red-500/10 border border-transparent bg-transparent"
                    )}
                >
                    <span className="w-5 text-center text-lg">⚠️</span>
                    <span>Reset Guest (Dev)</span>
                </Button>
                */}
                {/* Logout Button */}
                <div
                    onClick={() => {
                        if (confirm("Are you sure you want to Logout?")) {
                            useUserProgress.getState().logout();
                            window.location.href = "/"; // Force refresh to clear cache state
                        }
                    }}
                    className={cn(
                        "flex items-center gap-x-3 p-3 text-sm font-bold transition-all duration-200 rounded-xl cursor-pointer mb-1 mx-2 mt-auto",
                        "text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 border border-transparent"
                    )}
                >
                    <LogOut className="h-5 w-5 mr-1 text-rose-400" />
                    <span>Log Out</span>
                </div>
            </div>

            <div className="p-4 text-center">
                <div className="text-xs text-slate-400 font-medium">
                    © 2024 Cendra Lingo
                </div>
            </div>

            <FeedbackModal isOpen={isFeedbackOpen} onClose={() => setIsFeedbackOpen(false)} />
        </div>
    );
};
