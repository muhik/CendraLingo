import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, courseId, timestamp } = body;

        console.log(`[MANAGER_NOTIFY] User ${userId} Completed Course ${courseId} at ${timestamp}`);

        // Here we would typically update a database or send a real notification
        // For now, we simulate a successful signal receipt.

        return NextResponse.json({ success: true, message: "Manager notified successfully" });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Failed to notify manager" }, { status: 500 });
    }
}
