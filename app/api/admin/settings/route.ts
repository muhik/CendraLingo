import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
import { siteSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET() {
    try {
        const settings = await db.select().from(siteSettings);

        // Convert array to object for easier frontend consumption
        const settingsMap = settings.reduce((acc, curr) => {
            acc[curr.key] = curr.value;
            return acc;
        }, {} as Record<string, string | null>);

        return NextResponse.json(settingsMap);
    } catch (error) {
        console.error("[SETTINGS_GET]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const updates = Object.entries(body);

        for (const [key, value] of updates) {
            // Check if exists
            const existing = await db.select().from(siteSettings).where(eq(siteSettings.key, key));

            if (existing.length > 0) {
                await db.update(siteSettings)
                    .set({ value: value as string, updatedAt: new Date() })
                    .where(eq(siteSettings.key, key));
            } else {
                await db.insert(siteSettings).values({
                    key,
                    value: value as string,
                    updatedAt: new Date(),
                });
            }
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("[SETTINGS_POST]", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
