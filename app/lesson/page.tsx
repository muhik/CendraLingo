"use client";
// Force Refresh Mechanism


import { useState, useEffect, useRef, Suspense } from "react";
import { Header } from "@/components/lesson/header";
import { QuestionBubble } from "@/components/lesson/question-bubble";
import { Footer } from "@/components/lesson/footer";
import { useSounds } from "@/hooks/use-sounds";
import { useSpeech } from "@/hooks/use-speech";
import { Zap, Trophy, Clock, Target, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WordCard } from "@/components/lesson/word-card";
import { useUserProgress } from "@/store/use-user-progress";
import { useSearchParams, useRouter } from "next/navigation";
import { curriculumData } from "@/data/curriculum";
import { mathCurriculumData } from "@/data/math-curriculum"; // Import Math Data
import Image from "next/image";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { ChallengeMatch } from "@/components/lesson/challenge-match";
import { Volume2, Lightbulb, Gem } from "lucide-react";
import { HeartsModal } from "@/components/modals/hearts-modal";
import { StreakAnimation } from "@/components/lesson/streak-animation";
import { CorrectFlashAnimation } from "@/components/lesson/correct-flash";
import { ChallengeSpeak } from "@/components/lesson/challenge-speak";
import { AuthModal } from "@/components/modals/auth-modal"; // Import AuthModal
import { trackPixelEvent } from "@/components/analytics/facebook-pixel";

function LessonContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const lessonId = Number(searchParams.get("id")) || 1; // Default to 1 if no ID
    const courseType = searchParams.get("course") || "english"; // Default to english

    const [activeIndex, setActiveIndex] = useState(0);
    const [completed, setCompleted] = useState(false);
    const [status, setStatus] = useState<"none" | "correct" | "wrong">("none");

    const [startTime] = useState(Date.now());

    // Track ViewContent on Mount & Trigger Start Ad
    useEffect(() => {
        trackPixelEvent("ViewContent", { content_name: `Lesson ${lessonId}`, content_ids: [lessonId], content_type: 'product' });

        // Trigger Interstitial Ad (80% chance via AdManager)
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new Event('lesson_start'));
        }
    }, [lessonId]);
    const [endTime, setEndTime] = useState(Date.now());
    const [correctCount, setCorrectCount] = useState(0);
    const [wrongCount, setWrongCount] = useState(0);
    const [consecutiveMistakes, setConsecutiveMistakes] = useState(0); // Track repeats
    const [hintActive, setHintActive] = useState(false); // Has hint been used?
    const [showHeartsModal, setShowHeartsModal] = useState(false);
    const [showAuthModal, setShowAuthModal] = useState(false); // For Forced Register

    // Streak Animation State
    const [consecutiveCorrect, setConsecutiveCorrect] = useState(0);
    const [showStreakAnim, setShowStreakAnim] = useState(false);
    const [showCorrectFlash, setShowCorrectFlash] = useState(false);

    // Get Challenges from Curriculum Data based on ID AND course type
    // Select the correct curriculum based on course parameter
    const selectedCurriculum = courseType === "math" ? mathCurriculumData : curriculumData;
    const currentLesson = selectedCurriculum.flatMap(u => u.lessons).find(l => l.id === lessonId);
    const initialChallenges = currentLesson?.challenges || [];

    // State to hold the dynamic queue of challenges (Duolingo Style: Wrong -> Append to end)
    const [challenges, setChallenges] = useState(initialChallenges);

    // Safety check if data load fails initially
    useEffect(() => {
        if (initialChallenges && challenges.length === 0) {
            setChallenges(initialChallenges);
        }
    }, [initialChallenges]);

    const {
        hearts,
        points,
        addPoints,
        decreasePoints,
        completeLesson,
        reduceHeart,
        isGuest,
        isCourseCompleted,
        completeCourse
    } = useUserProgress();

    // Calc Is Last Lesson for UI
    const unit = selectedCurriculum.find(u => u.id === currentLesson?.unitId);
    const isLastLesson = unit && unit.lessons[unit.lessons.length - 1].id === lessonId;

    // CHECK IF COURSE COMPLETED (Last Unit, Last Lesson)
    const lastUnit = curriculumData[curriculumData.length - 1];
    const lastLessonOfCourse = lastUnit.lessons[lastUnit.lessons.length - 1];
    const isCourseFinished = lastLessonOfCourse.id === lessonId;

    // AUTO NOTIFICATION TRIGGER & REDIRECT
    // AUTO NOTIFICATION TRIGGER & REDIRECT
    useEffect(() => {
        if (isGuest) return; // NEVER AUTO REDIRECT GUESTS

        if (completed && isCourseFinished && !isCourseCompleted) {
            completeCourse(); // Fire and forget notification

            // Redirect to /learn after short delay
            setTimeout(() => {
                toast.success("Laporan Terkirim! Kembali ke Peta...");
                router.push("/learn");
            }, 2000);
        } else if (completed && isCourseFinished && isCourseCompleted) {
            // If already completed (replay), still redirect
            setTimeout(() => {
                router.push("/learn");
            }, 2000);
        }
    }, [completed, isCourseFinished, isCourseCompleted, completeCourse, router, isGuest]);



    // SELECT State
    const [selectedOption, setSelectedOption] = useState<number | null>(null);

    // ASSIST State
    const [selectedWords, setSelectedWords] = useState<string[]>([]);
    const [availableWords, setAvailableWords] = useState<string[]>([]);

    const { playCorrectSound, playWrongSound } = useSounds();
    const { speak } = useSpeech();

    const activeChallenge = challenges[activeIndex];

    // Calculate progress (Restored)
    const progressPercentage = challenges.length > 0 ? (activeIndex / challenges.length) * 100 : 0;



    useEffect(() => {
        // Reset state on new challenge
        if (!activeChallenge) return;

        setSelectedOption(null);
        setSelectedWords([]);
        setStatus("none");
        if ((activeChallenge?.type === "ASSIST" || activeChallenge?.type === "LISTEN") && activeChallenge.initialWords) {
            setAvailableWords(activeChallenge.initialWords);
        }

        if (activeChallenge?.audioQuestion && !completed) {
            speak(activeChallenge.audioQuestion, "en-US");
        }
    }, [activeIndex, activeChallenge, completed, speak]);

    const formatTime = (ms: number) => {
        const seconds = Math.floor(ms / 1000);
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const onCheck = () => {
        if (hearts === 0) {
            setShowHeartsModal(true);
            return;
        }

        if (status === "correct" || status === "wrong") {
            // Check for Game Over before moving to next
            if (hearts === 0) {
                setShowHeartsModal(true);
                return;
            }

            // Move to next
            if (activeIndex === challenges.length - 1) {
                setEndTime(Date.now());
                setCompleted(true);

                // CHECK IF THIS IS FINAL LESSON IN UNIT
                const unit = selectedCurriculum.find(u => u.id === currentLesson?.unitId);
                const isLastLesson = unit && unit.lessons[unit.lessons.length - 1].id === lessonId;

                // ACCURACY-BASED REWARDS (Combined Model)
                const timeTaken = Date.now() - startTime; // milliseconds
                const totalAttempts = correctCount + wrongCount;

                // Base reward depends on lesson type
                const baseReward = isLastLesson ? 25 : 10;

                // Accuracy Bonus: 0-15 gems (fewer mistakes = more bonus)
                const accuracyBonus = wrongCount === 0 ? 15 : Math.max(0, 15 - (wrongCount * 3));

                // Speed Bonus: 0-5 gems (under 2 minutes = bonus)
                const speedBonus = timeTaken < 120000 ? 5 : 0;

                // Calculate total
                const totalReward = baseReward + accuracyBonus + speedBonus;

                addPoints(totalReward); // Award Gems
                completeLesson(lessonId);
                playCorrectSound();

                // Track Lead (Lesson Completed)
                trackPixelEvent("Lead", { content_name: `Lesson ${lessonId}`, value: totalReward, currency: 'GEM' });

                // Trigger Ad (Sporadic System)
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new Event('lesson_complete'));
                }

                return;
            }
            setActiveIndex(prev => prev + 1);
            setHintActive(false); // Reset hint
            return;
        }

        let isCorrect = false;

        if (activeChallenge.type === "SELECT") {
            const selected = activeChallenge.options?.find(o => o.id === selectedOption);
            isCorrect = !!selected?.correct;
        }

        if (activeChallenge.type === "ASSIST" || activeChallenge.type === "LISTEN") {
            const sentence = selectedWords.join(" ");
            isCorrect = sentence === activeChallenge.correctSentence;
        }

        if (isCorrect) {
            setStatus("correct");
            setCorrectCount(prev => prev + 1);
            setConsecutiveMistakes(0); // Reset series on correct answer

            // STREAK LOGIC
            const newStreak = consecutiveCorrect + 1;
            setConsecutiveCorrect(newStreak);

            // Trigger Animation on 5x (and maybe 10x?)
            if (newStreak === 5) {
                setShowStreakAnim(true);
                playCorrectSound(); // Extra sound or handled by component
            }

            // Trigger Flash Animation
            setShowCorrectFlash(true);

            playCorrectSound();
            speak("Correct!", "en-US");
        } else {
            setStatus("wrong");
            setWrongCount(prev => prev + 1);
            setConsecutiveCorrect(0); // Reset streak
            reduceHeart(); // Deduct heart
            decreasePoints(2); // Deduct 2 Gems penalty
            toast.error("-2 Gems! 💸", { position: "top-center" });
            playWrongSound();
            speak("Wrong!", "en-US");

            // DUOLINGO MECHANIC: Push Wrong Answer to End of Queue
            setChallenges((prev) => [...prev, { ...activeChallenge, id: activeChallenge.id + 10000 }]); // Add cloned challenge with new ID to force re-render if needed
            setConsecutiveMistakes(prev => prev + 1); // Increment mistake series
        }
    };

    const onHint = () => {
        if (hearts === 0) return;
        decreasePoints(5); // Big Penalty for Hint
        setHintActive(true);
        speak("Let me help you!", "en-US");

        // HINT LOGIC:
        if (activeChallenge.type === "SELECT") {
            const correctOpt = activeChallenge.options?.find(o => o.correct);
            if (correctOpt) setSelectedOption(correctOpt.id);
        }
        if ((activeChallenge.type === "ASSIST" || activeChallenge.type === "LISTEN") && activeChallenge.correctSentence) {
            // Auto-fill the sentence
            setSelectedWords(activeChallenge.correctSentence.split(" "));
        }
    };

    // Handler for SELECT
    const handleOptionClick = (option: any) => {
        if (status !== "none") return;
        setSelectedOption(option.id);
        speak(option.audio || option.text, option.text.match(/[a-zA-Z]/) ? "id-ID" : "en-US");
    };

    // Handler for ASSIST (Bank -> Line)
    const handleWordSelect = (word: string) => {
        if (status !== "none") return;
        if (!selectedWords.includes(word)) {
            setSelectedWords([...selectedWords, word]);
            speak(word, "id-ID");
        }
    };

    // Handler for ASSIST (Line -> Bank)
    const handleWordRemove = (word: string) => {
        if (status !== "none") return;
        setSelectedWords(selectedWords.filter(w => w !== word));
    };

    // Loading or Error State if invalid ID
    if (!currentLesson) {
        return <div className="p-10 text-center">Lesson not found!</div>;
    }

    if (completed) {
        const timeTaken = endTime - startTime;
        const totalAttempts = correctCount + wrongCount;
        const accuracy = totalAttempts > 0 ? Math.round((correctCount / totalAttempts) * 100) : 0;

        // Recalculate rewards for display (using top-scope isLastLesson)
        const baseReward = isLastLesson ? 25 : 10;
        const accuracyBonus = wrongCount === 0 ? 15 : Math.max(0, 15 - (wrongCount * 3));
        const speedBonus = timeTaken < 120000 ? 5 : 0;
        const totalEarned = baseReward + accuracyBonus + speedBonus;

        return (
            <div className="flex flex-col h-screen items-center justify-center p-6 bg-white animate-in fade-in duration-500">
                {/* AuthModal for Guest Registration - MUST be here since completion screen has early return */}
                <AuthModal
                    open={showAuthModal}
                    setOpen={setShowAuthModal}
                    onSuccess={() => router.push("/learn")}
                    preventClose={isGuest}
                />

                <div className="flex-1 flex flex-col items-center justify-center w-full max-w-sm gap-y-8">

                    {/* Mascot Image */}
                    <div className="relative w-48 h-48 animate-bounce-slow">
                        {/* New Cendra Head Icon */}
                        <Image
                            src="/mascot_head.png"
                            alt="Cendra Head"
                            fill
                            className="object-contain"
                        />
                    </div>

                    <h1 className={cn("text-2xl font-black mb-2 uppercase text-center", isCourseFinished ? "text-purple-600" : isLastLesson ? "text-amber-500" : "text-green-500")}>
                        {isCourseFinished ? "Sempurna! Tamat! 🏆" : isLastLesson ? "Harta Karun Diklaim!" : "Pelajaran Selesai!"}
                    </h1>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-3 gap-4 w-full">
                        {/* Gem Block (Total Earned) */}
                        <div className={cn("rounded-xl p-3 flex flex-col items-center justify-center text-white shadow-lg border-b-4",
                            isLastLesson ? "bg-amber-400 border-amber-600" : "bg-sky-400 border-sky-600"
                        )}>
                            <span className="text-[10px] font-bold uppercase mb-1 opacity-90 text-center leading-tight">
                                {isLastLesson ? "Treasure" : "Gems Earned"}
                            </span>
                            <div className="flex items-center gap-1">
                                <Gem className="h-6 w-6 text-white" />
                                <span className="text-2xl font-black">
                                    +{totalEarned}
                                </span>
                            </div>
                        </div>

                        {/* Accuracy Block */}
                        <div className="bg-green-500 rounded-xl p-3 flex flex-col items-center justify-center text-white shadow-lg border-b-4 border-green-700">
                            <span className="text-xs font-bold uppercase mb-1 opacity-90">Akurasi</span>
                            <div className="flex items-center gap-1">
                                <Target className="h-6 w-6" />
                                <span className="text-2xl font-black">{accuracy}%</span>
                            </div>
                        </div>

                        {/* Time Block */}
                        <div className="bg-sky-400 rounded-xl p-3 flex flex-col items-center justify-center text-white shadow-lg border-b-4 border-sky-600">
                            <span className="text-xs font-bold uppercase mb-1 opacity-90">Cepat</span>
                            <div className="flex items-center gap-1">
                                <Clock className="h-6 w-6" />
                                <span className="text-xl font-black">{formatTime(timeTaken)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Gem Breakdown */}
                    <div className="w-full bg-slate-50 rounded-xl p-4 border-2 border-slate-200">
                        <div className="text-xs font-bold text-slate-500 uppercase mb-2 text-center">Reward Breakdown</div>
                        <div className="space-y-1 text-sm">
                            <div className="flex justify-between text-slate-600">
                                <span>Base Reward:</span>
                                <span className="font-bold">+{baseReward} 💎</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Accuracy Bonus ({wrongCount} mistakes):</span>
                                <span className="font-bold text-green-600">+{accuracyBonus} 💎</span>
                            </div>
                            <div className="flex justify-between text-slate-600">
                                <span>Speed Bonus ({timeTaken < 120000 ? "⚡" : "🐢"}):</span>
                                <span className="font-bold text-blue-600">+{speedBonus} 💎</span>
                            </div>
                            <div className="border-t-2 border-slate-300 my-2"></div>
                            <div className="flex justify-between text-slate-800 font-black text-base">
                                <span>Total:</span>
                                <span className="text-amber-600">+{totalEarned} 💎</span>
                            </div>
                        </div>
                    </div>

                    {/* MANAGER NOTIFICATION LOGIC (AUTO & REDIRECT) - ONLY FOR REGISTERED USERS */}
                    {isCourseFinished && !isGuest && (
                        <div className="w-full max-w-sm mt-8 border-t-2 border-slate-100 pt-8 animate-in fade-in zoom-in duration-500 delay-300">
                            <div className="flex flex-col items-center gap-4">
                                <div className="bg-slate-100 p-6 rounded-2xl border-2 border-slate-200 w-full text-center shadow-sm">
                                    <Loader2 className="h-10 w-10 text-purple-500 animate-spin mx-auto mb-4" />
                                    <h3 className="text-lg font-bold text-slate-700 mb-2">Laporan Terkirim! 🚀</h3>
                                    <p className="text-sm text-slate-500 leading-relaxed">
                                        Mengarahkanmu kembali ke Peta Belajar...
                                    </p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* MANUAL BUTTON FLOW (GUEST OR NOT FINISHED) */}
                    {(isGuest || !isCourseFinished) && (
                        <div className="w-full max-w-sm mt-8 border-t-2 border-slate-100 pt-8">
                            <Button
                                size="lg"
                                className="w-full font-bold text-lg h-12 uppercase tracking-wide"
                                onClick={() => {
                                    if (isGuest) {
                                        setShowAuthModal(true);
                                    } else {
                                        router.push("/learn");
                                    }
                                }}
                            >
                                {isGuest ? "Buat Akun untuk Simpan Progress" : "Lanjutkan"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        );
    }
    return (
        <div className="flex flex-col h-screen overflow-hidden">
            <AuthModal open={showAuthModal} setOpen={setShowAuthModal} onSuccess={() => router.push("/learn")} preventClose={isGuest} />
            <HeartsModal open={showHeartsModal} setOpen={setShowHeartsModal} />
            <StreakAnimation open={showStreakAnim} onClose={() => setShowStreakAnim(false)} />
            <CorrectFlashAnimation show={showCorrectFlash} onComplete={() => setShowCorrectFlash(false)} />
            <Header hearts={hearts} percentage={progressPercentage} hasActiveSubscription={false} points={points} />

            <div className="flex-1 flex flex-col items-center justify-center p-5 lg:p-10">
                <div className="w-full max-w-[800px]">
                    <div className="flex flex-col items-center mb-8">
                        {/* STORY CONTEXT HUB (Duolingo Dialogue) - Hide for SPEAK because it has its own UI */}
                        {/* STORY CONTEXT HUB (Duolingo Dialogue) */}
                        {activeChallenge.storyContext && activeChallenge.type !== "SPEAK" && (
                            <div className="w-full max-w-lg mb-8 space-y-4">
                                {/* If Multi-turn Dialogue exists */}
                                {activeChallenge.storyContext.dialogue ? (
                                    <div className="flex flex-col gap-4 border-2 border-slate-200 p-4 rounded-xl bg-slate-50">
                                        <div className="text-center text-sm font-bold text-slate-400 uppercase mb-2">Conversation</div>
                                        {activeChallenge.storyContext.dialogue.map((line, idx) => (
                                            <div key={idx} className={cn("flex items-end gap-3", line.side === "right" ? "flex-row-reverse" : "flex-row")}>
                                                <Image
                                                    src={line.image || activeChallenge.storyContext?.image || "/mascot_head.png"}
                                                    width={45}
                                                    height={45}
                                                    alt={line.speaker}
                                                    className="rounded-full bg-white border-2 border-slate-100"
                                                />
                                                <div className={cn(
                                                    "p-3 rounded-2xl max-w-[80%] text-lg border-2 relative",
                                                    line.side === "right"
                                                        ? "bg-sky-100 border-sky-200 rounded-br-none text-sky-800"
                                                        : "bg-white border-slate-200 rounded-bl-none text-slate-700"
                                                )}>
                                                    {line.text}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    // Fallback: Single Bubble (Existing)
                                    <div className="flex items-start gap-4 border-2 border-slate-200 p-4 rounded-xl bg-slate-50">
                                        <Image
                                            src={activeChallenge.storyContext.image}
                                            width={60}
                                            height={60}
                                            alt="Character"
                                            className="rounded-full bg-white border-2 border-slate-100"
                                        />
                                        <div className="flex flex-col flex-1">
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-bold text-slate-700">{activeChallenge.storyContext.speaker}</span>
                                                {/* HINT BUTTON */}
                                                {consecutiveMistakes >= 3 && !hintActive && (
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={onHint}
                                                        className="ml-auto border-yellow-400 text-yellow-600 hover:bg-yellow-50 animate-pulse"
                                                    >
                                                        <Lightbulb className="w-4 h-4 mr-1 fill-yellow-400" />
                                                        Bantuan
                                                    </Button>
                                                )}
                                            </div>
                                            <div className="bg-white p-3 rounded-xl border-2 border-slate-200 text-lg relative bubble-left">
                                                "{activeChallenge.storyContext.text}"
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* GLOBAL HINT BUTTON (If no Story Context, show floating or near question) */}
                        {!activeChallenge.storyContext && consecutiveMistakes >= 3 && !hintActive && (
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={onHint}
                                className="mb-4 border-yellow-400 text-yellow-600 hover:bg-yellow-50 animate-pulse shadow-md bg-yellow-50/50"
                            >
                                <Lightbulb className="w-4 h-4 mr-1 fill-yellow-400" />
                                Gunakan Lampu (-5 Gems)
                            </Button>
                        )}

                        {/* LISTEN CHALLENGE - Big Audio Button instead of text */}
                        {activeChallenge.type === "LISTEN" ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="text-xl font-bold text-slate-700 mb-4">{activeChallenge.question}</div>
                                <Button
                                    size="lg"
                                    variant="secondary"
                                    className="h-32 w-32 rounded-3xl animate-pulse ring-4 ring-sky-100"
                                    onClick={() => activeChallenge.audioQuestion && speak(activeChallenge.audioQuestion, "en-US")}
                                >
                                    <Volume2 className="h-16 w-16 text-sky-500" />
                                </Button>
                                <div className="text-slate-400 text-sm font-bold uppercase mt-2">Ketuk untuk mendengar</div>
                            </div>
                        ) : null}

                        {/* STANDARD QUESTION BUBBLE (Avoid for MATCH/LISTEN) */}
                        {activeChallenge.type !== "MATCH" && activeChallenge.type !== "LISTEN" && (
                            <QuestionBubble
                                question={activeChallenge.question}
                                audioText={activeChallenge.audioQuestion}
                            />
                        )}

                        {/* MATCH CHALLENGE HEADER */}
                        {activeChallenge.type === "MATCH" && (
                            <div className="text-2xl font-bold text-slate-700 mb-6 text-center">
                                {activeChallenge.question}
                            </div>
                        )}
                    </div>

                    {/* TYPE: SELECT */}
                    {activeChallenge.type === "SELECT" && activeChallenge.options && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {activeChallenge.options.map((option) => (
                                <div
                                    key={option.id}
                                    onClick={() => handleOptionClick(option)}
                                    className={`
                            p-6 rounded-xl border-2 border-b-4 cursor-pointer text-center text-xl font-bold transition-all
                            ${selectedOption === option.id
                                            ? "bg-sky-100 border-sky-300 text-sky-500"
                                            : "bg-white border-slate-200 hover:bg-slate-50"}
                            ${status === "correct" && option.correct && "bg-green-100 border-green-500 text-green-600"}
                            ${status === "wrong" && selectedOption === option.id && !option.correct && "bg-rose-100 border-rose-500 text-rose-500"}
                          `}
                                >
                                    {option.text}
                                </div>
                            ))}
                        </div>
                    )}

                    {/* TYPE: ASSIST (Sentence Builder) */}
                    {activeChallenge.type === "ASSIST" && (
                        <div className="flex flex-col gap-y-4">
                            {/* Sentence Line */}
                            <div className="min-h-[60px] p-4 bg-slate-100 rounded-xl flex flex-wrap gap-2 border-2 border-slate-200">
                                {selectedWords.map((word, idx) => (
                                    <Button
                                        key={idx}
                                        variant="secondary"
                                        className="h-14 px-6 text-lg border-b-4"
                                        onClick={() => handleWordRemove(word)}
                                    >
                                        {word}
                                    </Button>
                                ))}
                            </div>

                            {/* Word Bank */}
                            <div className="flex flex-wrap gap-2 justify-center mt-10">
                                {availableWords.map((word, idx) => {
                                    const isUsed = selectedWords.includes(word);
                                    return (
                                        <WordCard
                                            key={idx}
                                            text={word}
                                            active={isUsed}
                                            onClick={() => !isUsed && handleWordSelect(word)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TYPE: LISTEN (Same as ASSIST but audio focused) */}
                    {activeChallenge.type === "LISTEN" && (
                        <div className="flex flex-col gap-y-4">
                            <div className="min-h-[60px] p-4 bg-slate-100 rounded-xl flex flex-wrap gap-2 border-2 border-slate-200">
                                {selectedWords.map((word, idx) => (
                                    <Button
                                        key={idx}
                                        variant="secondary"
                                        className="h-14 px-6 text-lg border-b-4"
                                        onClick={() => handleWordRemove(word)}
                                    >
                                        {word}
                                    </Button>
                                ))}
                            </div>
                            <div className="flex flex-wrap gap-2 justify-center mt-10">
                                {availableWords.map((word, idx) => {
                                    const isUsed = selectedWords.includes(word);
                                    return (
                                        <WordCard
                                            key={idx}
                                            text={word}
                                            active={isUsed}
                                            onClick={() => !isUsed && handleWordSelect(word)}
                                        />
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* TYPE: MATCH (Pairing Game) */}
                    {activeChallenge.type === "MATCH" && activeChallenge.pairs && (
                        <ChallengeMatch
                            pairs={activeChallenge.pairs}
                            onTopUpdate={(newStatus) => {
                                setStatus(newStatus);
                                if (newStatus === "correct") {
                                    setCorrectCount(prev => prev + 1);
                                    playCorrectSound();
                                    speak("Excellent!", "en-US");
                                }
                            }}
                            onMistake={() => {
                                decreasePoints(2);
                                toast.error("-2 Gems! 💸", { position: "top-center" });
                                reduceHeart();
                                setWrongCount(prev => prev + 1);
                                setConsecutiveMistakes(prev => prev + 1);
                                if (hearts <= 1) { // 1 because we just reduced it implicitly via hook, or check state logic
                                    // Actually, reduceHeart updates state. If we want immediate modal:
                                    // We can't see the new 'hearts' state immediately here due to closure.
                                    // But reduceHeart() does not return the new value.
                                    // Logic: if hearts is currently 1, next is 0.
                                    if (hearts <= 1) setShowHeartsModal(true);
                                }
                            }}
                        />
                    )}
                    {/* TYPE: SPEAK (Voice Recognition) */}
                    {activeChallenge.type === "SPEAK" && (
                        <ChallengeSpeak
                            question={activeChallenge.question}
                            audioQuestion={activeChallenge.audioQuestion}
                            correctSentence={activeChallenge.correctSentence || ""}
                            characterImage={activeChallenge.storyContext?.image}
                            characterVideo={activeChallenge.storyContext?.video}
                            onStatusChange={(newStatus) => {
                                setStatus(newStatus);
                                if (newStatus === "correct") {
                                    setCorrectCount(prev => prev + 1);
                                    playCorrectSound();
                                    speak("Excellent!", "en-US");
                                    setShowCorrectFlash(true); // Trigger Flash
                                } else if (newStatus === "wrong") {
                                    // Optional: Handle wrong attempt immediately or wait for retry
                                    // But usually we just show feedback in component
                                }
                            }}
                        />
                    )}
                </div>
            </div>

            <Footer
                lessonId={lessonId}
                status={status}
                onCheck={onCheck}
                disabled={
                    activeChallenge.type === "SELECT" ? !selectedOption :
                        activeChallenge.type === "ASSIST" || activeChallenge.type === "LISTEN" ? selectedWords.length === 0 :
                            activeChallenge.type === "MATCH" ? status !== "correct" :
                                activeChallenge.type === "SPEAK" ? status !== "correct" : false
                }
            />
            {/* Assuming HeartsModal would be rendered here if it existed,
                or AuthModal should be placed after Footer as per the instruction's context. */}
            {/* <HeartsModal ... /> */}
            {/* The provided snippet for AuthModal seems to be a bit out of context,
                but placing it here as requested after the Footer.
                Note: The original code does not define `showAuthModal`, `setShowAuthModal`, or `router`.
                These would need to be defined in the LessonContent component for AuthModal to work. */}
            {/* <AuthModal
                open={showAuthModal}
                setOpen={setShowAuthModal}
                onSuccess={() => {
                    // Update user state if needed, then direct
                    router.push("/learn");
                }}
            /> */}
            {/* AuthModal placed here for easy access */}
            <AuthModal
                open={showAuthModal}
                setOpen={setShowAuthModal}
                onSuccess={() => router.push("/learn")}
                preventClose={isGuest}
            />
        </div >
    );
}

export default function LessonPage() {
    return (
        <Suspense fallback={<div className="h-screen flex items-center justify-center">Loading...</div>}>
            <LessonContent />
        </Suspense>
    );
}
