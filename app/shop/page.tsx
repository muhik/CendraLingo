"use client";

import { useState, useEffect, Suspense } from "react";
import { StickyHeader } from "@/components/layout/sticky-header";
import { ShopItem } from "@/components/shop/shop-item";
import { AdSidebar } from "@/components/layout/ad-sidebar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Heart, Flame, Store, Gem, Trophy, CheckCircle, X } from "lucide-react";
import { Sidebar } from "@/components/layout/sidebar";
import { AuthModal } from "@/components/modals/auth-modal";
import { useUserProgress } from "@/store/use-user-progress";
import Image from "next/image";
import { toast } from "sonner";
import { RedeemModal } from "@/components/modals/redeem-modal";
import { ProModal } from "@/components/modals/pro-modal";
import { ManualPaymentModal } from "@/components/modals/manual-payment-modal";

import { useSearchParams } from "next/navigation";

function ShopContent() {
    const searchParams = useSearchParams();
    const autoUpgrade = searchParams.get("auto_upgrade");
    const { userId, points, hearts, cashbackBalance, spendPoints, refillHearts, addPoints, addCashback, isGuest, hasActiveSubscription, upgradeToPro, syncWithDb, refreshUserData } = useUserProgress();
    const [isProcessing, setIsProcessing] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false);
    const [showRedeemModal, setShowRedeemModal] = useState(false);
    const [isMounted, setIsMounted] = useState(false);

    // Voucher State
    const [voucherCode, setVoucherCode] = useState("");

    useEffect(() => {
        setIsMounted(true);
        refreshUserData(); // Fetch latest data from DB (including cash back)
    }, [refreshUserData]);

    // Pending purchase to resume after login
    const [pendingPurchase, setPendingPurchase] = useState<{ amount: number, price: string } | null>(null);

    // Completed Redeem Notification State
    const [completedRedeems, setCompletedRedeems] = useState<any[]>([]);
    const [showRedeemNotification, setShowRedeemNotification] = useState(false);

    // Check for completed redeem requests
    useEffect(() => {
        if (userId && !isGuest) {
            fetch(`/api/redeem/status?userId=${userId}`)
                .then(res => res.json())
                .then(data => {
                    if (data.hasCompleted && data.requests.length > 0) {
                        setCompletedRedeems(data.requests);
                        setShowRedeemNotification(true);
                    }
                })
                .catch(console.error);
        }
    }, [userId, isGuest]);

    // Dismiss notification and mark as seen
    const dismissRedeemNotification = async (requestId: number) => {
        await fetch('/api/redeem/status', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ requestId }),
        });
        setCompletedRedeems(prev => prev.filter(r => r.id !== requestId));
        if (completedRedeems.length <= 1) {
            setShowRedeemNotification(false);
        }
        toast.success('Notifikasi dihapus');
    };


    const handleRedeem = async () => {
        if (!voucherCode) return;

        setIsProcessing(true);
        try {
            const response = await fetch("/api/vouchers/redeem", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ code: voucherCode, userId }),
            });
            const data = await response.json();

            if (data.success) {
                toast.success(data.message || "Voucher berhasil diklaim! 🎉");
                addPoints(data.gems);
                addCashback(data.cashback);
                setVoucherCode("");
            } else {
                toast.error(data.message || "Gagal klaim voucher.");
            }
        } catch (error) {
            toast.error("Terjadi kesalahan sistem.");
        } finally {
            setIsProcessing(false);
        }
    };


    const [showProModal, setShowProModal] = useState(false);

    useEffect(() => {
        if (autoUpgrade === 'true' && !hasActiveSubscription) {
            setShowProModal(true);
        }
    }, [autoUpgrade, hasActiveSubscription]);

    // Triggered when clicking Upgrade Button
    const handleUpgradeClick = () => {
        if (isProcessing) return;

        if (isGuest) {
            toast.warning("Silahkan Login terlebih dahulu untuk berlangganan!");
            setShowAuthModal(true);
            return;
        }

        setShowProModal(true);
    };

    // Triggered when confirming inside ProModal
    const handleConfirmUpgrade = async () => {
        // MANUAL PAYMENT FLOW for PRO
        if (useManualPayment) {
            setShowProModal(false);
            setManualAmount(49000);
            setManualPlanType("PRO_MONTHLY");
            setShowManualModal(true);
            return;
        }

        setIsProcessing(true);
        try {
            // 1. Request Payment Link
            const response = await fetch("/api/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId, planType: "PRO_MONTHLY" })
            });
            const data = await response.json();

            if (data.url) {
                // 2. Redirect to Xendit Payment Page
                window.location.href = data.url;
            } else {
                toast.error("Gagal membuat pembayaran. Coba lagi.");
                setIsProcessing(false);
            }
        } catch (error) {
            console.error(error);
            toast.error("Terjadi kesalahan sistem.");
            setIsProcessing(false);
        }
    };

    const handleRefillHearts = () => {
        if (spendPoints(200)) {
            refillHearts();
            toast.success("Added +5 Hearts! ❤️");
        } else {
            toast.error("Not enough gems! Top up below.");
        }
    };

    const handleBuyFreeze = () => {
        if (spendPoints(2000)) {
            toast.success("Streak Freeze Equipped! ❄️");
        } else {
            toast.error("Not enough gems!");
        }
    };

    // Manual Payment States
    const [showManualModal, setShowManualModal] = useState(false);
    const [manualAmount, setManualAmount] = useState(0);
    const [manualPlanType, setManualPlanType] = useState("");
    const [useManualPayment, setUseManualPayment] = useState(false); // Toggle state

    const handleBuyGems = async (amount: number, priceRp: string) => {
        console.log("💎 [DEBUG] Buy Gems Clicked!", amount, priceRp);
        if (isProcessing) {
            console.log("⚠️ [DEBUG] Processing is locked.");
            return;
        }

        // Strip non-numeric
        const numericPrice = parseInt(priceRp.replace(/[^0-9]/g, ""), 10);
        console.log("💰 [DEBUG] Mode:", useManualPayment ? "Manual" : "Midtrans");

        if (useManualPayment) {
            // MANUAL FLOW
            setManualAmount(numericPrice);
            setManualPlanType("GEMS_TOPUP");
            setShowManualModal(true);
            return;
        }

        // MIDTRANS FLOW
        setIsProcessing(true);
        try {
            const response = await fetch("/api/purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    planType: "GEMS_TOPUP",
                    customAmount: numericPrice,
                    customDescription: `Top Up ${amount} Gems`
                })
            });

            const data = await response.json().catch(() => null);

            if (!data) {
                console.error("Invalid JSON response from server");
                toast.error("Gagal memproses pembayaran. Silakan coba lagi nanti.");
                setIsProcessing(false);
                return;
            }

            if (data.url) {
                // Redirect to Midtrans
                window.location.href = data.url;
            } else {
                const errMsg = data.error || "Pembayaran gagal";
                console.error("Payment API Error:", errMsg);
                toast.error(errMsg);
                setIsProcessing(false);
            }
        } catch (error: any) {
            console.error("Purchase Flow Error:", error);
            toast.error(`Application Error: ${error.message || String(error)}`);
            setIsProcessing(false);
        }
    };

    const handleConfirmManualPayment = async () => {
        setIsProcessing(true);
        try {
            const res = await fetch("/api/manual-purchase", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    userId,
                    planType: manualPlanType,
                    customAmount: manualAmount,
                    paymentMethod: "MANUAL_TRANSFER"
                })
            });

            // Handle non-OK responses first
            if (!res.ok) {
                const errorText = await res.text();
                console.error("API Error Response:", res.status, errorText);
                toast.error(`Error ${res.status}: ${errorText.substring(0, 100)}`);
                return;
            }

            const data = await res.json();
            if (data.success) {
                toast.success("Konfirmasi Terkirim! Mohon tunggu verifikasi Admin (max 24 jam).");
                setShowManualModal(false);
            } else {
                toast.error("Gagal mengirim konfirmasi: " + data.error);
            }
        } catch (error: any) {
            console.error("Manual Payment Error:", error);
            toast.error("Terjadi kesalahan: " + (error.message || String(error)));
        } finally {
            setIsProcessing(false);
        }
    };

    const onAuthSuccess = () => {
        if (pendingPurchase) {
            toast.info(`Login Berhasil! Bonus +50 Gems sudah masuk. Silahkan lanjutkan pembelian.`);
            setPendingPurchase(null);
        } else {
            toast.success("Login Berhasil! Bonus +50 Gems sudah masuk.");
        }
    };

    if (!isMounted) return null;

    return (
        <div className="flex flex-row-reverse min-h-screen bg-[#022c22]">
            {/* RIGHT AD SPACE (Desktop Only) */}
            <AdSidebar />

            <AuthModal
                open={showAuthModal}
                setOpen={setShowAuthModal}
                onSuccess={onAuthSuccess}
            />

            <RedeemModal
                isOpen={showRedeemModal}
                onClose={() => setShowRedeemModal(false)}
            />

            <ProModal
                isOpen={showProModal}
                onClose={() => setShowProModal(false)}
                onConfirm={handleConfirmUpgrade}
                isLoading={isProcessing}
            />

            <ManualPaymentModal
                isOpen={showManualModal}
                onClose={() => setShowManualModal(false)}
                amount={manualAmount}
                onConfirm={handleConfirmManualPayment}
                isLoading={isProcessing}
            />

            <div className="hidden lg:block w-[256px] relative">
                <Sidebar />
            </div>

            <div className="flex-1 max-w-[900px] px-6 mx-auto pb-40">
                <StickyHeader title="Shop" />

                <div className="flex flex-col items-center mt-10">

                    {/* REDEEM COMPLETED NOTIFICATION */}
                    {showRedeemNotification && completedRedeems.length > 0 && (
                        <div className="w-full mb-6">
                            {completedRedeems.map((redeem) => (
                                <div key={redeem.id} className="bg-gradient-to-r from-green-500 to-emerald-600 p-4 rounded-xl text-white mb-2 flex items-center justify-between shadow-lg animate-pulse">
                                    <div className="flex items-center gap-3">
                                        <div className="bg-white/20 p-2 rounded-full">
                                            <CheckCircle className="h-6 w-6" />
                                        </div>
                                        <div>
                                            <p className="font-bold text-lg">🎉 Penarikan Dana Berhasil!</p>
                                            <p className="text-sm text-green-100">
                                                Rp {redeem.rupiahAmount?.toLocaleString()} telah dikirim ke {redeem.paymentMethod} {redeem.accountNumber}
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => dismissRedeemNotification(redeem.id)}
                                        className="bg-white/20 hover:bg-white/30 p-2 rounded-full transition-all"
                                    >
                                        <X className="h-5 w-5" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* PREMIUM HEADER */}
                    <div className="w-full bg-gradient-to-r from-sky-400 to-indigo-500 p-8 rounded-2xl text-white mb-10 shadow-lg shadow-sky-200 border-b-4 border-sky-600 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -mr-10 -mt-10 pointer-events-none" />
                        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-6">
                                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-md border border-white/30 hover:scale-110 transition-transform cursor-pointer shadow-inner">
                                    <Store className="h-10 w-10 text-white" />
                                </div>
                                <div className="text-center md:text-left">
                                    <h1 className="text-3xl font-extrabold uppercase tracking-wide drop-shadow-sm">Warung Cendra</h1>
                                    <p className="text-sky-50 text-base font-medium opacity-90">Tukar Gems & Belanja Power-ups!</p>
                                </div>
                            </div>
                            <div className="hidden md:block">
                                <div className="text-right">
                                    <span className="text-xs font-bold uppercase text-sky-200 block mb-1">Saldo Anda</span>
                                    <span className="text-4xl font-extrabold text-white drop-shadow-md flex items-center gap-2 justify-end">
                                        <Gem className="h-8 w-8 text-sky-200" />
                                        {points}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* DOMPET CUAN */}
                    <div className="w-full flex flex-col gap-y-4 bg-[#0f3a2f]/80 p-6 mb-10 border-2 border-white/10 rounded-2xl shadow-sm relative overflow-hidden backdrop-blur-sm">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-400 to-emerald-500" />

                        <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-black/20 rounded-xl border border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="bg-green-500 p-3 rounded-xl shadow-lg shadow-green-900/50">
                                    <Trophy className="h-6 w-6 text-emerald-950" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-emerald-400 text-sm uppercase tracking-wider">Dompet Cashback</h3>
                                    <p className="text-white font-mono text-3xl font-extrabold tracking-tight">
                                        Rp {cashbackBalance.toLocaleString()}
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="primary"
                                className="bg-green-500 border-green-600 hover:bg-green-400 w-full md:w-auto shadow-md hover:shadow-lg transition-all text-emerald-950 font-bold"
                                onClick={() => setShowRedeemModal(true)}
                            >
                                TARIK DANA
                            </Button>
                        </div>

                        {/* VOUCHER INPUT */}
                        <div className="bg-black/20 p-4 rounded-xl border border-white/5">
                            <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Punya Kode Promo?</label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Masukan Kode (Contoh: CN-XXXX)"
                                    value={voucherCode}
                                    onChange={(e) => setVoucherCode(e.target.value.toUpperCase())}
                                    className="bg-black/40 border-2 border-white/10 focus-visible:ring-emerald-400 font-mono font-bold text-white h-11 placeholder:text-slate-600"
                                />
                                <Button
                                    onClick={handleRedeem}
                                    disabled={!voucherCode || isProcessing}
                                    className="bg-sky-500 hover:bg-sky-400 text-white border-b-4 border-sky-700 active:border-b-0 h-11 px-6 font-bold"
                                >
                                    {isProcessing ? "..." : "KLAIM"}
                                </Button>
                            </div>
                        </div>
                    </div>

                    <div className="w-full space-y-12">
                        {/* GLOBAL PAYMENT METHOD TOGGLE */}
                        <div className="w-full">
                            <div className="bg-[#14532d] p-4 rounded-xl border-2 border-[#166534] flex flex-col md:flex-row items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="bg-amber-100 p-2 rounded-lg">
                                        <Image src={useManualPayment ? "/bca.png" : "/mascot.svg"} width={32} height={32} alt="Payment" className="object-contain" onError={(e) => e.currentTarget.style.display = 'none'} />
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-white text-lg">Metode Pembayaran</h3>
                                        <p className="text-white/70 text-sm">
                                            {useManualPayment ? "Transfer Manual (BCA / QRIS)" : "Otomatis (Midtrans)"}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 bg-[#022c22] p-1 rounded-lg border border-[#166534]">
                                    <button
                                        onClick={() => setUseManualPayment(false)}
                                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${!useManualPayment ? "bg-green-500 text-white shadow" : "text-white/50 hover:text-white"}`}
                                    >
                                        Otomatis
                                    </button>
                                    <button
                                        onClick={() => setUseManualPayment(true)}
                                        className={`px-4 py-2 rounded-md text-sm font-bold transition-all ${useManualPayment ? "bg-amber-500 text-white shadow" : "text-white/50 hover:text-white"}`}
                                    >
                                        Manual
                                    </button>
                                </div>
                            </div>
                            {useManualPayment && (
                                <div className="mt-2 text-xs text-amber-300 text-center animate-pulse">
                                    * Metode manual membutuhkan verifikasi Admin (Max 24 jam).
                                </div>
                            )}
                        </div>

                        {/* PRO SECTION */}
                        <div className="w-full p-1 bg-gradient-to-r from-amber-300 to-orange-400 rounded-2xl shadow-lg shadow-orange-100">
                            <div className="bg-amber-50 rounded-xl p-6 flex flex-col md:flex-row items-center justify-between gap-6 h-full">
                                <div className="flex items-center gap-4">
                                    <div className="bg-gradient-to-br from-amber-400 to-orange-500 p-3 rounded-full shadow-md">
                                        <Trophy className="h-8 w-8 text-white" />
                                    </div>
                                    <div className="flex flex-col gap-1">
                                        <h2 className="text-2xl font-extrabold text-neutral-800 flex items-center gap-2">
                                            JAWARA PRO
                                        </h2>
                                        <p className="text-slate-600 font-medium">
                                            {hasActiveSubscription
                                                ? "Status Aktif! Nikmati +1000 Gems & +100 Hearts/Bulan. ⚡"
                                                : "Dapat 1000 Gems + 100 Hearts, Tanpa Iklan, Akses Prioritas."}
                                        </p>
                                    </div>
                                </div>
                                <Button
                                    onClick={handleUpgradeClick}
                                    disabled={hasActiveSubscription || isProcessing}
                                    className={hasActiveSubscription
                                        ? "bg-amber-200 text-amber-800 border-amber-400 font-bold"
                                        : "bg-gradient-to-b from-amber-500 to-orange-600 text-white border-b-4 border-orange-700 active:border-b-0 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all h-14 px-8 text-lg font-extrabold tracking-wide"}
                                >
                                    {hasActiveSubscription ? "MEMBER AKTIF" : "UPGRADE - Rp 49K"}
                                </Button>
                            </div>
                        </div>

                        {/* ITEMS GRID */}
                        <div>
                            <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                <Heart className="text-rose-500 fill-rose-500" /> Power-Ups
                            </h2>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <ShopItem
                                    name="Refill Hearts"
                                    description="Isi ulang nyawa penuh supaya bisa belajar terus."
                                    Icon={Heart}
                                    iconColor="text-rose-500 fill-rose-500"
                                    price={200}
                                    points={points}
                                    hasActive={false} // Allow buying even if full
                                    activeTitle="ISI NYAWA (+5)"
                                    onBuy={handleRefillHearts}
                                />
                                <ShopItem
                                    name="Streak Freeze"
                                    description="Jaga streak-mu tetap aman meskipun absen sehari."
                                    Icon={Flame}
                                    iconColor="text-orange-500 fill-orange-500"
                                    price={2000}
                                    points={points}
                                    hasActive={false} // Allow buying even if full
                                    activeTitle="BEKU SIHIR"
                                    onBuy={handleBuyFreeze}
                                />
                            </div>
                        </div>

                        {/* TOP UP GEMS SECTION */}
                        <h2 className="text-xl font-bold text-sky-400 mb-6 flex items-center gap-2">
                            <Gem className="text-sky-400 fill-sky-400" /> Top Up Gems
                        </h2>

                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                            <ShopItem
                                name="Streak Freeze"
                                description="Jaga streak-mu tetap aman meskipun absen sehari."
                                Icon={Flame}
                                iconColor="text-orange-500 fill-orange-500"
                                price={2000}
                                points={points}
                                hasActive={false}
                                activeTitle="BEKU SIHIR"
                                onBuy={handleBuyFreeze}
                            />
                        </div>
                    </div>

                    {/* GEMS GRID */}
                    <div>
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Gem className="text-sky-500 fill-sky-500" /> Top Up Gems
                        </h2>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <ShopItem
                                name="Segenggam Gems"
                                description="10 Gems"
                                Icon={Gem}
                                iconColor="text-sky-400 fill-sky-400"
                                price={0}
                                priceText="Rp 1.000"
                                points={points}
                                hasActive={false}
                                onBuy={() => handleBuyGems(10, "Rp 1.000")}
                            />
                            <ShopItem
                                name="Karung Gems"
                                description="55 Gems"
                                Icon={Gem}
                                iconColor="text-sky-500 fill-sky-500"
                                price={0}
                                priceText="Rp 5.000"
                                points={points}
                                hasActive={false}
                                onBuy={() => handleBuyGems(55, "Rp 5.000")}
                                isPopular
                            />
                            <ShopItem
                                name="Peti Harta"
                                description="120 Gems"
                                Icon={Gem}
                                iconColor="text-indigo-500 fill-indigo-500"
                        <div>
                                <h2 className="text-xl font-bold text-sky-400 mb-6 flex items-center gap-2">
                                    <Gem className="text-sky-400 fill-sky-400" /> Top Up Gems
                                </h2>

                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <ShopItem
                                        name="Streak Freeze"
                                        description="Jaga streak-mu tetap aman meskipun absen sehari."
                                        Icon={Flame}
                                        iconColor="text-orange-500 fill-orange-500"
                                        price={2000}
                                        points={points}
                                        hasActive={false}
                                        activeTitle="BEKU SIHIR"
                                        onBuy={handleBuyFreeze}
                                    />
                                </div>
                            </div>

                            {/* GEMS GRID */}
                            <div>
                                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                                    <Gem className="text-sky-500 fill-sky-500" /> Top Up Gems
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <ShopItem
                                        name="Segenggam Gems"
                                        description="10 Gems"
                                        Icon={Gem}
                                        iconColor="text-sky-400 fill-sky-400"
                                        price={0}
                                        priceText="Rp 1.000"
                                        points={points}
                                        hasActive={false}
                                        onBuy={() => handleBuyGems(10, "Rp 1.000")}
                                    />
                                    <ShopItem
                                        name="Karung Gems"
                                        description="55 Gems"
                                        Icon={Gem}
                                        iconColor="text-sky-500 fill-sky-500"
                                        price={0}
                                        priceText="Rp 5.000"
                                        points={points}
                                        hasActive={false}
                                        onBuy={() => handleBuyGems(55, "Rp 5.000")}
                                        isPopular
                                    />
                                    <ShopItem
                                        name="Peti Harta"
                                        description="120 Gems"
                                        Icon={Gem}
                                        iconColor="text-indigo-500 fill-indigo-500"
                                        price={0}
                                        priceText="Rp 10.000"
                                        points={points}
                                        hasActive={false}
                                        onBuy={() => handleBuyGems(120, "Rp 10.000")}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );

}

export default function ShopPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-[#022c22] flex items-center justify-center text-white">Loading Shop...</div>}>
            <ShopContent />
        </Suspense>
    );
}
