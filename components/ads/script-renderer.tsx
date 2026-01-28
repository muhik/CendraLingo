"use client";

import { useEffect, useRef } from "react";

interface ScriptRendererProps {
    html: string;
    className?: string;
}

export const ScriptRenderer = ({ html, className }: ScriptRendererProps) => {
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (!containerRef.current || !html) return;

        // Clear previous content
        containerRef.current.innerHTML = "";

        // Create a temporary container to parse the HTML string
        const tempDiv = document.createElement("div");
        tempDiv.innerHTML = html;

        // Extract scripts and separate them from regular HTML
        const scripts = Array.from(tempDiv.querySelectorAll("script"));
        const nonScriptContent = tempDiv.innerHTML; // This still contains script tags in string form, but we'll use the nodes

        // 1. Append non-script elements (sanitized if needed, or raw)
        // For Adsterra, usually it's just script tags, but sometimes there's a div placeholder.
        // We'll traverse and clone nodes to preserve structure minus the scripts we will re-create.

        // Simpler approach: innerHTML the content, then find and RE-RUN scripts
        containerRef.current.innerHTML = html;

        const scriptsInContainer = Array.from(containerRef.current.querySelectorAll("script"));
        scriptsInContainer.forEach((oldScript) => {
            const newScript = document.createElement("script");

            // Copy attributes
            Array.from(oldScript.attributes).forEach((attr) => {
                newScript.setAttribute(attr.name, attr.value);
            });

            // Copy content
            newScript.textContent = oldScript.textContent;

            // Replace old script with new script to trigger execution
            oldScript.parentNode?.replaceChild(newScript, oldScript);
        });

    }, [html]);

    return <div ref={containerRef} className={className} />;
};
