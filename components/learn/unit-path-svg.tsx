"use client";

import { cn } from "@/lib/utils";

interface UnitPathSvgProps {
    lessons: any[]; // Or properly typed
}

export const UnitPathSvg = ({ lessons }: UnitPathSvgProps) => {
    // Constants
    const BUTTON_HEIGHT = 80;
    const BUTTON_WIDTH = 80;
    const MARGIN_TOP_FIRST = 20;
    const MARGIN_TOP_REST = 24;

    // We assume the container is centered. Center X = 50% of SVG.
    // But SVG needs a width. Let's make it wide enough, e.g., 300px.
    const CONTAINER_WIDTH = 300; // Arbitrary wide enough
    const CENTER_X = CONTAINER_WIDTH / 2;

    const pathPoints = lessons.map((_, index) => {
        // Calculate Y
        // Item 0: Margin 20 + Half Height 40 = 60
        // Item 1: 60 + Half(40) + Margin(24) + Half(40) = 60 + 104
        // Item N: 60 + (N * 104)
        const y = 60 + (index * 104);

        // Calculate X (Offset logic from LessonButton)
        const cycleIndex = index % 8;
        let indentationLevel;

        if (cycleIndex <= 2) {
            indentationLevel = cycleIndex;
        } else if (cycleIndex <= 4) {
            indentationLevel = 4 - cycleIndex;
        } else if (cycleIndex <= 6) {
            indentationLevel = 4 - cycleIndex;
        } else {
            indentationLevel = cycleIndex - 8;
        }

        // rightPosition from LessonButton logic:
        // style={{ right: `${rightPosition}px` }}
        // If right is positive, it moves LEFT. 
        // So offset X should be negative of rightPosition.
        // Formula: indentationLevel * 40

        const offsetX = -(indentationLevel * 40);
        const x = CENTER_X + offsetX;

        return `${x} ${y}`;
    });

    // Generate Path Data "M x0 y0 L x1 y1 L x2 y2 ..."
    const d = `M ${pathPoints.join(" L ")}`;

    // Calculate total height
    // Last item Y + Half Height (40) + maybe some padding
    const totalHeight = 60 + ((lessons.length - 1) * 104) + 60;

    return (
        <svg
            width={CONTAINER_WIDTH}
            height={totalHeight}
            className="absolute top-0 left-1/2 -translate-x-1/2 pointer-events-none z-0"
            style={{ overflow: 'visible' }}
        >
            <path
                d={d}
                stroke="#23482f" // Secondary Dark
                strokeWidth="8"
                strokeLinecap="round"
                strokeLinejoin="round"
                fill="none"
                className="drop-shadow-sm"
            />
            {/* Optional: Second path for "progress" could be added here if we passed completion data */}
        </svg>
    );
};
