"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useUserProgress } from "@/store/use-user-progress";

interface HeartsModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

export const HeartsModal = ({
    open,
    setOpen,
}: HeartsModalProps) => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const { points, spendPoints, refillHearts } = useUserProgress();

    useEffect(() => setIsClient(true), []);

    const onRefill = () => {
        if (points >= 200) {
            spendPoints(200);
            refillHearts();
            setOpen(false);
        } else {
            router.push("/shop");
        }
    };

    const onQuit = () => {
        router.push("/learn");
    };

    if (!isClient) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center w-full justify-center mb-5">
                        <Image
                            src="/mascot_pro.png"
                            alt="Mascot Sad"
                            height={80}
                            width={80}
                        />
                    </div>
                    <DialogTitle className="text-center font-bold text-2xl">
                        Yah, Nyawamu Habis!
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        Jangan menyerah! Isi ulang nyawa untuk melanjutkan pelajaran ini.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mb-4">
                    <div className="flex flex-col gap-y-4 w-full">
                        <Button
                            variant="primary"
                            className="w-full text-lg font-bold"
                            size="lg"
                            onClick={onRefill}
                            disabled={points < 200}
                        >
                            Isi Ulang (200 Gems)
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            size="lg"
                            onClick={onQuit}
                        >
                            Akhiri Sesi
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
