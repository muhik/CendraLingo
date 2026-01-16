import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { userTreasureLog, treasureSettings } from "@/db/schema";
import { eq, and } from "drizzle-orm";

// GET: Check treasure access and settings
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "userId required" }, { status: 400 });
        }

        // Get settings
        const settings = await db.select().from(treasureSettings).limit(1).get();
        const config = settings || { isEnabled: 1, requirePaid4link: 0, paid4linkUrl: null };

        // Get user's treasure log
        const userLog = await db.select().from(userTreasureLog).where(eq(userTreasureLog.userId, userId)).get();

        const today = new Date().toISOString().split("T")[0];

        // Check if user has valid access for today
        const hasAccess = userLog?.hasTreasureAccess === true && userLog?.treasureAccessDate === today;
        const alreadySpunToday = userLog?.lastSpinDate === today;
        const canSpin = hasAccess && !alreadySpunToday;

        return NextResponse.json({
            hasAccess,
            alreadySpunToday,
            canSpin,
            settings: {
                isEnabled: config.isEnabled,
                requirePaid4link: config.requirePaid4link,
                paid4linkUrl: config.paid4linkUrl,
            },
        });

    } catch (error) {
        console.error("Treasure access check error:", error);
        return NextResponse.json({ error: "Server error", details: String(error) }, { status: 500 });
    }
}

// POST: Set treasure access (called when user clicks widget)
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { userId, action } = body;

        if (!userId) {
            return NextResponse.json({ error: "userId required" }, { status: 400 });
        }

        const today = new Date().toISOString().split("T")[0];

        if (action === "setAccess") {
            // Upsert: Set treasure access for today
            const existing = await db.select().from(userTreasureLog).where(eq(userTreasureLog.userId, userId)).get();

            if (existing) {
                await db.update(userTreasureLog)
                    .set({ hasTreasureAccess: true, treasureAccessDate: today })
                    .where(eq(userTreasureLog.userId, userId));
            } else {
                await db.insert(userTreasureLog).values({
                    userId,
                    hasTreasureAccess: true,
                    treasureAccessDate: today,
                    lastSpinDate: null, // Ensure new user hasn't spun
                    createdAt: new Date(),
                });
            }

            return NextResponse.json({ success: true, message: "Access granted" });

        } else if (action === "recordSpin") {
            // Record that user has spun today
            const existing = await db.select().from(userTreasureLog).where(eq(userTreasureLog.userId, userId)).get();

            if (existing) {
                await db.update(userTreasureLog)
                    .set({ lastSpinDate: today })
                    .where(eq(userTreasureLog.userId, userId));
            } else {
                // Should not normally happen if setAccess was called first
                await db.insert(userTreasureLog).values({
                    userId,
                    hasTreasureAccess: false,
                    lastSpinDate: today,
                    createdAt: new Date(),
                });
            }

            return NextResponse.json({ success: true, message: "Spin recorded" });

        } else if (action === "clearAccess") {
            // Clear access (for testing)
            await db.update(userTreasureLog)
                .set({ hasTreasureAccess: false, treasureAccessDate: null })
                .where(eq(userTreasureLog.userId, userId));

            return NextResponse.json({ success: true, message: "Access cleared" });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Treasure access error:", error);
        return NextResponse.json({ error: "Server error", details: String(error) }, { status: 500 });
    }
}
