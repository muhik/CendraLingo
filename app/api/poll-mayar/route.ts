// API Route: /api/poll-mayar
// Polls Mayar API for recent transactions and processes them
// Can be called by external cron service (e.g., cron-job.org) every 1-2 minutes

import { NextResponse } from "next/server";

// Re-use tursoExecute from main route (or import separately)
const TURSO_URL = process.env.TURSO_CONNECTION_URL || "";
const TURSO_TOKEN = process.env.TURSO_AUTH_TOKEN || "";

async function tursoExecute(sql: string, args: any[] = []) {
    const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${TURSO_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            requests: [{ type: "execute", stmt: { sql, args: args.map(a => ({ type: "text", value: String(a) })) } }, { type: "close" }]
        })
    });
    const data = await res.json();
    return data;
}

async function tursoQuery(sql: string, args: any[] = []) {
    const res = await fetch(`${TURSO_URL}/v2/pipeline`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${TURSO_TOKEN}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            requests: [{ type: "execute", stmt: { sql, args: args.map(a => ({ type: "text", value: String(a) })) } }, { type: "close" }]
        })
    });
    const data = await res.json();
    const result = data.results?.[0]?.response?.result;
    if (!result?.rows) return [];
    const cols = result.cols.map((c: any) => c.name);
    return result.rows.map((row: any) => {
        const obj: any = {};
        row.forEach((val: any, i: number) => { obj[cols[i]] = val?.value ?? val; });
        return obj;
    });
}

export const runtime = "nodejs";

export async function GET(req: Request) {
    try {
        const mayarApiKey = process.env.MAYAR_API_KEY;
        const mayarApiUrl = "https://api.mayar.id/hl/v1";

        if (!mayarApiKey) {
            return NextResponse.json({ error: "MAYAR_API_KEY missing" }, { status: 500 });
        }

        // Fetch latest transactions from Mayar (last 24 hours)
        // Endpoint: GET /transactions (or /payment/list)
        const response = await fetch(`${mayarApiUrl}/payment/list?limit=50`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${mayarApiKey}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("[POLL] Mayar API Error:", response.status, errText);
            return NextResponse.json({ error: "Mayar API Error", details: errText }, { status: 500 });
        }

        const mayarData = await response.json();
        console.log("[POLL] Mayar Response:", JSON.stringify(mayarData).substring(0, 500));

        // Extract transactions array (adjust based on actual Mayar response structure)
        const transactions = mayarData.data || mayarData.transactions || mayarData.payments || [];

        let processed = 0;
        let skipped = 0;

        for (const tx of transactions) {
            // Extract data from transaction
            const txId = tx.id || tx.transactionId || "";
            const status = tx.status || tx.transactionStatus || "";
            const amount = tx.amount || tx.nettAmount || 0;
            const extraData = tx.extraData || tx.metadata || {};

            const userId = extraData.userId || "";
            const typeCode = extraData.type || "";
            const orderId = extraData.orderId || txId;

            // Skip non-success transactions
            if (!["SUCCESS", "PAID", "SETTLED", "success", "paid", "settled"].includes(String(status).toUpperCase())) {
                skipped++;
                continue;
            }

            // Check if already processed
            const existing = await tursoQuery("SELECT order_id FROM transactions WHERE order_id = ?", [orderId]);
            if (existing.length > 0) {
                skipped++;
                continue;
            }

            // Insert transaction
            await tursoExecute(
                "INSERT INTO transactions (order_id, user_id, gross_amount, status, payment_type, transaction_time, json_data, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                [orderId, userId || "unknown", amount, status, "MAYAR", new Date().toISOString(), JSON.stringify(tx), Date.now()]
            );

            // Update user based on type
            if (userId) {
                if (typeCode === "G") {
                    // Gems
                    const paidRp = Math.floor(Number(amount));
                    let gemsToAdd = 10;
                    if (paidRp >= 10000) gemsToAdd = 120;
                    else if (paidRp >= 5000) gemsToAdd = 55;

                    await tursoExecute("UPDATE user_progress SET points = points + ? WHERE user_id = ?", [gemsToAdd, userId]);
                    console.log(`[POLL] Added ${gemsToAdd} gems to user ${userId}`);
                } else if (typeCode === "P") {
                    // Pro Subscription
                    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
                    const expiresAt = Date.now() + thirtyDaysMs;
                    await tursoExecute(
                        "UPDATE user_progress SET has_active_subscription = 1, points = points + 1000, hearts = 5, subscription_ends_at = ? WHERE user_id = ?",
                        [expiresAt, userId]
                    );
                    console.log(`[POLL] Activated PRO for user ${userId}`);
                }
            }

            processed++;
        }

        return NextResponse.json({
            success: true,
            processed,
            skipped,
            total: transactions.length,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("[POLL] Error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
