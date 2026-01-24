"use client";

import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Gem, RotateCcw, Gift, Frown, Copy, Check } from "lucide-react";
import { cn } from "@/lib/utils";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import Image from "next/image";
import { useUserProgress } from "@/store/use-user-progress";

// Wheel segments configuration
// Wheel segments configuration (Matches Backend)
// Wheel segments configuration (Matches Backend)
// "5 rupiah, 15 rupiah, 25 rupiah"
// Wheel segments configuration (Matches Backend - 11 Segments)
// Wheel segments configuration (Matches Backend - 11 Segments)
// 1. Rp 5, 2. Rp 15, 3. Rp 25
// 4. 5 Gems, 5. 10 Gems, 6. 25 Gems
// 7. 5x Zonk
const SEGMENTS = [
    { label: "Rp 5", sub: "", value: 5, color: "#22c55e", textColor: "#fff" },          // 1. Rp 5 (Green)
    { label: "ZONK", sub: "", value: 0, color: "#ef4444", textColor: "#fff" },           // Zonk 1
    { label: "5 Gems", sub: "", value: 5, color: "#0ea5e9", textColor: "#fff" },         // 4. 5 Gems (Sky Blue)
    { label: "ZONK", sub: "", value: 0, color: "#dc2626", textColor: "#fff" },           // Zonk 2
    { label: "Rp 15", sub: "", value: 15, color: "#16a34a", textColor: "#fff" },         // 2. Rp 15 (Dark Green)
    { label: "ZONK", sub: "", value: 0, color: "#ef4444", textColor: "#fff" },           // Zonk 3
    { label: "10 Gems", sub: "", value: 10, color: "#0284c7", textColor: "#fff" },       // 5. 10 Gems (Blue)
    { label: "ZONK", sub: "", value: 0, color: "#dc2626", textColor: "#fff" },           // Zonk 4
    { label: "Rp 25", sub: "", value: 25, color: "#f59e0b", textColor: "#fff" },         // 3. Rp 25 (Amber)
    { label: "ZONK", sub: "", value: 0, color: "#ef4444", textColor: "#fff" },           // Zonk 5
    { label: "25 Gems", sub: "", value: 25, color: "#6366f1", textColor: "#fff" },       // 6. 25 Gems (Indigo)
];

const SEGMENT_ANGLE = 360 / SEGMENTS.length;

