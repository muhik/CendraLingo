import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

interface UserAvatarProps {
    src?: string;
    className?: string;
}

export const UserAvatar = ({ src, className }: UserAvatarProps) => {
    return (
        <Avatar className={cn("h-10 w-10 border-2 border-slate-200", className)}>
            <AvatarImage src={src} />
            <AvatarFallback className="font-bold">U</AvatarFallback>
        </Avatar>
    );
};
