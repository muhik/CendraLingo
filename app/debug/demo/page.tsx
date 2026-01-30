"use client";

import { useUserProgress } from "@/store/use-user-progress";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { curriculumData } from "@/data/curriculum";

export default function DemoDebugPage() {
    const { login, completeLesson, userId, completedLessons } = useUserProgress();
    const router = useRouter();

    const handleSimulateEnd = () => {
        // 1. Force Login as Guest (or keep current user)
        // login({ userId: userId || "demo-user", isGuest: false });

        // 2. Collect ALL Lesson IDs from Curriculum
        let allLessonIds: number[] = [];
        curriculumData.forEach(unit => {
            unit.lessons.forEach(lesson => {
                allLessonIds.push(lesson.id);
            });
        });

        // 3. Remove the very last lesson ID (ID 1005)
        const lastLessonId = 1005;
        const idsToComplete = allLessonIds.filter(id => id !== lastLessonId);

        // 4. Update Store directly
        // We do this individually or we can hack usage of 'login' if we exposed a setter, 
        // but since we only have 'completeLesson', let's just loop (it's fast enough for client state)
        // OR better: rely on the fact that we can just jump to the lesson if we trick the state.

        // Actually, let's just use the store's logic
        // We will call completeLesson for every single one.
        // To avoid 49 re-renders/syncs, it might be heavy.

        // BETTER APPROACH: Just navigate to the final lesson and assume we have access? 
        // No, the guard will block it.

        // Let's manually set local storage? No, Zustand persist handles it.

        // Let's just do the loop, it's fine for a debug tool.
        idsToComplete.forEach(id => {
            if (!completedLessons.includes(id)) {
                useUserProgress.getState().completeLesson(id);
            }
        });

        // Also reset "isCourseCompleted" just in case
        useUserProgress.setState({ isCourseCompleted: false });

        toast.success("State Forced to: END GAME - 1");

        setTimeout(() => {
            router.push("/learn");
        }, 1000);
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen gap-8 p-4 bg-slate-900 text-white">
            <h1 className="text-3xl font-bold">Demo Simulation Tool</h1>
            <p className="max-w-md text-center text-slate-400">
                Click this button to force your local state to "End of Course - 1 Step".
                This will unlock everything up to the final lesson, allowing you to record your demo.
            </p>

            <Button
                onClick={handleSimulateEnd}
                size="lg"
                className="bg-purple-600 hover:bg-purple-700 font-bold text-xl px-8 py-6 rounded-2xl border-b-4 border-purple-800 active:border-b-0"
            >
                🪄 SIMULATE END GAME
            </Button>

            <p className="text-xs text-slate-600">
                Note: This modifies your browser's local storage state directly.
            </p>
        </div>
    );
}
