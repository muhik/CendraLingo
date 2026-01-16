"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface MascotHeadsetProps {
    className?: string;
}

export const MascotHeadset = ({ className }: MascotHeadsetProps) => {
    return (
        <div className={cn("relative h-[120px] w-[120px] z-20 hover:scale-110 transition-transform duration-300", className)}>
            {/* High Fidelity Mascot Image - User V3 (Checking blend) */}
            <Image
                src="/mascot_v3.png"
                alt="Cendra with Headphones"
                fill
                className="object-contain" // No drop-shadow to avoid "dirty" look
                priority
            />
        </div>
    );
};
