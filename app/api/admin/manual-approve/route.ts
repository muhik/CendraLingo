import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const turso = createClient({
    url: process.env.TURSO_CONNECTION_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
});

export const runtime = "nodejs";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { orderId, action } = body;

        if (!orderId || !action) {
            return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
        }

        // Fetch transaction
        const txRes = await turso.execute({
            sql: "SELECT * FROM transactions WHERE order_id = ?",
            args: [orderId]
        });

        if (txRes.rows.length === 0) {
            return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
        }

        const tx = txRes.rows[0];

        if (action === "reject") {
            await turso.execute({
                sql: "UPDATE transactions SET status = 'deny' WHERE order_id = ?",
                args: [orderId]
            });
            return NextResponse.json({ success: true, message: "Transaction Rejected" });
        }

        if (action === "approve") {
            // Update Transaction Status
            await turso.execute({
                sql: "UPDATE transactions SET status = 'settlement' WHERE order_id = ?",
                args: [orderId]
            });

            // GRANT REWARDS
            // Parse plan from json_data or infer
            let planType = "GEMS_TOPUP";
            try {
                const jsonData = JSON.parse(String(tx.json_data || "{}"));
                if (jsonData.planType) planType = jsonData.planType;
            } catch (e) { }

            const userId = String(tx.user_id);
            const amountRp = Number(tx.gross_amount);

            if (planType === "JAWARA_PRO" || amountRp >= 49000) {
                await turso.execute("UPDATE user_progress SET has_active_subscription = 1, points = points + 1000, hearts = 5 WHERE user_id = ?", [userId]);
            } else {
                // Gems Topup
                let gemsToAdd = 0;
                if (amountRp >= 10000) gemsToAdd = 120;
                else if (amountRp >= 5000) gemsToAdd = 55;
                else gemsToAdd = 10;

                await turso.execute("UPDATE user_progress SET points = points + ? WHERE user_id = ?", [gemsToAdd, userId]);
            }

            return NextResponse.json({ success: true, message: "Transaction Approved & Rewards Granted" });
        }

        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });

    } catch (error) {
        console.error("Manual Approve Error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
