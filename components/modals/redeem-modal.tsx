"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Wallet, X, Loader2, CheckCircle } from "lucide-react";
import { toast } from "sonner";
import { useUserProgress } from "@/store/use-user-progress";
import { cn } from "@/lib/utils";

const MIN_REDEEM_RUPIAH = 1; // No minimum limit - even Rp 1 is allowed

interface RedeemModalProps {
    isOpen: boolean;
    onClose: () => void;
}

export const RedeemModal = ({ isOpen, onClose }: RedeemModalProps) => {
    const { cashbackBalance, userId, userName, spendCashback } = useUserProgress();
    const [step, setStep] = useState<"form" | "confirm" | "success">("form");
    const [amountToRedeem, setAmountToRedeem] = useState<number>(cashbackBalance || 0);
    const [accountNumber, setAccountNumber] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    if (!isOpen) return null;

    const canRedeem = (cashbackBalance || 0) >= MIN_REDEEM_RUPIAH;

    const handleSubmit = () => {
        if (!accountNumber) {
            toast.error("Masukkan nomor HP DANA");
            return;
        }
        if (amountToRedeem < 1) {
            toast.error("Masukkan jumlah minimal Rp 1");
            return;
        }
        if (amountToRedeem > (cashbackBalance || 0)) {
            toast.error("Saldo tidak cukup");
            return;
        }
        setStep("confirm");
    };

    const handleConfirmRedeem = async () => {
        setIsLoading(true);
        try {
            const response = await fetch("/api/redeem/request", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    userName,
                    rupiahAmount: amountToRedeem,
                    paymentMethod: "DANA",
                    accountNumber,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                toast.error(data.error || "Gagal mengirim permintaan");
                return;
            }

            // Deduct cashback from user
            spendCashback(amountToRedeem);
            setStep("success");
            toast.success("Permintaan berhasil dikirim!");

        } catch (error) {
            toast.error("Terjadi kesalahan sistem");
        } finally {
            setIsLoading(false);
        }
    };

    const handleClose = () => {
        setStep("form");
        setAccountNumber("");
        setAmountToRedeem(cashbackBalance || 0);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md animate-in fade-in">
            <div className="w-full max-w-md bg-[#051F15] border-2 border-emerald-500/30 rounded-3xl p-0 mx-4 shadow-2xl shadow-emerald-500/20 relative overflow-hidden animate-in zoom-in-95">

                {/* Glow Effects */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none -mt-20 -mr-20" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-green-500/10 rounded-full blur-[100px] pointer-events-none -mb-20 -ml-20" />

                {/* Close Button */}
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-20 text-emerald-400/50 hover:text-emerald-400 hover:bg-emerald-400/10"
                >
                    <X className="h-6 w-6" />
                </Button>

                {/* Header */}
                <div className="p-8 pb-4 text-center relative z-10">
                    <div className="bg-emerald-500/10 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-emerald-500/30 shadow-lg shadow-emerald-500/20">
                        <Wallet className="h-8 w-8 text-emerald-400" />
                    </div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-wider mb-1">
                        Tarik <span className="text-emerald-400">Dana</span>
                    </h2>
                    <p className="text-emerald-200/60 font-medium text-sm">Transfer Cashback ke DANA</p>
                </div>

                {/* Content Body */}
                <div className="p-6 pt-2 relative z-10">

                    {/* User Balance Card */}
                    <div className="bg-black/30 rounded-2xl p-4 border border-emerald-500/20 mb-6 text-center">
                        <p className="text-xs text-gray-400 font-bold uppercase mb-1">Saldo Cashback</p>
                        <p className="text-3xl font-black text-emerald-400">
                            Rp {(cashbackBalance || 0).toLocaleString("id-ID")}
                        </p>
                    </div>

                    {!canRedeem && (
                        <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-3 mb-6 text-center animate-pulse">
                            <p className="text-red-300 text-sm font-bold">⚠️ Saldo tidak mencukupi</p>
                        </div>
                    )}

                    {/* FORM STEP */}
                    {step === "form" && canRedeem && (
                        <div className="space-y-4 animate-in slide-in-from-right-10 fade-in duration-300">
                            <div>
                                <label className="text-emerald-200/70 text-xs font-bold uppercase ml-1">Jumlah Tarik (Rp)</label>
                                <div className="relative mt-1">
                                    <span className="absolute left-3 top-3 text-emerald-400 font-bold">Rp</span>
                                    <Input
                                        type="number"
                                        value={amountToRedeem}
                                        onChange={(e) => setAmountToRedeem(Math.min(Number(e.target.value), cashbackBalance || 0))}
                                        className="bg-black/40 border-emerald-500/30 pl-10 h-11 text-white font-bold focus-visible:ring-emerald-500 text-lg"
                                    />
                                </div>
                                <p className="text-right text-xs text-gray-400 mt-1">
                                    Maksimal: Rp {(cashbackBalance || 0).toLocaleString("id-ID")}
                                </p>
                            </div>

                            <div>
                                <label className="text-emerald-200/70 text-xs font-bold uppercase ml-1">
                                    Nomor HP DANA
                                </label>
                                <Input
                                    placeholder="Contoh: 08123456789"
                                    value={accountNumber}
                                    onChange={(e) => setAccountNumber(e.target.value)}
                                    className="bg-black/40 border-emerald-500/30 h-11 text-white font-bold focus-visible:ring-emerald-500 mt-1"
                                />
                            </div>

                            <Button
                                onClick={handleSubmit}
                                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/30 mt-4"
                            >
                                Lanjutkan
                            </Button>
                        </div>
                    )}

                    {/* CONFIRM STEP */}
                    {step === "confirm" && (
                        <div className="space-y-4 animate-in slide-in-from-right-10 fade-in duration-300">
                            <Button onClick={() => setStep("form")} variant="ghost" className="h-8 px-0 text-emerald-400 hover:text-emerald-300 hover:bg-transparent -mt-2">
                                ← Kembali
                            </Button>

                            <div className="bg-black/30 rounded-xl p-4 border border-emerald-500/20 space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Metode</span>
                                    <span className="text-white font-bold">DANA</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-400">Nomor HP</span>
                                    <span className="text-white font-bold">{accountNumber}</span>
                                </div>
                                <div className="flex justify-between border-t border-emerald-500/20 pt-2 mt-2">
                                    <span className="text-gray-400">Jumlah</span>
                                    <span className="text-2xl font-black text-emerald-400">Rp {amountToRedeem.toLocaleString("id-ID")}</span>
                                </div>
                            </div>

                            <Button
                                onClick={handleConfirmRedeem}
                                disabled={isLoading}
                                className="w-full h-12 bg-gradient-to-r from-emerald-500 to-green-500 hover:from-emerald-600 hover:to-green-600 text-white font-bold text-lg rounded-xl shadow-lg shadow-emerald-500/30"
                            >
                                {isLoading ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                                {isLoading ? "Memproses..." : "Konfirmasi Tarik Dana"}
                            </Button>
                        </div>
                    )}

                    {/* SUCCESS STEP */}
                    {step === "success" && (
                        <div className="text-center py-4 animate-in zoom-in-50 fade-in duration-500">
                            <div className="bg-emerald-500/20 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-emerald-400">
                                <CheckCircle className="h-10 w-10 text-emerald-400" />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Permintaan Terkirim! 🎉</h3>
                            <p className="text-emerald-200/70 text-sm mb-4">
                                Rp {amountToRedeem.toLocaleString("id-ID")} akan segera dikirim ke DANA {accountNumber}
                            </p>
                            <p className="text-gray-400 text-xs mb-6">
                                Admin akan memproses dalam 1x24 jam
                            </p>
                            <Button onClick={handleClose} className="bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 font-bold border border-emerald-500/30">
                                Tutup
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
