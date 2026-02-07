// Temporary API to add missing gems
// DELETE AFTER USE
import { NextResponse } from "next/server";
import { tursoExecute, tursoQuery } from "@/db/turso-http";

export const runtime = "nodejs";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const action = url.searchParams.get("action");
        const userId = url.searchParams.get("userId");
        const gems = parseInt(url.searchParams.get("gems") || "10");

        // List users
        if (action === "list") {
            const users = await tursoQuery("SELECT user_id, points, hearts, has_active_subscription FROM user_progress ORDER BY points DESC LIMIT 10");
            return NextResponse.json({ users });
        }

        // List transactions for a user
        if (action === "list_tx" && userId) {
            const txs = await tursoQuery("SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 20", [userId]);
            return NextResponse.json({ txs });
        }

        // Add gems
        if (action === "add" && userId) {
            await tursoExecute("UPDATE user_progress SET points = points + ? WHERE user_id = ?", [gems, userId]);
            const updated = await tursoQuery("SELECT points FROM user_progress WHERE user_id = ?", [userId]);
            return NextResponse.json({
                success: true,
                message: `Added ${gems} gems to ${userId}`,
                newPoints: updated[0]?.points
            });
        }

        return NextResponse.json({
            error: "Usage: ?action=list or ?action=add&userId=xxx&gems=10",
            warning: "DELETE THIS FILE AFTER USE!"
        });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
