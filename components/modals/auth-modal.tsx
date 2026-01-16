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
}

export const AuthModal = ({ open, setOpen, onSuccess, preventClose }: AuthModalProps) => {
    const { login, userId, points, hearts } = useUserProgress(); // Get guest progress
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

        // If registering, we now FORCE new account (ignore guest progress per request)
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
                // Auto login with new data
                login({
                    userId: data.userId,
                    userName: data.name,
                    points: 1000,
                    hasActiveSubscription: true,
                    isGuest: false
                });
            } else {
                toast.success("Welcome back!");
                // For existing users, we should ideally fetch their full progress here
                // But for MVP, we just update ID and Name.
                // Sync store will handle the rest on next sync? No, store sync pushes to DB.
                // We might need a `fetchUserProgress` but for now let's set basics.
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

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[425px] bg-[#162f21] border-[#23482f] text-white">
                <DialogHeader>
                    <div className="flex justify-center mb-4">
                        <div className="relative w-[80px] h-[80px]">
                            <Image src="/mascot_headset.png" alt="Mascot" fill className="object-contain" />
                        </div>
                    </div>
                    <DialogTitle className="text-2xl text-center font-bold text-white">
                        {mode === "login" ? "Welcome Back!" : "Create Profile"}
                    </DialogTitle>
                    <DialogDescription className="text-center text-slate-400">
                        {mode === "login"
                            ? "Login to sync your progress."
                            : "Register to get 1 Month Free Premium + 1000 Gems!"}
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

                    {mode === "register" && (
                        <div className="bg-primary/10 border border-primary/20 p-3 rounded-lg flex items-center gap-3 text-xs text-primary font-bold">
                            <CheckCircle className="h-4 w-4" />
                            Includes: No Ads & 1000 Bonus Gems!
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
