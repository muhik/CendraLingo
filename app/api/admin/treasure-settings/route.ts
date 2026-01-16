import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { treasureSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET: Get treasure settings
export async function GET() {
    try {
        const settings = await db.select().from(treasureSettings).limit(1);

        if (settings.length === 0) {
            // Return defaults if no settings exist
            return NextResponse.json({
                id: null,
                paid4linkUrl: null,
                isEnabled: true,
                requirePaid4link: false,
            });
        }

        return NextResponse.json(settings[0]);

    } catch (error) {
        console.error("Get treasure settings error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}

// POST: Update treasure settings
export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { paid4linkUrl, isEnabled, requirePaid4link } = body;

        const existing = await db.select().from(treasureSettings).limit(1);

        if (existing.length > 0) {
            await db
                .update(treasureSettings)
                .set({
                    paid4linkUrl: paid4linkUrl || null,
                    isEnabled: isEnabled ?? true,
                    requirePaid4link: requirePaid4link ?? false,
                    updatedAt: new Date(),
                })
                .where(eq(treasureSettings.id, existing[0].id));
        } else {
            await db.insert(treasureSettings).values({
                paid4linkUrl: paid4linkUrl || null,
                isEnabled: isEnabled ?? true,
                requirePaid4link: requirePaid4link ?? false,
                updatedAt: new Date(),
            });
        }

        return NextResponse.json({ success: true, message: "Settings updated" });

    } catch (error) {
        console.error("Update treasure settings error:", error);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
