"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Pair } from "@/data/curriculum";
import { useSounds } from "@/hooks/use-sounds";

interface ChallengeMatchProps {
    pairs: Pair[];
    onTopUpdate: (status: "none" | "correct" | "wrong") => void; // Feedback to parent
    onMistake: () => void; // New callback for individual errors
}

export const ChallengeMatch = ({ pairs, onTopUpdate, onMistake }: ChallengeMatchProps) => {
    // We need to flatten pairs into a list of buttons, shuffled
    const [tokens, setTokens] = useState<{ id: string; text: string; pairId: number; solved: boolean }[]>([]);
    const [selectedId, setSelectedId] = useState<string | null>(null);
    const { playCorrectSound, playWrongSound } = useSounds();

    useEffect(() => {
        // Init: Create 2 tokens per pair
        const newTokens = pairs.flatMap((pair, idx) => [
            { id: `from-${idx}`, text: pair.from, pairId: idx, solved: false },
            { id: `to-${idx}`, text: pair.to, pairId: idx, solved: false }
        ]);
        // Shuffle (Fisher-Yates)
        for (let i = newTokens.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [newTokens[i], newTokens[j]] = [newTokens[j], newTokens[i]];
        }
        setTokens(newTokens);
    }, [pairs]);

    const handleTokenClick = (id: string, pairId: number) => {
        // If already solved or same token clicked, ignore
        if (tokens.find(t => t.id === id)?.solved) return;
        if (selectedId === id) {
            setSelectedId(null); // Deselect
            return;
        }

        // If no token selected, select this one
        if (!selectedId) {
            setSelectedId(id);
            return;
        }

        // If one selected, check match
        const selectedToken = tokens.find(t => t.id === selectedId);

        if (selectedToken && selectedToken.pairId === pairId) {
            // MATCH!
            playCorrectSound();
            setTokens(prev => prev.map(t =>
                (t.id === id || t.id === selectedId) ? { ...t, solved: true } : t
            ));
            setSelectedId(null);

            // Check if ALL solved
            // We need to check next render state, or check current new state
            // Let useEffect handle completion or check here
            const isRefreshedAllSolved = tokens.filter(t => !t.solved).length <= 2; // If only 2 were left and we solved them
            if (isRefreshedAllSolved) {
                onTopUpdate("correct"); // Signal completion
            }

        } else {
            // MISMATCH
            playWrongSound();
            onMistake(); // Trigger Penalty
            setSelectedId(null);
            // Optionally add shake animation here
        }
    };

    return (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full">
            {tokens.map((token) => (
                <Button
                    key={token.id}
                    variant={token.solved ? "ghost" : selectedId === token.id ? "secondary" : "default"}
                    className={cn(
                        "h-24 text-lg font-bold transition-all",
                        token.solved && "invisible", // Hide solved
                        selectedId === token.id && "ring-4 ring-sky-300 bg-sky-100 text-sky-600 border-sky-300",
                        !token.solved && selectedId !== token.id && "bg-white text-slate-700 border-b-4 border-slate-200 hover:bg-slate-50"
                    )}
                    onClick={() => handleTokenClick(token.id, token.pairId)}
                >
                    {token.text}
                </Button>
            ))}
        </div>
    );
};
