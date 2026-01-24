import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
    try {
        console.log("📨 [API] Manual Purchase Request received (Raw Fetch Mode)");
        const body = await req.json();
        const { userId, planType, customAmount, paymentMethod } = body;

        console.log("📦 [API] Payload:", { userId, customAmount });

        // Validation
        if (!userId || !customAmount) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Generate a pseudo Order ID for manual transaction
        const orderId = `M-${Math.random().toString(36).substring(2, 7).toUpperCase()}_${userId}_${Date.now()}`;

        // Prepare SQL
        const sql = "INSERT INTO transactions (order_id, user_id, gross_amount, status, payment_type, transaction_time, created_at, json_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const args = [
            orderId,
            userId,
            customAmount,
            "pending_manual",
            paymentMethod || "manual_transfer",
            new Date().toISOString(),
            Date.now(),
            JSON.stringify({ planType, note: "User claimed they have transferred manually." })
        ];

        // TURSO RAW FETCH
        const dbUrl = process.env.TURSO_CONNECTION_URL?.replace("libsql://", "https://") || "";
        const dbToken = process.env.TURSO_AUTH_TOKEN;

        if (!dbUrl || !dbToken) {
            throw new Error("Missing Database Credentials");
        }

        console.log("🚀 [API] Executing RAW SQL via HTTP...");

        const response = await fetch(`${dbUrl}/v2/pipeline`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${dbToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                requests: [
                    { type: "execute", stmt: { sql, args } },
                    { type: "close" },
                ],
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error("❌ [API] Turso HTTP Error:", errText);
            throw new Error(`Database Error: ${response.status} ${errText}`);
        }

        const data = await response.json();
        console.log("✅ [API] Turso Response:", JSON.stringify(data));

        return NextResponse.json({
            success: true,
            orderId,
            message: "Manual payment submitted. Waiting for Admin approval."
        });

    } catch (error) {
        console.error("❌ [API] Manual Purchase Crash:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
