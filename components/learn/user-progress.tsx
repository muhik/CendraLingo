import Link from "next/link";
import { Button } from "@/components/ui/button";
import { InfinityIcon, Zap, Heart } from "lucide-react";

interface UserProgressProps {
    hasActiveSubscription: boolean;
    hearts: number;
    points: number;
}

export const UserProgress = ({
    hasActiveSubscription,
    hearts,
    points,
}: UserProgressProps) => {
    return (
        <div className="flex items-center justify-between gap-x-2 w-full">
            <Link href="/shop">
                <Button variant="ghost" className="text-orange-500">
                    <Zap className="h-4 w-4 mr-2 fill-current" />
                    {points}
                </Button>
            </Link>

            <Link href="/shop">
                <Button variant="ghost" className="text-rose-500">
                    <Heart className="h-4 w-4 mr-2 fill-current" />
                    {hearts}
                </Button>
            </Link>
        </div>
    );
};
