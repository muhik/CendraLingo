"use client";

import { Button } from "@/components/ui/button";
import { Loader2, Zap, Gem, Heart, Trophy, X } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

interface ProModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

export const ProModal = ({ isOpen, onClose, onConfirm, isLoading = false }: ProModalProps) => {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in">
            <div className="w-full max-w-lg bg-[#141517] border-2 border-orange-500/30 rounded-3xl p-0 mx-4 shadow-2xl shadow-orange-900/40 relative overflow-hidden animate-in zoom-in-95">

                {/* Glow Effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/20 rounded-full blur-[100px] pointer-events-none -mt-20 -mr-20" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-amber-500/10 rounded-full blur-[100px] pointer-events-none -mb-20 -ml-20" />

                {/* Close Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 text-gray-400 hover:text-white"
                >
                    <X className="h-6 w-6" />
                </Button>

                {/* Header Section */}
                <div className="relative bg-gradient-to-b from-orange-500/10 to-transparent p-8 text-center pb-6">
                    <div className="bg-gradient-to-br from-amber-400 to-orange-600 p-4 rounded-full w-20 h-20 mx-auto shadow-lg shadow-orange-500/30 flex items-center justify-center mb-4 ring-4 ring-black/40">
                        <Trophy className="h-10 w-10 text-white fill-white" />
                    </div>
                    <h2 className="text-3xl font-black text-white uppercase tracking-wider mb-2 drop-shadow-sm">
                        Upgrade Jawara <span className="text-orange-400">PRO</span>
                    </h2>
                    <p className="text-orange-200/80 font-medium">Buka potensi penuh belajarmu!</p>
                </div>

                {/* Benefits List */}
                <div className="px-8 pb-8 space-y-4">
                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-4">
                        <div className="bg-sky-500/20 p-2 rounded-lg">
                            <Gem className="h-6 w-6 text-sky-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">+1000 Gems</h4>
                            <p className="text-gray-400 text-xs">Langsung dapat bonus besar</p>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-4">
                        <div className="bg-rose-500/20 p-2 rounded-lg">
                            <Heart className="h-6 w-6 text-rose-400 fill-rose-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">+100 Hearts / Bulan</h4>
                            <p className="text-gray-400 text-xs">Stok nyawa melimpah tiap bulan</p>
                        </div>
                    </div>

                    <div className="bg-white/5 rounded-xl p-4 border border-white/10 flex items-center gap-4">
                        <div className="bg-purple-500/20 p-2 rounded-lg">
                            <Zap className="h-6 w-6 text-purple-400 fill-purple-400" />
                        </div>
                        <div>
                            <h4 className="font-bold text-white text-lg">Tanpa Iklan</h4>
                            <p className="text-gray-400 text-xs">Fokus belajar tanpa gangguan</p>
                        </div>
                    </div>
                </div>

                {/* Footer / Action */}
                <div className="p-6 bg-black/20 border-t border-white/5 flex flex-col gap-3">
                    <Button
                        onClick={onConfirm}
                        disabled={isLoading}
                        className="w-full h-14 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-black text-xl tracking-wider rounded-xl shadow-lg shadow-orange-900/20 transition-all border-b-4 border-orange-700 active:border-b-0 active:translate-y-1"
                    >
                        {isLoading ? (
                            <Loader2 className="h-6 w-6 animate-spin" />
                        ) : (
                            "UPGRADE SEKARANG - Rp 49K"
                        )}
                    </Button>
                    <p className="text-center text-xs text-gray-500">
                        Pembayaran aman & terpercaya. Bisa cancel kapan saja.
                    </p>
                </div>
            </div>
        </div>
    );
};
