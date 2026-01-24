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
                    {/* BCA Section */}
                    <div className="bg-slate-100 p-4 rounded-xl border-2 border-slate-200">
                        <div className="flex items-center gap-2 mb-2">
                            <Image src="/bca.png" alt="BCA" width={40} height={15} className="object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                            {/* Fallback text if image missing */}
                            <span className="font-bold text-slate-700">Bank BCA</span>
                        </div>
                        <div className="flex justify-between items-center bg-white p-2 rounded-lg border border-slate-200">
                            <div className="flex flex-col">
                                <span className="font-mono font-bold text-lg text-slate-800">501 517 1330</span>
                                <span className="text-xs text-slate-500 uppercase">Muhamad Ikbal</span>
                            </div>
                            <Button size="icon" variant="ghost" onClick={() => copyToClipboard("5015171330")}>
                                <Copy className="h-4 w-4 text-slate-400" />
                            </Button>
                        </div>
                    </div>

                    {/* QRIS Section */}
                    <div className="text-center space-y-2">
                        <div className="text-sm font-bold text-slate-500 mb-1">ATAU SCAN QRIS (DANA/GOPAY)</div>
                        <div className="relative w-full aspect-square bg-slate-100 rounded-xl overflow-hidden border-2 border-slate-200 flex items-center justify-center">
                            {/* Using standard img tag for local file compatibility if Next Image fails with external paths sometimes */}
                            <img
                                src="/qris-manual.png"
                                alt="QRIS Code"
                                className="w-full h-full object-contain"
                            />
                        </div>
                    </div>

                    <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200 text-xs text-yellow-800 text-center">
                        ⚠️ <strong>PENTING:</strong> Setelah transfer, wajib klik tombol di bawah agar Admin bisa memverifikasi.
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
