"use client";

import { StickyHeader } from "@/components/layout/sticky-header";
import { LessonButton } from "@/components/learn/lesson-button";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { useUserProgress } from "@/store/use-user-progress";
import { BookOpen } from "lucide-react";

import { curriculumData, sectionsData } from "@/data/curriculum";


import { PracticeModal } from "@/components/modals/practice-modal";
import { GuidebookModal } from "@/components/modals/guidebook-modal";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Unit } from "@/data/curriculum";
import { UnitHeader } from "@/components/learn/unit-header";
import { RightSidebar } from "@/components/layout/right-sidebar";
import { AdSidebar } from "@/components/layout/ad-sidebar";
import { UnitPathSvg } from "@/components/learn/unit-path-svg";

import { toast } from "sonner";

export default function LearnPage() {
    const { completedLessons, points, spendPoints, isCourseCompleted, refreshUserData, userId } = useUserProgress();
    const router = useRouter();

    // Auto-Sync with DB on Mount
    useEffect(() => {
        refreshUserData();
    }, []);

    // State for Modals
    const [practiceModalOpen, setPracticeModalOpen] = useState(false);
    const [selectedLessonId, setSelectedLessonId] = useState<number | null>(null);

    const [guidebookOpen, setGuidebookOpen] = useState(false);
    const [selectedUnit, setSelectedUnit] = useState<Unit | null>(null);

    // Section State (Dynamic)
    const [currentSectionId, setCurrentSectionId] = useState(1);
    const activeSection = sectionsData.find(s => s.id === currentSectionId) || sectionsData[0];

    const handleLessonStart = (id: number, isCompleted: boolean, isLast: boolean) => {
        // Direct Flow - No Gems Required
        if (isCompleted) {
            setSelectedLessonId(id);
            setPracticeModalOpen(true);
        } else {
            router.push(`/lesson?id=${id}&course=english`);
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
                <div className="max-w-[1400px] mx-auto pt-6 lg:pt-0 flex gap-12 justify-center">
                    {/* Feed Wrapper */}
                    <div className="flex-1 w-full max-w-[600px] pb-40 px-4 lg:px-0">
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
                        <div className="w-full mb-8 bg-sky-500 rounded-xl p-4 text-white shadow-lg border-b-4 border-sky-700 flex items-center justify-between">
                            <Button
                                variant="ghost"
                                className="text-white hover:bg-sky-600 disabled:opacity-50"
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
                                className="text-white hover:bg-sky-600 disabled:opacity-50"
                                onClick={() => setCurrentSectionId(prev => Math.min(sectionsData.length, prev + 1))}
                                disabled={currentSectionId === sectionsData.length}
                            >
                                Next ▶
                            </Button>
                        </div>

                        {/* WAITING ROOM (If Course Completed) */}
                        {isCourseCompleted ? (
                            <div className="flex flex-col items-center justify-center p-8 bg-gradient-to-b from-purple-500 to-indigo-600 rounded-3xl shadow-xl text-white text-center animate-in zoom-in-50 duration-500 border-b-8 border-indigo-800 mb-20">
                                <div className="text-6xl mb-4">🏆</div>
                                <h2 className="text-3xl font-black uppercase tracking-wide mb-2 drop-shadow-md">
                                    You've Conquered It All!
                                </h2>
                                <p className="text-white/90 font-medium text-lg mb-6 max-w-sm leading-relaxed">
                                    Master is preparing new challenges... Stay tuned for the next update!
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
                            <>
                                <div className="space-y-4">
                                    {activeSection.unitIds.map((unitId) => {
                                        const unit = curriculumData.find(u => u.id === unitId);
                                        if (!unit) return null;

                                        const isUnitCompleted = unit.lessons.every((lesson) => completedLessons.includes(lesson.id));
                                        const isUnitLocked = !isUnitCompleted && !unit.lessons.some((lesson) =>
                                            !completedLessons.includes(lesson.id) && (lesson.id === 1 || completedLessons.includes(lesson.id - 1))
                                        );
                                        const isUnitActive = !isUnitCompleted && !isUnitLocked;

                                        return (
                                            <div key={unit.id} className="mb-8">
                                                <UnitHeader
                                                    title={unit.title}
                                                    description={unit.description}
                                                    isActive={isUnitActive}
                                                    isCompleted={isUnitCompleted}
                                                    isLocked={isUnitLocked}
                                                />

                                                <div className="flex flex-col items-center relative mt-8 mb-16">
                                                    {/* Render Path SVG Layer */}
                                                    <div className="absolute inset-0 pointer-events-none z-0 mt-8">
                                                        <UnitPathSvg
                                                            lessons={unit.lessons}
                                                        />
                                                    </div>

                                                    {/* Render Lessons */}
                                                    {unit.lessons.map((lesson, index) => {
                                                        const isCompleted = completedLessons.includes(lesson.id);
                                                        const isFormattedCurrent = index === 0 ? (!isCompleted && unit.id === 1) : (completedLessons.includes(unit.lessons[index - 1].id) && !isCompleted);
                                                        const isLocked = !isCompleted && !isFormattedCurrent;

                                                        // Calculate offset for winding path (Sin wave)
                                                        // Amplitude 80px, Frequency derived from index
                                                        const rightOffset = Math.sin(index * 0.8) * 80;

                                                        return (
                                                            <div key={lesson.id}
                                                                className="relative z-10 mb-8 transition-transform hover:scale-105"
                                                                style={{ transform: `translateX(${rightOffset}px)` }}
                                                            >
                                                                <LessonButton
                                                                    id={lesson.id}
                                                                    index={index}
                                                                    totalCount={unit.lessons.length}
                                                                    current={isFormattedCurrent}
                                                                    locked={isLocked}
                                                                    percentage={isCompleted ? 100 : 0}
                                                                    onClick={(id) => handleLessonStart(id, isCompleted, index === unit.lessons.length - 1)}
                                                                />
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>

                                {/* UNIT 11: UNDER CONSTRUCTION (PHANTOM) */}
                                <div className="w-full mt-12 mb-20 animate-in fade-in duration-700">
                                    <div className="bg-amber-100 border-4 border-amber-300 border-dashed rounded-xl p-6 relative overflow-hidden">
                                        {/* Construction Tape Effect */}
                                        <div className="absolute top-0 left-0 w-full h-4 bg-stripes-black-yellow opacity-20"></div>
                                        <div className="absolute bottom-0 left-0 w-full h-4 bg-stripes-black-yellow opacity-20"></div>

                                        <div className="flex flex-col items-center text-center relative z-10">
                                            <div className="bg-amber-400 p-3 rounded-full mb-3 shadow-md">
                                                <BookOpen className="h-8 w-8 text-amber-900" />
                                            </div>
                                            <h3 className="text-xl font-black text-amber-800 uppercase tracking-wide mb-1">
                                                Unit 11: Under Construction
                                            </h3>
                                            <p className="text-sm font-bold text-amber-700/80 max-w-[280px]">
                                                Materi baru sedang disiapkan Manager. Silakan refresh secara berkala! 🚧
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </>
                        )}
                    </div>

                    {/* Right Sidebar */}
                    <div className="hidden xl:block w-[360px] relative">
                        <div className="sticky top-6 pt-6 flex flex-col gap-y-4">
                            <RightSidebar />
                        </div>
                    </div>



                    {/* Far Right Ad Column */}
                    <AdSidebar />
                </div>
            </div>
        </div>
    );
}
