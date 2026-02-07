import { NextResponse } from "next/server";
import { tursoExecute, tursoQuery } from "@/db/turso-http";

export const runtime = "nodejs";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const action = url.searchParams.get("action");
        const userId = url.searchParams.get("userId");

        // List users
        if (action === "list") {
            const users = await tursoQuery("SELECT user_id, points, hearts, has_active_subscription FROM user_progress ORDER BY points DESC LIMIT 10");
            return NextResponse.json({ users });
        }

        // List transactions
        if (action === "list_tx") {
            let sql = "SELECT * FROM transactions ORDER BY created_at DESC LIMIT 50";
            let args = [];
            if (userId) {
                sql = "SELECT * FROM transactions WHERE user_id = ? ORDER BY created_at DESC LIMIT 50";
                args = [userId];
            }
            const txs = await tursoQuery(sql, args);
            return NextResponse.json({ txs });
        }

        // Delete transaction
        if (action === "delete_tx") {
            const orderId = url.searchParams.get("orderId");
            if (orderId) {
                await tursoExecute("DELETE FROM transactions WHERE order_id = ?", [orderId]);
                return NextResponse.json({ success: true, message: `Deleted ${orderId}` });
            }
        }

        // Deduct gems
        if (action === "deduct") {
            const amount = parseInt(url.searchParams.get("gems") || "0");
            if (userId && amount > 0) {
                await tursoExecute("UPDATE user_progress SET points = points - ? WHERE user_id = ?", [amount, userId]);
                const updated = await tursoQuery("SELECT points FROM user_progress WHERE user_id = ?", [userId]);
                return NextResponse.json({ success: true, newPoints: updated[0]?.points });
            }
        }

        // Add gems (keep for future use if needed)
        if (action === "add" && userId) {
            const gems = parseInt(url.searchParams.get("gems") || "10");
            await tursoExecute("UPDATE user_progress SET points = points + ? WHERE user_id = ?", [gems, userId]);
            const updated = await tursoQuery("SELECT points FROM user_progress WHERE user_id = ?", [userId]);
            return NextResponse.json({ success: true, message: `Added ${gems} gems`, newPoints: updated[0]?.points });
        }

        return NextResponse.json({ error: "Invalid action" });
    } catch (error) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
