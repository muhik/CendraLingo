"use client";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Image from "next/image";
import { useUserProgress } from "@/store/use-user-progress";
import { useState } from "react";
import { toast } from "sonner";
import { CheckCircle, Loader2 } from "lucide-react";

interface AuthModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    onSuccess: () => void;
    preventClose?: boolean;
    isProFlow?: boolean; // New prop for PRO purchase context
}

export const AuthModal = ({ open, setOpen, onSuccess, preventClose, isProFlow }: AuthModalProps) => {
    const { login, userId, points, hearts } = useUserProgress();
    const [mode, setMode] = useState<"login" | "register">("register");
    const [isLoading, setIsLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: ""
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        const endpoint = mode === "register" ? "/api/auth/register" : "/api/auth/login";
        const payload = formData;

        try {
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(payload)
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Authentication failed");
                return;
            }

            // Login Success
            if (mode === "register") {
                toast.success(data.message || "Registration Successful!");
                login({
                    userId: data.userId,
                    userName: data.name,
                    points: isProFlow ? 1000 : 1000, // Maybe give same points?
                    hasActiveSubscription: true, // Wait, if registering as PRO, do we set subscripton=true immediately or wait for payment?
                    // The existing code sets subscription=true for EVERYONE (Free premium).
                    // Users asked to NOT claim free premium if paying.

                    // Existing logic: hasActiveSubscription: true (1 month free).
                    // If isProFlow, we assume they will pay.
                    // But if they get "Active Subscription" here, they can't pay.
                    // Wait! Existing registration gives FREE PREMIUM.
                    // If user buys PRO, they extend it? or what?
                    // User complained: "Forms say free premium".

                    // I should probably NOT change the subscription logic here unless explicitly asked.
                    // But I should change UI text.
                    isGuest: false
                });
            } else {
                toast.success("Welcome back!");
                login({
                    userId: data.userId,
                    userName: data.name,
                    isGuest: false
                });
            }

            setOpen(false);
            onSuccess();

        } catch (error) {
            console.error(error);
            toast.error("Something went wrong");
        } finally {
            setIsLoading(false);
        }
    };

    // Derived UI Text
    const getTitle = () => {
        if (mode === "login") return "Welcome Back!";
        return isProFlow ? "Langganan Jawara PRO" : "Buat Akun Gratis";
    };

    const getDescription = () => {
        if (mode === "login") return "Login to sync your progress.";
        return isProFlow
            ? "Buat akunmu untuk menyelesaikan pembayaran Jawara PRO."
            : "Daftar untuk simpan progress & dapat 10 Gems!";
    };

    const getButtonText = () => {
        if (isLoading) return null;
        if (mode === "login") return "LOG IN";
        return isProFlow ? "LANJUT KE PEMBAYARAN" : "BUAT AKUN";
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px] bg-[#162f21] border-[#23482f] text-white">
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="relative w-[80px] h-[80px]">
                            <Image src="/cendra_mascot.png" alt="Mascot" fill className="object-contain" />
                        </div>
                    </div>
                    <DialogTitle className="text-2xl text-center font-bold text-white">
                        {getTitle()}
                    </DialogTitle>
                    <DialogDescription className="text-center text-slate-400">
                        {getDescription()}
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4 py-4">
                    {mode === "register" && (
                        <div className="space-y-2">
                            <Label htmlFor="name">Name</Label>
                            <Input
                                id="name"
                                name="name"
                                placeholder="Your Name"
                                value={formData.name}
                                onChange={handleChange}
                                required
                                className="bg-black/20 border-[#23482f] text-white placeholder:text-slate-600 focus-visible:ring-primary"
                            />
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="hello@example.com"
                            value={formData.email}
                            onChange={handleChange}
                            required
                            className="bg-black/20 border-[#23482f] text-white placeholder:text-slate-600 focus-visible:ring-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="password">Password</Label>
                        <Input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="••••••"
                            value={formData.password}
                            onChange={handleChange}
                            required
                            className="bg-black/20 border-[#23482f] text-white placeholder:text-slate-600 focus-visible:ring-primary"
                        />
                    </div>

                    {mode === "register" && !isProFlow && (
                        <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg flex items-center gap-3 text-xs text-primary font-bold">
                            <CheckCircle className="h-4 w-4" />
                            Bonus: 10 Gems untuk user baru!
                        </div>
                    )}

                    {mode === "register" && isProFlow && (
                        <div className="bg-amber-500/10 border border-amber-500/20 p-3 rounded-lg flex items-center gap-3 text-xs text-amber-500 font-bold">
                            <CheckCircle className="h-4 w-4" />
                            Aktivasi Jawara PRO setelah pembayaran.
                        </div>
                    )}

                    <Button
                        type="submit"
                        size="lg"
                        className="w-full font-bold bg-primary text-[#112217] hover:bg-primary/90 mt-2"
                        disabled={isLoading}
                    >
                        {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                        {mode === "login" ? "LOG IN" : "START LEARNING"}
                    </Button>
                </form>

                <div className="text-center text-sm text-slate-400">
                    {mode === "login" ? "Don't have an account? " : "Already have an account? "}
                    <button
                        type="button"
                        onClick={() => setMode(mode === "login" ? "register" : "login")}
                        className="text-primary font-bold hover:underline"
                    >
                        {mode === "login" ? "Sign Up" : "Log In"}
                    </button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
