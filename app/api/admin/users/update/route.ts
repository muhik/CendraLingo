import { db } from "@/db/drizzle";
export const runtime = "edge";
import { userProgress } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, hasActiveSubscription } = body;

        await db.update(userProgress)
            .set({ hasActiveSubscription })
            .where(eq(userProgress.userId, userId));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false }, { status: 500 });
    }
}
