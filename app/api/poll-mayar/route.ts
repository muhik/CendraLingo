// API Route: /api/poll-mayar
// Polls Mayar API for recent transactions and processes them
// Can be called by external cron service (e.g., cron-job.org) every 1-2 minutes

import { NextResponse } from "next/server";
import { tursoQuery, tursoExecute } from "@/db/turso-http";

export const runtime = "nodejs";

export async function GET(req: Request) {
    try {
        const mayarApiKey = process.env.MAYAR_API_KEY;
        const mayarApiUrl = "https://api.mayar.id/hl/v1";

        if (!mayarApiKey) {
            return NextResponse.json({ error: "MAYAR_API_KEY missing" }, { status: 500 });
        }

        // Fetch latest invoices from Mayar - try /invoice endpoint
        const response = await fetch(`${mayarApiUrl}/invoice?limit=50`, {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${mayarApiKey}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("[POLL] Mayar API Error:", response.status, errText);
            return NextResponse.json({ error: "Mayar API Error", status: response.status, details: errText }, { status: 500 });
        }

        const mayarData = await response.json();
        console.log("[POLL] Mayar Response Keys:", Object.keys(mayarData));

        // Extract transactions array
        const transactions = mayarData.data || mayarData.transactions || mayarData.payments || [];

        if (!Array.isArray(transactions)) {
            return NextResponse.json({ error: "Unexpected Mayar response format", data: mayarData }, { status: 500 });
        }

        // DEBUG: Log first transaction structure to understand field names
        if (transactions.length > 0) {
            console.log("[POLL DEBUG] First TX keys:", Object.keys(transactions[0]));
            console.log("[POLL DEBUG] First TX full:", JSON.stringify(transactions[0], null, 2));
        }

        if (!Array.isArray(transactions)) {
            return NextResponse.json({ error: "Unexpected Mayar response format", data: mayarData }, { status: 500 });
        }

        let processed = 0;
        let skipped = 0;
        const errors: string[] = [];

        for (const tx of transactions) {
            try {
                // Extract data from transaction
                const txId = tx.id || tx.transactionId || "";
                const status = tx.status || tx.transactionStatus || "";
                const amount = tx.amount || tx.nettAmount || 0;
                const extraData = tx.extraData || tx.metadata || {};

                // Mayar stores userId and type in external_id with format: "G_userId" or "P_userId"
                const externalId = tx.external_id || tx.externalId || extraData.orderId || "";
                const orderId = externalId || txId;

                // Parse external_id to extract type and userId
                let typeCode = extraData.type || "";
                let userId = extraData.userId || "";

                // Try parsing from external_id if format is "TYPE_USERID"
                if ((!typeCode || !userId) && externalId && externalId.includes("_")) {
                    const parts = externalId.split("_");
                    if (parts.length >= 2) {
                        typeCode = parts[0]; // G or P
                        userId = parts[1];   // userId
                    }
                }

                console.log(`[POLL] Processing tx: ${orderId}, status: ${status}, type: ${typeCode}, userId: ${userId}, amount: ${amount}`);

                // Skip non-success transactions
                if (!["SUCCESS", "PAID", "SETTLED", "success", "paid", "settled"].includes(String(status).toUpperCase())) {
                    skipped++;
                    continue;
                }

                // Skip if no orderId
                if (!orderId) {
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
            } catch (txError) {
                errors.push(String(txError));
            }
        }

        return NextResponse.json({
            success: true,
            processed,
            skipped,
            total: transactions.length,
            errors: errors.length > 0 ? errors : undefined,
            timestamp: new Date().toISOString()
        });

    } catch (error) {
        console.error("[POLL] Error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
