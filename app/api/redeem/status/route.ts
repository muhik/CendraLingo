import { db } from "@/db/drizzle";
export const runtime = "edge";
import { redeemRequests } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET - Check user's completed redeem requests
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
        return NextResponse.json({ error: "userId required" }, { status: 400 });
    }

    try {
        // Get completed redeem requests for this user
        const completedRequests = await db
            .select()
            .from(redeemRequests)
            .where(
                and(
                    eq(redeemRequests.userId, userId),
                    eq(redeemRequests.status, "completed")
                )
            );

        return NextResponse.json({
            hasCompleted: completedRequests.length > 0,
            requests: completedRequests,
        });
    } catch (error) {
        console.error("Fetch user redeems error:", error);
        return NextResponse.json({ hasCompleted: false, requests: [] });
    }
}

// POST - Mark notification as seen (clear completed status)
export async function POST(request: Request) {
    try {
        const { requestId } = await request.json();

        if (!requestId) {
            return NextResponse.json({ error: "requestId required" }, { status: 400 });
        }

        // Update status to "notified" so it doesn't show again
        await db
            .update(redeemRequests)
            .set({ status: "notified" })
            .where(eq(redeemRequests.id, requestId));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Update redeem notified error:", error);
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
