"use client";

import { useEffect, useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
// import { ScrollArea } from "@/components/ui/scroll-area";
import { X } from "lucide-react";

interface GuidebookModalProps {
    open: boolean;
    setOpen: (open: boolean) => void;
    title: string;
    content: string;
}

export const GuidebookModal = ({
    open,
    setOpen,
    title,
    content,
}: GuidebookModalProps) => {
    const [isClient, setIsClient] = useState(false);

    useEffect(() => setIsClient(true), []);

    if (!isClient) return null;

    // Simple Markdown Parser
    const renderContent = (text: string) => {
        return text.split("\n").map((line, index) => {
            // Header 1
            if (line.startsWith("# ")) {
                return <h1 key={index} className="text-2xl font-bold mt-4 mb-2 text-green-600 border-b pb-2">{line.replace("# ", "")}</h1>;
            }
            // Header 2
            if (line.startsWith("## ")) {
                return <h2 key={index} className="text-xl font-bold mt-4 mb-2 text-slate-700">{line.replace("## ", "")}</h2>;
            }
            // Header 3
            if (line.startsWith("### ")) {
                return <h3 key={index} className="text-lg font-bold mt-3 mb-1 text-slate-600">{line.replace("### ", "")}</h3>;
            }
            // Blockquote
            if (line.startsWith("> ")) {
                return (
                    <div key={index} className="bg-amber-100 border-l-4 border-amber-500 p-3 my-3 rounded-r italic text-slate-700">
                        {parseFormatting(line.replace("> ", ""))}
                    </div>
                );
            }
            // List Item
            if (line.startsWith("- ")) {
                return (
                    <li key={index} className="ml-5 list-disc text-slate-600 mb-1 pl-1">
                        {parseFormatting(line.replace("- ", ""))}
                    </li>
                );
            }
            // Table Row (Simple detection)
            if (line.startsWith("|")) {
                // Skip separator lines
                if (line.includes("---")) return null;
                const cols = line.split("|").filter(c => c.trim() !== "");
                return (
                    <div key={index} className="grid grid-cols-2 gap-4 border-b py-2 text-sm">
                        {cols.map((col, i) => (
                            <div key={i} className={i === 0 ? "font-bold text-slate-700" : "text-slate-600"}>
                                {parseFormatting(col.trim())}
                            </div>
                        ))}
                    </div>
                );
            }

            // Normal Text (with formatting)
            if (line.trim() === "") return <div key={index} className="h-4" />;

            return <p key={index} className="text-slate-600 leading-relaxed mb-2">{parseFormatting(line)}</p>;
        });
    };

    const parseFormatting = (text: string) => {
        // Simple parser for **bold**
        const parts = text.split(/(\*\*.*?\*\*)/g);
        return parts.map((part, i) => {
            if (part.startsWith("**") && part.endsWith("**")) {
                return <strong key={i} className="text-slate-800">{part.slice(2, -2)}</strong>;
            }
            return part;
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-2xl max-h-[85vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-6 pb-2 border-b bg-green-50">
                    <DialogTitle className="text-2xl font-black text-green-600 uppercase tracking-wide">
                        {title}
                    </DialogTitle>
                    <DialogDescription className="text-slate-500 font-medium">
                        Panduan Belajar
                    </DialogDescription>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-6 space-y-1">
                    {renderContent(content)}
                </div>

                <div className="p-4 border-t bg-gray-50 flex justify-end">
                    <Button variant="primary" onClick={() => setOpen(false)} className="w-full md:w-auto">
                        Mengerti! 👍
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
};
