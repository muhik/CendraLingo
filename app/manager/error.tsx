"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        console.error("Manager Page Crash:", error);
    }, [error]);

    return (
        <div className="flex h-screen w-full flex-col items-center justify-center bg-slate-50 gap-4">
            <h2 className="text-2xl font-bold text-red-600">Something went wrong!</h2>
            <div className="bg-white p-4 rounded-lg shadow border border-red-200 text-sm font-mono max-w-md overflow-auto">
                <p className="font-bold text-slate-800">Error Message:</p>
                <p className="text-red-500">{error.message}</p>
                {error.digest && <p className="text-slate-400 mt-2 text-xs">Digest: {error.digest}</p>}
            </div>
            <Button
                onClick={
                    // Attempt to recover by trying to re-render the segment
                    () => reset()
                }
                variant="outline"
            >
                Try again
            </Button>
            <Button
                variant="link"
                onClick={() => window.location.reload()}
            >
                Hard Refresh
            </Button>
        </div>
    );
}
