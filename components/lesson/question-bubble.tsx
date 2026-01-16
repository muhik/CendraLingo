import Image from "next/image";
import { MessageSquare, Volume2, Turtle } from "lucide-react"; // Turtle icon for slow mode
import { Button } from "@/components/ui/button";
import { useSpeech } from "@/hooks/use-speech";

type Props = {
    question: string;
    audioText?: string;
};

export const QuestionBubble = ({ question, audioText }: Props) => {
    const { speak } = useSpeech();

    const handlePlay = (speed: number) => {
        if (audioText) {
            speak(audioText, "en-US", speed);
        }
    };

    return (
        <div className="flex items-center gap-x-4 mb-6">
            {/* Small Mascot Avatar (Liana) */}
            <div className="hidden lg:block relative w-[100px] h-[100px]">
                <Image
                    src="/liana.png"
                    alt="Liana"
                    fill
                    className="object-contain"
                />
            </div>

            <div className="flex flex-col gap-y-2">
                <div className="relative py-4 px-6 border-2 border-slate-200 text-slate-700 rounded-xl text-lg lg:text-xl font-medium shadow-sm">
                    {question}
                    <div className="absolute -left-3 top-1/2 w-0 h-0 -mt-2 border-r-8 border-r-slate-200 border-y-8 border-y-transparent transform rotate-180" />
                </div>

                {/* Audio Controls */}
                {audioText && (
                    <div className="flex items-center gap-x-2">
                        <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-lg"
                            onClick={() => handlePlay(0.9)}
                        >
                            <Volume2 className="h-5 w-5 text-sky-500" />
                        </Button>

                        <Button
                            variant="secondary"
                            size="sm"
                            className="rounded-lg"
                            onClick={() => handlePlay(0.5)} // Slow Speed
                        >
                            <Turtle className="h-5 w-5 text-sky-500" />
                        </Button>
                    </div>
                )}
            </div>
        </div>
    );
};
