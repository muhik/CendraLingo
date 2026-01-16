"use client";

import { StickyHeader } from "@/components/layout/sticky-header";
import { LessonButton } from "@/components/learn/lesson-button";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { useUserProgress } from "@/store/use-user-progress";
import { BookOpen } from "lucide-react";

import { mathCurriculumData, mathSectionsData } from "@/data/math-curriculum";


import { PracticeModal } from "@/components/modals/practice-modal";
import { GuidebookModal } from "@/components/modals/guidebook-modal";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Unit } from "@/data/curriculum";
import { UnitHeader } from "@/components/learn/unit-header";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { UnitPathSvg } from "@/components/learn/unit-path-svg";

import { toast } from "sonner";

export default function MathPage() {
    const { completedLessons, points, spendPoints, isCourseCompleted } = useUserProgress();
    const router = useRouter();

    // State for Modals
    const [practiceModalOpen, setPracticeModalOpen] = useState(false);
    const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

    const [guidebookOpen, setGuidebookOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

    // Section State (Dynamic)
    const [currentSectionId, setCurrentSectionId] = useState(1);
    const activeSection = mathSectionsData.find(s => s.id === currentSectionId) || mathSectionsData[0];

    const handleLessonStart = (id: number, isCompleted: boolean, isLast: boolean) => {
        // Direct Flow - No Gems Required
        if (isCompleted) {
            setSelectedLessonId(id);
            setPracticeModalOpen(true);
        } else {
            router.push(`/lesson?id=${id}&course=math`);
        }
    };

    return (
        <div className="flex min-h-screen bg-background-dark">
            {/* Mobile Header */}
            <StickyHeader />

            {/* Sidebar (Desktop Hidden/Different) - Actually keeping main Sidebar on Left as per standard, new Right Sidebar for extras */}
            <div className="hidden lg:block w-[256px] fixed left-0 top-0 h-full border-r border-white/10 z-50">
                <Sidebar />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 lg:pl-[256px]">
                <div className="max-w-[1056px] mx-auto pt-6 lg:pt-0 flex gap-12">
                    {/* Feed Wrapper */}
                    <div className="flex-1 w-full pb-40 px-4 lg:px-0">
                        {/* Title Header for Math */}
                        <div className="mb-8 mt-4 flex items-center gap-4 px-4">
                            <div className="p-3 bg-blue-500 rounded-xl shadow-lg">
                                <span className="text-3xl">🧮</span>
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-white">Matematika SD Kelas 1</h1>
                                <p className="text-slate-400 font-medium">Belajar berhitung seru bersama Cendra!</p>
                            </div>
                        </div>

                        {/* Practice Modal */}
                        <PracticeModal
                            open={practiceModalOpen}
                            setOpen={setPracticeModalOpen}
                            lessonId={selectedLessonId || 0}
                        />

                        <GuidebookModal
                            open={guidebookOpen}
                            setOpen={setGuidebookOpen}
                            title={selectedUnit?.title || "Guidebook"}
                            content={selectedUnit?.guidebookContent || "Belum ada panduan untuk unit ini."}
                        />

                        {/* SECTIONS HEADER (DYNAMIC) */}
                        <div className="w-full mb-8 bg-blue-500 rounded-xl p-4 text-white shadow-lg border-b-4 border-blue-700 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                className="text-white hover:bg-blue-600 disabled:opacity-50"
                                onClick={() => setCurrentSectionId(prev => Math.max(1, prev - 1))}
                                disabled={currentSectionId === 1}
                            >
                                ◀ Prev
                            </Button>

                            <div className="text-center">
                                <div className="text-xs font-bold uppercase opacity-80 mb-1">Current Section</div>
                                <div className="text-xl font-black uppercase tracking-wide">
                                    {activeSection.title}
                                </div>
                                <div className="text-xs font-medium mt-1 opacity-90">
                                    {activeSection.description}
                                </div>
                            </div>

                            <Button
                                variant="ghost"
                                className="text-white hover:bg-blue-600 disabled:opacity-50"
                                onClick={() => setCurrentSectionId(prev => Math.min(mathSectionsData.length, prev + 1))}
                                disabled={currentSectionId === mathSectionsData.length}
                            >
                                Next ▶
                            </Button>
                        </div>

                        {/* WAITING ROOM (If Course Completed) */}
                        {isCourseCompleted ? (
                            <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-blue-500 to-indigo-600 rounded-3xl shadow-xl text-white text-center animate-in zoom-in-50 duration-500 border-b-8 border-indigo-800 mb-20">
                                <div className="text-6xl mb-4">🏆</div>
                                <h2 className="text-3xl font-black uppercase tracking-wide mb-2 drop-shadow-md">
                                    Matematika Master!
                                </h2>
                                <p className="text-white/90 font-medium text-lg mb-6 max-w-sm leading-relaxed">
                                    Kamu sudah menyelesaikan semua materi. Tunggu update soal baru!
                                </p>
                                <div className="bg-white/20 p-4 rounded-xl backdrop-blur-sm border border-white/30">
                                    <div className="text-xs font-bold uppercase opacity-80 mb-1">Status</div>
                                    <div className="font-bold flex items-center justify-center gap-2">
                                        <div className="h-3 w-3 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.8)]"></div>
                                        WAITING FOR UPDATE
                                    </div>
                                </div>
                            </div>
                        ) : (
                            mathCurriculumData
                                .filter(unit => activeSection.unitIds.includes(unit.id))
                                .map((unit) => {
                                    const isUnitCompleted = unit.lessons.every((lesson) => completedLessons.includes(lesson.id));
                                    const isUnitLocked = !isUnitCompleted && !unit.lessons.some((lesson) =>
                                        !completedLessons.includes(lesson.id) && (lesson.id === 500101 || completedLessons.includes(lesson.id - 1))
                                    );
                                    const isFirstMathLesson = unit.lessons[0].id === 500101;

                                    const isUnitActive = true;

                                    return (
                                        <div key={unit.id} className="mb-10 w-full relative">
                                            <UnitHeader
                                                title={unit.title}
                                                description={unit.description}
                                                isActive={true}
                                                isCompleted={isUnitCompleted}
                                                isLocked={false}
                                            />

                                            <div className="flex flex-col items-center relative gap-4">
                                                <UnitPathSvg lessons={unit.lessons} />

                                                {unit.lessons.map((lesson, index) => {
                                                    const isCompleted = completedLessons.includes(lesson.id);

                                                    // First lesson of first unit is always unlocked if not completed
                                                    const isFirstLessonEver = lesson.id === 500101;

                                                    // Check if previous lesson is completed (for sequential unlock)
                                                    let isPreviousCompleted = false;
                                                    if (index === 0) {
                                                        // First lesson of unit: check if last lesson of previous unit is done
                                                        const unitIndex = mathCurriculumData.findIndex(u => u.id === unit.id);
                                                        if (unitIndex > 0) {
                                                            const prevUnit = mathCurriculumData[unitIndex - 1];
                                                            const prevLastLesson = prevUnit.lessons[prevUnit.lessons.length - 1];
                                                            isPreviousCompleted = completedLessons.includes(prevLastLesson.id);
                                                        } else {
                                                            isPreviousCompleted = true; // First unit, first lesson
                                                        }
                                                    } else {
                                                        // Not first lesson: check previous lesson in same unit
                                                        isPreviousCompleted = completedLessons.includes(unit.lessons[index - 1].id);
                                                    }

                                                    const isFormattedCurrent = !isCompleted && (isFirstLessonEver || isPreviousCompleted);
                                                    const isLocked = !isCompleted && !isFormattedCurrent;

                                                    return (
                                                        <div key={lesson.id} className="relative z-10">
                                                            <LessonButton
                                                                id={lesson.id}
                                                                index={index}
                                                                totalCount={unit.lessons.length}
                                                                current={isFormattedCurrent}
                                                                locked={isLocked}
                                                                percentage={isFormattedCurrent ? 0 : isCompleted ? 100 : 0}
                                                                type={lesson.type}
                                                                onClick={handleLessonStart}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )
                                })
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="hidden xl:block w-[360px] relative">
                        <div className="sticky top-6 pt-6 flex flex-col gap-y-4">
                            <RightSidebar />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
