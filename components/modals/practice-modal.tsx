"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
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

interface PracticeModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    lessonId: number;
}

export const PracticeModal = ({
    open,
    setOpen,
    lessonId,
}: PracticeModalProps) => {
    const router = useRouter();
    const [isClient, setIsClient] = useState(false);
    const { points, spendPoints } = useUserProgress();
    const PRACTICE_COST = 25;

    useEffect(() => setIsClient(true), []);

    const onPractice = () => {
        if (points >= PRACTICE_COST) {
            spendPoints(PRACTICE_COST);
            setOpen(false);
            router.push(`/lesson?id=${lessonId}&practice=true`);
        } else {
            router.push("/shop"); // Not enough gems
        }
    };

    if (!isClient) return null;

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <div className="flex items-center w-full justify-center mb-5">
                        <Image
                            src="/mascot_pro.png" // Use existing mascot
                            // Or heart icon
                            alt="Practice"
                            height={100}
                            width={100}
                        />
                    </div>
                    <DialogTitle className="text-center font-bold text-2xl">
                        Latihan Ulang?
                    </DialogTitle>
                    <DialogDescription className="text-center text-base">
                        Gunakan {PRACTICE_COST} Gems untuk mengulang pelajaran ini.
                        Kamu tidak akan mendapatkan Gems tambahan dari sesi latihan.
                    </DialogDescription>
                </DialogHeader>
                <DialogFooter className="mb-4">
                    <div className="flex flex-col gap-y-4 w-full">
                        <Button
                            variant="primary"
                            className="w-full text-lg font-bold"
                            size="lg"
                            onClick={onPractice}
                            disabled={points < PRACTICE_COST}
                        >
                            Mulai Latihan (-25 Gems)
                        </Button>
                        <Button
                            variant="outline"
                            className="w-full"
                            size="lg"
                            onClick={() => setOpen(false)}
                        >
                            Batal
                        </Button>
                    </div>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