export default function TreasurePage() {
    const router = useRouter();
    const { userId, isGuest } = useUserProgress();
    const [isSpinning, setIsSpinning] = useState(false);
    const [rotation, setRotation] = useState(0);
    const [result, setResult] = useState<{ type: "win" | "zonk" | null; gems: number; cashback: number; code?: string }>({ type: null, gems: 0, cashback: 0 });
    const [copied, setCopied] = useState(false);
    const [canSpin, setCanSpin] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [alreadySpunToday, setAlreadySpunToday] = useState(false);
    const [noAccess, setNoAccess] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const wheelRef = useRef<HTMLDivElement>(null);

    // Check access from database on mount
    useEffect(() => {
        if (!userId || isGuest) {
            setNoAccess(true);
            setCanSpin(false);
            setIsLoading(false);
            return;
        }

        const checkAccess = async () => {
            try {
                const res = await fetch(`/api/treasure/access?userId=${userId}&t=${Date.now()}`);
                const data = await res.json();

                if (!data.hasAccess) {
                    setNoAccess(true);
                    setCanSpin(false);
                } else if (data.alreadySpunToday) {
                    setAlreadySpunToday(true);
                    setCanSpin(false);
                } else {
                    setCanSpin(true);
                }
            } catch {
                setNoAccess(true);
                setCanSpin(false);
            } finally {
                setIsLoading(false);
            }
        };

        checkAccess();
    }, [userId, isGuest]);

    const spinWheel = async () => {
        if (isSpinning || !canSpin) return;

        setIsSpinning(true);
        setResult({ type: null, gems: 0, cashback: 0 });
        setErrorMessage(null);

        try {
            // Check if user is logged in
            if (isGuest || !userId) {
                setErrorMessage("Silakan login terlebih dahulu untuk spin!");
                setIsSpinning(false);
                setCanSpin(false);
                return;
            }

            // Call API to get result
            const response = await fetch("/api/treasure/spin", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ userId }),
            });

            const data = await response.json();

            if (!response.ok) {
                setErrorMessage(data.error || "Gagal spin, coba lagi nanti.");
                setIsSpinning(false);
                setCanSpin(false);
                return;
            }

            const { segmentIndex, voucherCode, gemsWon, cashbackWon } = data;

            // Calculate rotation to land on the winning segment
            // We want the pointer (at top) to point to the winning segment
            const baseRotation = 360 * 5; // 5 full rotations for drama
            const segmentRotation = segmentIndex * SEGMENT_ANGLE;
            // Adjust so pointer lands in the middle of the segment
            const finalRotation = baseRotation + (360 - segmentRotation) - (SEGMENT_ANGLE / 2) + Math.random() * (SEGMENT_ANGLE * 0.6);

            setRotation(finalRotation);

            // Wait for animation to complete
            setTimeout(async () => {
                setIsSpinning(false);

                // Record spin in database
                await fetch("/api/treasure/access", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ userId, action: "recordSpin" }),
                });

                if (gemsWon > 0 || cashbackWon > 0) {
                    // Update state with strictly matched API response
                    setResult({ type: "win", gems: gemsWon, cashback: cashbackWon, code: voucherCode });
                    toast.success(`🎉 Selamat! Anda mendapat +${gemsWon} Gems & Rp ${cashbackWon}!`);
                } else {
                    setResult({ type: "zonk", gems: 0, cashback: 0 });
                    toast.error("😢 Zonk! Coba lagi besok!");
                }
                setCanSpin(false);
            }, 4000);

        } catch (error) {
            console.error("Spin error:", error);
            setErrorMessage("Terjadi kesalahan. Silakan coba lagi.");
            setIsSpinning(false);
        }
    };

    const copyCode = () => {
        if (result.code) {
            navigator.clipboard.writeText(result.code);
            setCopied(true);
            toast.success("Kode voucher disalin!");
            setTimeout(() => setCopied(false), 2000);
        }
    };

    const goToShop = () => {
        router.push("/shop");
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0a1f12] via-[#112217] to-[#0a1f12] flex flex-col items-center justify-center p-4">
            {/* Header */}
            <div className="text-center mb-8">
                <h1 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-yellow-300 mb-2 flex items-center justify-center gap-3">
                    <Gift className="h-10 w-10 text-orange-400" />
                    Harta Karun Gems
                </h1>
                <p className="text-gray-400 text-lg">Putar roda dan dapatkan Gems gratis!</p>
            </div>

            {/* Wheel Container */}
            <div className="relative mb-8">
                {/* Pointer */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 z-20">
                    <div className="w-0 h-0 border-l-[20px] border-r-[20px] border-t-[30px] border-l-transparent border-r-transparent border-t-orange-500 drop-shadow-lg" />
                </div>

                {/* Wheel */}
                <div
                    ref={wheelRef}
                    className="w-[300px] h-[300px] md:w-[400px] md:h-[400px] rounded-full relative shadow-2xl border-8 border-orange-500/50"
                    style={{
                        transform: `rotate(${rotation}deg)`,
                        transition: isSpinning ? "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)" : "none",
                    }}
                >
                    {/* SVG Wheel */}
                    <svg viewBox="0 0 100 100" className="w-full h-full">
                        {SEGMENTS.map((segment, index) => {
                            const startAngle = index * SEGMENT_ANGLE;
                            const endAngle = startAngle + SEGMENT_ANGLE;
                            const startRad = (startAngle - 90) * (Math.PI / 180);
                            const endRad = (endAngle - 90) * (Math.PI / 180);

                            const x1 = 50 + 50 * Math.cos(startRad);
                            const y1 = 50 + 50 * Math.sin(startRad);
                            const x2 = 50 + 50 * Math.cos(endRad);
                            const y2 = 50 + 50 * Math.sin(endRad);

                            const largeArc = SEGMENT_ANGLE > 180 ? 1 : 0;

                            const pathD = `M 50 50 L ${x1} ${y1} A 50 50 0 ${largeArc} 1 ${x2} ${y2} Z`;

                            // Text position (middle of segment)
                            const midAngle = (startAngle + SEGMENT_ANGLE / 2 - 90) * (Math.PI / 180);
                            const textX = 50 + 30 * Math.cos(midAngle);
                            const textY = 50 + 30 * Math.sin(midAngle);
                            const textRotation = startAngle + SEGMENT_ANGLE / 2;

                            return (
                                <g key={index}>
                                    <path d={pathD} fill={segment.color} stroke="#fff" strokeWidth="0.5" />
                                    <text
                                        x={textX}
                                        y={textY}
                                        fill={segment.textColor}
                                        fontSize="4"
                                        fontWeight="bold"
                                        textAnchor="middle"
                                        dominantBaseline="middle"
                                        transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                                    >
                                        {segment.label}
                                    </text>
                                    {segment.sub && (
                                        <text
                                            x={textX}
                                            y={textY + 4}
                                            fill={segment.textColor}
                                            fontSize="3"
                                            fontWeight="normal"
                                            textAnchor="middle"
                                            dominantBaseline="middle"
                                            transform={`rotate(${textRotation}, ${textX}, ${textY})`}
                                        >
                                            {segment.sub}
                                        </text>
                                    )}
                                </g>
                            );
                        })}
                        {/* Center circle */}
                        <circle cx="50" cy="50" r="10" fill="#112217" stroke="#f59e0b" strokeWidth="2" />
                        <text x="50" y="50" fill="#f59e0b" fontSize="4" fontWeight="bold" textAnchor="middle" dominantBaseline="middle">
                            SPIN
                        </text>
                    </svg>
                </div>
            </div>

            {/* No Access - Direct URL Access Blocked */}
            {noAccess && result.type === null && (
                <div className="mt-6 p-6 rounded-2xl bg-red-500/20 border-2 border-red-500 text-center max-w-md">
                    <Frown className="h-12 w-12 text-red-400 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-red-300 mb-2">Akses Ditolak! 🚫</h3>
                    <p className="text-gray-300 mb-4">Kamu harus akses melalui widget "Harta Karun Gem" di sidebar.</p>
                    <p className="text-gray-400 text-sm mb-4">Tidak bisa langsung akses halaman ini!</p>
                    <Button
                        onClick={() => router.push("/learn")}
                        variant="secondary"
                        className="mt-2"
                    >
                        Kembali ke Learn
                    </Button>
                </div>
            )}

            {/* Already Spun Today Message */}
            {alreadySpunToday && !noAccess && result.type === null && (
                <div className="mt-6 p-6 rounded-2xl bg-yellow-500/20 border-2 border-yellow-500 text-center max-w-md">
                    <RotateCcw className="h-12 w-12 text-yellow-400 mx-auto mb-3" />
                    <h3 className="text-xl font-bold text-yellow-300 mb-2">Kamu Sudah Spin Hari Ini! 🎰</h3>
                    <p className="text-gray-300 mb-4">Kesempatan spin gratis hanya 1x per hari.</p>
                    <p className="text-gray-400 text-sm">Datang lagi besok untuk kesempatan baru!</p>
                    <Button
                        onClick={() => router.push("/learn")}
                        variant="secondary"
                        className="mt-4"
                    >
                        Kembali Belajar
                    </Button>
                </div>
            )}

            {/* Spin Button */}
            {result.type === null && !alreadySpunToday && !noAccess && (
                <Button
                    onClick={spinWheel}
                    disabled={isSpinning || !canSpin}
                    className={cn(
                        "h-16 px-12 text-xl font-bold rounded-2xl shadow-xl transition-all",
                        "bg-gradient-to-b from-orange-400 to-orange-600 hover:brightness-110",
                        "border-b-4 border-orange-700 active:border-b-0 active:translate-y-1",
                        isSpinning && "animate-pulse cursor-not-allowed"
                    )}
                >
                    {isSpinning ? (
                        <RotateCcw className="h-6 w-6 animate-spin mr-2" />
                    ) : (
                        <Gem className="h-6 w-6 mr-2" />
                    )}
                    {isSpinning ? "Memutar..." : "Putar Sekarang!"}
                </Button>
            )}

            {/* Error Message */}
            {errorMessage && (
                <div className="mt-6 p-6 rounded-2xl bg-red-500/20 border-2 border-red-500 text-center max-w-md">
                    <Frown className="h-12 w-12 text-red-400 mx-auto mb-3" />
                    <p className="text-red-300 font-bold text-lg">{errorMessage}</p>
                    <Button
                        onClick={() => router.push("/learn")}
                        variant="secondary"
                        className="mt-4"
                    >
                        Kembali ke Belajar
                    </Button>
                </div>
            )}

            {/* Result: ZONK */}
            {result.type === "zonk" && (
                <div className="mt-6 p-8 rounded-2xl bg-red-500/20 border-2 border-red-500 text-center max-w-md animate-in fade-in zoom-in">
                    <Frown className="h-16 w-16 text-red-400 mx-auto mb-4" />
                    <h2 className="text-2xl font-bold text-red-300 mb-2">ZONK!</h2>
                    <p className="text-gray-300 mb-4">Sayang sekali, kamu tidak beruntung kali ini.</p>
                    <p className="text-gray-400 text-sm">Coba lagi besok untuk kesempatan baru!</p>
                    <Button
                        onClick={() => router.push("/learn")}
                        variant="secondary"
                        className="mt-6"
                    >
                        Kembali ke Belajar
                    </Button>
                </div>
            )}

            {/* Result: WIN */}
            {result.type === "win" && (
                <div className="mt-6 p-8 rounded-2xl bg-green-500/20 border-2 border-green-500 text-center max-w-md animate-in fade-in zoom-in">
                    <div className="relative">
                        <Gift className="h-16 w-16 text-green-400 mx-auto mb-4 animate-bounce" />
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="w-20 h-20 rounded-full bg-green-400/20 animate-ping" />
                        </div>
                    </div>
                    <h2 className="text-2xl font-bold text-green-300 mb-2">🎉 SELAMAT!</h2>
                    <p className="text-gray-300 mb-4">
                        Kamu mendapatkan:
                    </p>
                    <div className="flex justify-center gap-4 mb-4">
                        {result.cashback > 0 && (
                            <div className="bg-green-500/20 p-3 rounded-xl border border-green-500 flex flex-col items-center min-w-[100px]">
                                <span className="text-green-400 font-bold text-xl">Rp {result.cashback.toLocaleString()}</span>
                                <span className="text-xs text-green-300 uppercase">Cashback</span>
                            </div>
                        )}
                        {result.gems > 0 && (
                            <div className="bg-sky-500/20 p-3 rounded-xl border border-sky-500 flex flex-col items-center min-w-[100px]">
                                <span className="text-sky-400 font-bold text-xl">+{result.gems} Gems</span>
                                <span className="text-xs text-sky-300 uppercase">Gems</span>
                            </div>
                        )}
                    </div>
                    {/* If somehow both are 0 (should use Zonk for that), handle grace - but logic handled by Zonk Type */}
                    {(result.gems > 0 && result.cashback > 0) && (
                        <p className="text-xs text-yellow-300 mb-2 animate-pulse">Double Jackpot! 🌟</p>
                    )}

                    {/* Voucher Code */}
                    <div className="bg-[#112217] p-4 rounded-xl border-2 border-dashed border-green-500 mb-4">
                        <p className="text-gray-400 text-sm mb-2">Kode Voucher:</p>
                        <div className="flex items-center justify-center gap-2">
                            <code className="text-2xl font-mono font-bold text-green-400 tracking-wider">
                                {result.code}
                            </code>
                            <Button
                                size="icon"
                                variant="ghost"
                                onClick={copyCode}
                                className="h-8 w-8 text-green-400 hover:bg-green-400/20"
                            >
                                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                            </Button>
                        </div>
                    </div>

                    <p className="text-gray-400 text-sm mb-4">
                        Salin kode di atas dan tukarkan di Shop untuk mendapatkan Gems-mu!
                    </p>

                    <Button
                        onClick={goToShop}
                        className="bg-gradient-to-b from-green-400 to-green-600 hover:brightness-110 text-white font-bold"
                    >
                        <Gem className="h-5 w-5 mr-2" />
                        Tukar di Shop Sekarang
                    </Button>
                </div>
            )}

            {/* Mascot */}
            <div className="fixed bottom-4 right-4 w-24 h-24 opacity-50 hidden md:block">
                <Image src="/mascot.svg" alt="Mascot" fill className="object-contain" />
            </div>
        </div>
    );
}
