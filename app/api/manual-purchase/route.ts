import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const turso = createClient({
    url: process.env.TURSO_CONNECTION_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
});

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, planType, customAmount, paymentMethod } = body;

        // Validation
        if (!userId || !customAmount) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Generate a pseudo Order ID for manual transaction
        // Format: M-[random]-[userId]
        const orderId = `M-${Math.random().toString(36).substring(2, 7).toUpperCase()}_${userId}_${Date.now()}`;

        // Insert into Transactions Table with status 'pending_manual'
        await turso.execute({
            sql: "INSERT INTO transactions (order_id, user_id, gross_amount, status, payment_type, transaction_time, created_at, json_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
            args: [
                orderId,
                userId,
                customAmount,
                "pending_manual", // Special status for Admin Approval
                paymentMethod || "manual_transfer", // "BCA" or "QRIS"
                new Date().toISOString(),
                Date.now(),
                JSON.stringify({ planType, note: "User claimed they have transferred manually." })
            ]
        });

        return NextResponse.json({
            success: true,
            orderId,
            message: "Manual payment submitted. Waiting for Admin approval."
        });

    } catch (error) {
        console.error("Manual Purchase Error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
