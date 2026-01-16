import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
export const runtime = "edge";
import { adSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

// GET config for admin
export async function GET() {
    try {
        const ad = await db.select().from(adSettings).where(eq(adSettings.id, 1)).get();
        return NextResponse.json(ad || {});
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch ads" }, { status: 500 });
    }
}

// POST update config
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { type, script_code, image_url, target_url, is_active } = body;

        await db.update(adSettings)
            .set({
                type,
                scriptCode: script_code || "",
                imageUrl: image_url || "",
                targetUrl: target_url || "",
                isActive: is_active ? 1 : 0,
                updatedAt: new Date().toISOString()
            })
            .where(eq(adSettings.id, 1));

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update ads" }, { status: 500 });
    }
}
