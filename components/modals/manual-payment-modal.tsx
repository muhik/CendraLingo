"use client";

import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Check, Copy, Loader2, Timer } from "lucide-react";
import { toast } from "sonner";

interface ManualPaymentModalProps {
    isOpen: boolean;
    onClose: () => void;
    amount: number;
    onConfirm: () => void;
    isLoading: boolean;
}

export const ManualPaymentModal = ({
    isOpen,
    onClose,
    amount,
    onConfirm,
    isLoading
}: ManualPaymentModalProps) => {
    const [timeLeft, setTimeLeft] = useState(120); // 2 Minutes
    const [canConfirm, setCanConfirm] = useState(false);
    const [selectedMethod, setSelectedMethod] = useState<"BCA" | "DANA">("BCA");

    // Timer Logic
    useEffect(() => {
        if (!isOpen) {
            setTimeLeft(120);
            setCanConfirm(false);
            return;
        }

        const timer = setInterval(() => {
            setTimeLeft((prev) => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        // Enable confirm button after 5 seconds to prevent accidental clicks
        const enableTimer = setTimeout(() => {
            setCanConfirm(true);
        }, 5000);

        return () => {
            clearInterval(timer);
            clearTimeout(enableTimer);
        };
    }, [isOpen]);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
    };

    const copyToClipboard = (text: string) => {
        navigator.clipboard.writeText(text);
        toast.success("Nomor Rekening Disalin!");
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[400px]">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-xl font-bold">Transfer Manual</DialogTitle>
                        <div className="flex items-center gap-2 bg-rose-100 text-rose-700 px-3 py-1 rounded-full font-mono font-bold text-sm">
                            <Timer className="h-4 w-4" />
                            {formatTime(timeLeft)}
                        </div>
                    </div>
                    <DialogDescription>
                        Silakan transfer tepat <strong>Rp {amount.toLocaleString()}</strong> sebelum waktu habis.
                    </DialogDescription>
                </DialogHeader>

                <div className="space-y-6 py-2">
                    {/* Payment Method Tabs */}
                    <div className="grid grid-cols-2 gap-4">
                        {/* BCA Button - Blue Gradient */}
                        <button
                            onClick={() => setSelectedMethod("BCA")}
                            className={`relative overflow-hidden rounded-xl p-4 h-24 flex flex-col items-start justify-center transition-all duration-300 border-2 ${selectedMethod === "BCA" ? "border-cyan-400 ring-2 ring-cyan-200 scale-[1.02] shadow-cyan-200/50 shadow-lg" : "border-transparent opacity-80 hover:opacity-100 grayscale hover:grayscale-0"}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500 to-blue-600 z-0"></div>
                            <div className="relative z-10 flex flex-col items-start">
                                <h3 className="text-white font-black text-2xl italic tracking-tighter drop-shadow-md">BCA</h3>
                                <span className="text-cyan-100 text-[10px] font-bold tracking-widest uppercase mt-1">Transfer Bank</span>
                            </div>
                        </button>

                        {/* DANA Button - Purple Gradient */}
                        <button
                            onClick={() => setSelectedMethod("DANA")}
                            className={`relative overflow-hidden rounded-xl p-4 h-24 flex flex-col items-start justify-center transition-all duration-300 border-2 ${selectedMethod === "DANA" ? "border-purple-400 ring-2 ring-purple-200 scale-[1.02] shadow-purple-200/50 shadow-lg" : "border-transparent opacity-80 hover:opacity-100 grayscale hover:grayscale-0"}`}
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-purple-500 to-fuchsia-600 z-0"></div>
                            <div className="relative z-10 flex flex-col items-start">
                                <h3 className="text-white font-black text-2xl tracking-tighter drop-shadow-md">DANA</h3>
                                <span className="text-purple-100 text-[10px] font-bold tracking-widest uppercase mt-1">E-Wallet</span>
                            </div>
                        </button>
                    </div>

                    {/* Active Method Details */}
                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-inner">
                        <div className="text-center mb-4">
                            <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">
                                {selectedMethod === "BCA" ? "Silahkan Transfer Ke" : "Scan QRIS / Kirim Ke"}
                            </span>
                        </div>

                        {selectedMethod === "BCA" && (
                            <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                <div className="flex flex-col text-left">
                                    <span className="font-mono font-bold text-xl text-slate-800 tracking-tight">501 517 1330</span>
                                    <span className="text-xs text-slate-500 font-bold uppercase">Muhamad Ikbal (BCA)</span>
                                </div>
                                <Button size="icon" variant="ghost" onClick={() => copyToClipboard("5015171330")} className="hover:bg-cyan-50 text-cyan-600">
                                    <Copy className="h-5 w-5" />
                                </Button>
                            </div>
                        )}

                        {selectedMethod === "DANA" && (
                            <div className="flex flex-col gap-4">
                                {/* DANA Number */}
                                <div className="flex justify-between items-center bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                    <div className="flex flex-col text-left">
                                        <span className="font-mono font-bold text-xl text-slate-800 tracking-tight">0897 8646 573</span>
                                        <span className="text-xs text-slate-500 font-bold uppercase">Muhamad Ikbal (DANA)</span>
                                    </div>
                                    <Button size="icon" variant="ghost" onClick={() => copyToClipboard("08978646573")} className="hover:bg-purple-50 text-purple-600">
                                        <Copy className="h-5 w-5" />
                                    </Button>
                                </div>

                                {/* Divider */}
                                <div className="flex items-center gap-2">
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                    <span className="text-[10px] text-slate-400 font-bold">ATAU SCAN QRIS</span>
                                    <div className="h-px bg-slate-200 flex-1"></div>
                                </div>

                                {/* QRIS Image */}
                                <div className="relative w-full aspect-square max-w-[200px] mx-auto bg-white rounded-xl overflow-hidden border-2 border-slate-100 p-2 shadow-sm">
                                    <img
                                        src="/qris-manual.png"
                                        alt="QRIS Code"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="bg-amber-50 p-3 rounded-lg border border-amber-200 text-xs text-amber-800 text-center flex items-center justify-center gap-2">
                        <span>⚠️</span>
                        <span><strong>PENTING:</strong> Wajib klik tombol konfirmasi di bawah setelah transfer.</span>
                    </div>
                </div>

                <DialogFooter>
                    <Button
                        className="w-full"
                        size="lg"
                        variant={canConfirm ? "primary" : "ghost"}
                        disabled={!canConfirm || isLoading}
                        onClick={onConfirm}
                    >
                        {isLoading ? <Loader2 className="animate-spin mr-2 h-5 w-5" /> : <Check className="mr-2 h-5 w-5" />}
                        {isLoading ? "Memproses..." : !canConfirm ? "Mohon Tunggu..." : "SAYA SUDAH TRANSFER"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
