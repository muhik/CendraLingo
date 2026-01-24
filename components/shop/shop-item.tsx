"use client";

import { Button } from "@/components/ui/button";
import { Zap, LucideIcon, Gem } from "lucide-react";
import Image from "next/image";

interface ShopItemProps {
    name: string;
    Icon: LucideIcon;
    iconColor?: string;
    description: string;
    price: number;
    priceText?: string; // Optional: "Rp 10.000" etc.
    points: number;
    hasActive: boolean; // e.g. if already full hearts
    onBuy: () => void;
    isPopular?: boolean; // NEW
    activeTitle?: string; // Custom text when disabled/active
}

export const ShopItem = ({
    name,
    Icon,
    iconColor,
    description,
    price,
    priceText,
    points,
    hasActive,
    onBuy,
    isPopular,
    activeTitle,
}: ShopItemProps) => {

    const canBuy = priceText ? true : points >= price;

    return (
        <div className={`relative flex flex-col items-center p-6 border-2 rounded-2xl bg-[#0f3a2f]/80 backdrop-blur-sm transition-all hover:scale-[1.02] hover:shadow-lg ${isPopular ? "border-sky-400 shadow-sky-500/20" : "border-white/10 hover:border-white/20"}`}>
            {isPopular && (
                <div className="absolute -top-3 bg-sky-500 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
                    Popular
                </div>
            )}

            <div className="mb-4 bg-black/20 p-4 rounded-full border border-white/5">
                <Icon className={`h-10 w-10 ${iconColor || "text-slate-400"}`} />
            </div>

            <div className="text-center flex-1 mb-6">
                <p className="text-white text-lg font-bold mb-1">
                    {name}
                </p>
                <p className="text-slate-300 text-sm leading-relaxed">
                    {description}
                </p>
            </div>

            <Button
                disabled={!canBuy || hasActive}
                onClick={() => {
                    console.log("🖱️ [DEBUG] ShopItem Button Clicked!");
                    onBuy();
                }}
                className="w-full rounded-xl border-b-4 h-[45px] active:border-b-0 font-bold"
                variant={priceText ? "primary" : "default"}
            >
                {hasActive ? (activeTitle || "SUDAH PUNYA") : (
                    <div className="flex items-center">
                        {priceText ? (
                            <span>{priceText}</span>
                        ) : (
                            <>
                                <Gem className="mr-2 h-5 w-5 text-sky-500" />
                                {price}
                            </>
                        )}
                    </div>
                )}
            </Button>
        </div>
    );
};
