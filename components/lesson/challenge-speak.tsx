"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Mic, Volume2, Loader2, RotateCcw } from "lucide-react";
import { cn } from "@/lib/utils";
import Image from "next/image";
import { useSpeech } from "@/hooks/use-speech";

interface ChallengeSpeakProps {
    question: string;
    audioQuestion?: string;
    correctSentence: string;
    characterImage?: string;
    characterVideo?: string; // New Prop for animation video (webm/mp4)
    onStatusChange: (status: "none" | "correct" | "wrong") => void;
    onRetry?: () => void; // Allow parent to reset
}

export const ChallengeSpeak = ({
    question,
    audioQuestion,
    correctSentence,
    characterImage,
    characterVideo,
    onStatusChange,
    onRetry
}: ChallengeSpeakProps) => {
    const [isListening, setIsListening] = useState(false);
    const [isTalking, setIsTalking] = useState(false); // Character talking state
    const [transcript, setTranscript] = useState("");
    const [feedback, setFeedback] = useState<"none" | "listening" | "processing" | "correct" | "wrong">("none");
    const [recognition, setRecognition] = useState<any>(null);
    const { speak } = useSpeech();

    // Initialize Speech Recognition
    useEffect(() => {
        if (typeof window !== "undefined") {
            // @ts-ignore
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (SpeechRecognition) {
                const recognitionInstance = new SpeechRecognition();
                recognitionInstance.continuous = false;
                recognitionInstance.lang = "en-US";
                recognitionInstance.interimResults = true;
                recognitionInstance.maxAlternatives = 1;

                recognitionInstance.onstart = () => {
                    setIsListening(true);
                    setFeedback("listening");
                    setTranscript("");
                };

                recognitionInstance.onresult = (event: any) => {
                    const current = event.resultIndex;
                    const resultTranscript = event.results[current][0].transcript;
                    setTranscript(resultTranscript);
                };

                recognitionInstance.onerror = (event: any) => {
                    console.error("Speech recognition error", event.error);
                    setIsListening(false);
                    setFeedback("none");
                };

                recognitionInstance.onend = () => {
                    setIsListening(false);
                    // We'll handle validation manually after a short pause or via effect if needed,
                    // but usually onend is safe to trigger validation if we have a transcript.
                    // However, let's trigger validation separately to ensure we captured everything.
                };

                setRecognition(recognitionInstance);
            } else {
                console.warn("Browser does not support Speech Recognition");
            }
        }
    }, []);

    // Validate Transcript when listening stops
    useEffect(() => {
        if (!isListening && transcript && feedback === "listening") {
            validateSpeech(transcript);
        }
    }, [isListening, transcript, feedback]);

    const validateSpeech = (spokenText: string) => {
        setFeedback("processing");

        // Simple normalization
        const normalize = (str: string) => str.toLowerCase().replace(/[.,!?]/g, "").trim();
        const spoken = normalize(spokenText);
        const target = normalize(correctSentence);

        // Fuzzy match logic (simplified: check if target words are significantly present)
        // For exact match requirement (Duolingo style usually is lenient)

        // Let's use exact match for now but allow case insensitivity
        if (spoken === target || spoken.includes(target)) {
            setFeedback("correct");
            onStatusChange("correct");
        } else {
            setFeedback("wrong");
            onStatusChange("wrong");
        }
    };

    const toggleListening = () => {
        if (feedback === "correct") return; // Already done

        if (isListening) {
            recognition?.stop();
        } else {
            // Reset state
            setTranscript("");
            setFeedback("none");
            onStatusChange("none");
            recognition?.start();
        }
    };

    const playAudio = () => {
        if (audioQuestion) {
            setIsTalking(true);
            speak(audioQuestion, "en-US");
            // Simple timeout to stop talking animation after approx duration
            setTimeout(() => setIsTalking(false), 2000);
        }
    };

    // Auto-play audio on mount
    useEffect(() => {
        playAudio();
    }, []);

    return (
        <div className="flex flex-col items-center justify-center w-full max-w-2xl mx-auto gap-8">
            {/* Character Animation Area */}
            {/* Karaoke Text Area (Replaces Character) */}
            <div className="h-40 flex items-center justify-center">
                {isTalking ? (
                    <div className="flex flex-wrap justify-center gap-2 px-4 transition-all duration-300">
                        {audioQuestion?.split(" ").map((word, index) => (
                            <span
                                key={index}
                                className="text-4xl font-bold transition-all duration-300 animate-in fade-in slide-in-from-bottom-2"
                                style={{
                                    animationDelay: `${index * 300}ms`,
                                    color: `hsl(${200 + index * 30}, 90%, 60%)` // Dynamic playful colors
                                }}
                            >
                                {word}
                            </span>
                        ))}
                    </div>
                ) : (
                    <div className="text-4xl font-bold text-slate-300 animate-pulse">
                        ...
                    </div>
                )}
            </div>

            {/* Question Text & Audio Removed - Handled by QuestionBubble (Cendra) */}

            {/* Microphone Button Area */}
            <div className="flex flex-col items-center gap-4 mt-8 w-full">

                {/* Live Transcript Feedback */}
                <div className={cn(
                    "min-h-[60px] w-full p-4 rounded-xl border-2 text-center text-lg font-medium transition-colors",
                    feedback === "listening" && "border-sky-300 bg-sky-50 text-sky-700",
                    feedback === "correct" && "border-green-500 bg-green-50 text-green-700",
                    feedback === "wrong" && "border-rose-500 bg-rose-50 text-rose-700",
                    feedback === "none" && "border-transparent text-slate-400"
                )}>
                    {transcript || (isListening ? "..." : "Ketuk mic untuk mulai bicara")}
                </div>

                <Button

                    className={cn(
                        "h-24 w-24 rounded-full shadow-xl transition-all duration-300 border-b-8 active:border-b-0 active:translate-y-2",
                        isListening
                            ? "bg-red-500 hover:bg-red-600 border-red-700 animate-pulse ring-4 ring-red-200"
                            : feedback === "correct"
                                ? "bg-green-500 hover:bg-green-600 border-green-700"
                                : "bg-sky-500 hover:bg-sky-600 border-sky-700"
                    )}
                    onClick={toggleListening}
                    disabled={feedback === "correct"}
                >
                    {isListening ? (
                        <div className="flex gap-1 items-end h-8">
                            <div className="w-1 bg-white h-3 animate-bounce" style={{ animationDelay: '0ms' }} />
                            <div className="w-1 bg-white h-6 animate-bounce" style={{ animationDelay: '100ms' }} />
                            <div className="w-1 bg-white h-4 animate-bounce" style={{ animationDelay: '200ms' }} />
                        </div>
                    ) : (
                        <Mic className="h-10 w-10 text-white" />
                    )}
                </Button>

                {feedback === "wrong" && (
                    <p className="text-rose-500 font-bold animate-shake">
                        Kurang tepat. Coba lagi!
                    </p>
                )}
            </div>
        </div>
    );
}
