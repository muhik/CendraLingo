"use client";

import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
} from "@/components/ui/command";
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover";
import { useState } from "react";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

type Course = {
    label: string;
    imageSrc: string;
    href: string; // The URL to navigate to
};

const courses: Course[] = [
    {
        label: "Bahasa Inggris",
        imageSrc: "/cendra_mascot.png", // Cendra mascot
        href: "/learn",
    },
    {
        label: "Matematika SD",
        imageSrc: "/cendra_mascot.png", // Cendra mascot
        href: "/math",
    },
];

export const CourseSwitcher = () => {
    const pathname = usePathname();
    const router = useRouter();
    const [open, setOpen] = useState(false);

    // Determine active course based on URL
    const activeCourse = courses.find((c) => pathname.startsWith(c.href));
    // Default to English if not found (or if on exact same path matches)
    const displayCourse = activeCourse || courses[0];

    // Don't show switcher if not on learn or math pages (optional, but good for focus)
    // Actually, we want it always visible in sidebar if sidebar is visible.

    const onSelect = (course: Course) => {
        setOpen(false);
        router.push(course.href);
    };

    return (
        <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
                <Button
                    variant="ghost"
                    size="sm"
                    role="combobox"
                    aria-expanded={open}
                    className="w-full justify-between hover:bg-white/10 h-16 px-2"
                >
                    <div className="flex items-center gap-3">
                        <div className="relative h-8 w-8 overflow-hidden rounded-md border border-white/20">
                            <Image
                                src={displayCourse.imageSrc}
                                alt={displayCourse.label}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <span className="font-bold text-white text-base truncate max-w-[120px]">
                            {displayCourse.label}
                        </span>
                    </div>
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50 text-white" />
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-2 bg-[#1B3B24] border-2 border-[#549c49] text-white z-[200] mt-2 ml-2" side="bottom" align="start">
                <Command className="bg-transparent border-none">
                    <CommandList>
                        <CommandEmpty className="text-white/50">Pelajaran tidak ditemukan.</CommandEmpty>
                        <CommandGroup heading="Pelajaran Saya" className="text-white/70">
                            {courses.map((course) => (
                                <CommandItem
                                    key={course.href}
                                    onSelect={() => onSelect(course)}
                                    className="text-sm cursor-pointer hover:bg-white/10 rounded-md py-2 data-[selected=true]:bg-white/20 data-[selected=true]:text-white"
                                >
                                    <div className="flex items-center gap-3 w-full">
                                        <div className="relative h-6 w-6 overflow-hidden rounded-sm border border-white/20">
                                            <Image
                                                src={course.imageSrc}
                                                alt={course.label}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <span className="font-bold">{course.label}</span>
                                    </div>
                                    <Check
                                        className={cn(
                                            "ml-auto h-4 w-4",
                                            displayCourse.href === course.href
                                                ? "opacity-100 text-green-400"
                                                : "opacity-0"
                                        )}
                                    />
                                </CommandItem>
                            ))}
                        </CommandGroup>
                        <CommandSeparator className="bg-white/10 my-1" />
                        <CommandGroup>
                            <CommandItem onSelect={() => { }} className="cursor-not-allowed opacity-50 hover:bg-transparent text-white/50">
                                <PlusCircle className="mr-2 h-4 w-4" />
                                Tambah Pelajaran Baru
                            </CommandItem>
                        </CommandGroup>
                    </CommandList>
                </Command>
            </PopoverContent>
        </Popover>
    );
};
