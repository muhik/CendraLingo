import { NextResponse } from "next/server";
import { tursoQuery } from "@/db/turso-http";

export const runtime = "nodejs";

// Minimal version for future debugging if needed, but safe
export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const action = url.searchParams.get("action");

        // List users (Read-only)
        if (action === "list") {
            const users = await tursoQuery("SELECT user_id, points, hearts, has_active_subscription FROM user_progress ORDER BY points DESC LIMIT 10");
            return NextResponse.json({ users });
        }

        return NextResponse.json({ message: "Temp API sanitized." });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
