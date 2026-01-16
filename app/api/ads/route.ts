import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
export const runtime = "edge";
import { adSettings } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET active ad for frontend
export async function GET() {
    try {
        // Only fetch if active
        const ad = await db.select().from(adSettings).where(and(eq(adSettings.id, 1), eq(adSettings.isActive, 1))).get();

        // If no active ad, return null/empty
        if (!ad) return NextResponse.json(null);

        return NextResponse.json(ad);
    } catch (error) {
        return NextResponse.json(null, { status: 500 });
    }
}
