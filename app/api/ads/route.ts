import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { adSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export const runtime = "nodejs";

export async function GET() {
    try {
        const settings = await db.select().from(adSettings).limit(1);
        const currentSettings = settings[0];

        if (!currentSettings) {
            return NextResponse.json({ is_active: false });
        }

        // Only return necessary public data
        return NextResponse.json({
            is_active: currentSettings.is_active,
            type: currentSettings.type,
            image_url: currentSettings.image_url,
            target_url: currentSettings.target_url,
            script_code: currentSettings.script_code,
        });
    } catch (error) {
        console.error("[ADS API] Error:", error);
        return NextResponse.json({ is_active: false }, { status: 500 });
    }
}
