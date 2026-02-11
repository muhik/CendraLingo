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
import { useState, useEffect } from "react";
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

        // Include guestId and progress when guest is registering
        const { isGuest } = useUserProgress.getState();
        const payload = mode === "register" && isGuest
            ? { ...formData, guestId: userId, guestPoints: points, guestHearts: hearts }
            : formData;

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
                    isGuest: false
                });

                // FETCH REAL DATA FROM SERVER IMMEDIATELY
                // We use a small timeout to ensure the DB write has propagated if using eventually consistent DBs (good practice)
                setTimeout(() => {
                    useUserProgress.getState().refreshUserData();
                }, 100);

                // Track Registration
                // @ts-ignore
                import("@/components/analytics/facebook-pixel").then(({ trackPixelEvent }) => {
                    trackPixelEvent("CompleteRegistration", { value: 0, currency: "USD" });
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

    // Inject Google Script
    const loadGoogleScript = () => {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
            initializeGoogle();
        };
        document.body.appendChild(script);
    };

    const initializeGoogle = () => {
        if (!window.google) return;

        window.google.accounts.id.initialize({
            client_id: "378278493006-9t7lsnqep353agi08r1jjo1femaohbjs.apps.googleusercontent.com",
            callback: handleGoogleResponse
        });

        window.google.accounts.id.renderButton(
            document.getElementById("googleButton"),
            { theme: "outline", size: "large", width: "100%", text: mode === "login" ? "signin_with" : "signup_with" }
        );
    };

    const handleGoogleResponse = async (response: any) => {
        setIsLoading(true);
        try {
            const res = await fetch("/api/auth/google", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ token: response.credential, guestId: useUserProgress.getState().isGuest ? useUserProgress.getState().userId : null })
            });

            const data = await res.json();

            if (!res.ok) {
                toast.error(data.message || "Google Login failed");
                return;
            }

            toast.success("Login Successful via Google!");
            login({
                userId: data.userId,
                userName: data.name,
                isGuest: false
            });

            setTimeout(() => {
                useUserProgress.getState().refreshUserData();
            }, 100);

            setOpen(false);
            onSuccess();

        } catch (error) {
            console.error(error);
            toast.error("Google Login Error");
        } finally {
            setIsLoading(false);
        }
    };

    // Load script on mount
    // Load script on mount
    useEffect(() => {
        if (open) {
            if (window.google) {
                initializeGoogle();
            } else {
                loadGoogleScript();
            }
        }
    }, [open, mode]);

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

                <div className="py-4 flex flex-col gap-4">
                    {/* GOOGLE BUTTON */}
                    <div id="googleButton" className="w-full min-h-[40px]"></div>

                    <div className="flex items-center gap-2">
                        <div className="h-[1px] bg-slate-700 flex-1"></div>
                        <span className="text-xs text-slate-500 font-bold">OR</span>
                        <div className="h-[1px] bg-slate-700 flex-1"></div>
                    </div>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {mode === "register" && (
                            <div className="space-y-2">
                                <Label htmlFor="name">Nickname</Label>
                                <Input
                                    id="name"
                                    name="name"
                                    placeholder="Your Nickname"
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
                            {mode === "login" ? "LOG IN" : "START GAME"}
                        </Button>
                    </form>
                </div>

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
