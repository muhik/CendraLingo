"use client";

// Optional utilities removed to fix missing dependency
// import { useKey, useWindowSize } from "react-use";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { CheckCircle, XCircle } from "lucide-react";

interface FooterProps {
    onCheck: () => void;
    status: "none" | "correct" | "wrong" | "completed";
    disabled?: boolean;
    lessonId?: number;
}

export const Footer = ({ onCheck, status, disabled, lessonId }: FooterProps) => {
    return (
        <footer className={cn(
            "lg:-h[140px] h-[100px] border-t-2",
            status === "correct" && "border-transparent bg-green-100",
            status === "wrong" && "border-transparent bg-rose-100",
        )}>
            <div className="max-w-[1140px] h-full mx-auto flex items-center justify-between px-6 lg:px-10">

                {status === "correct" && (
                    <div className="text-green-500 font-bold text-2xl flex items-center">
                        <CheckCircle className="h-10 w-10 mr-4" />
                        Nicely done!
                    </div>
                )}

                {status === "wrong" && (
                    <div className="text-rose-500 font-bold text-2xl flex items-center">
                        <XCircle className="h-10 w-10 mr-4" />
                        Incorrect.
                    </div>
                )}

                {status === "completed" && (
                    <Button variant="default" size="lg" onClick={() => window.location.href = "/learn"}>
                        Continue
                    </Button>
                )}

                <Button
                    disabled={disabled}
                    className="ml-auto"
                    onClick={onCheck}
                    size={isMobile ? "sm" : "lg"}
                    variant={status === "wrong" ? "danger" : "secondary"}
                >
                    {status === "none" && "CHECK"}
                    {status === "correct" && "CONTINUE"}
                    {status === "wrong" && "CONTINUE"}
                    {status === "completed" && "CONTINUE"}
                </Button>
            </div>
        </footer>
    );
};

// Simple mobile check helper
const isMobile = false; // Placeholder, better to use CSS media queries in className
