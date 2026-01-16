import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
export const runtime = "edge";
import { feedbacks } from "@/db/schema";
import { eq } from "drizzle-orm";

// POST: Submit feedback
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, userName, message, type } = body;

        // Validation based on requirements
        if (!userId || !message) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        // Insert feedback
        await db.insert(feedbacks).values({
            userId,
            userName: userName || "Anonymous",
            message,
            type: type || 'saran',
            createdAt: new Date().toISOString()
        });

        return NextResponse.json({ success: true, message: "Feedback submitted" });

    } catch (error) {
        console.error("Feedback submit error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
