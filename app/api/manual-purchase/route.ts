import { NextResponse } from "next/server";

// NOTE: Do NOT use "export const runtime = edge" - causes Cloudflare crash!

export async function POST(req: Request) {
    // Check env vars first
    const dbUrl = process.env.TURSO_CONNECTION_URL || "";
    const dbToken = process.env.TURSO_AUTH_TOKEN || "";

    if (!dbUrl || !dbToken) {
        return NextResponse.json({
            success: false,
            error: "Database not configured"
        }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { userId, planType, customAmount, paymentMethod } = body;

        // Validation
        if (!userId || !customAmount) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        // Generate Order ID
        const orderId = `M-${Math.random().toString(36).substring(2, 7).toUpperCase()}_${userId}_${Date.now()}`;

        // Convert URL format (libsql:// -> https://)
        const finalUrl = dbUrl.startsWith("libsql://")
            ? dbUrl.replace("libsql://", "https://")
            : dbUrl;

        // Turso HTTP API request
        const sql = "INSERT INTO transactions (order_id, user_id, gross_amount, status, payment_type, transaction_time, created_at, json_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
        const args = [
            { type: "text", value: orderId },
            { type: "text", value: String(userId) },
            { type: "integer", value: String(customAmount) },
            { type: "text", value: "pending_manual" },
            { type: "text", value: paymentMethod || "manual_transfer" },
            { type: "text", value: new Date().toISOString() },
            { type: "integer", value: String(Date.now()) },
            { type: "text", value: JSON.stringify({ planType, note: "User claimed manual transfer" }) }
        ];

        const response = await fetch(`${finalUrl}/v2/pipeline`, {
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
            return NextResponse.json({
                success: false,
                error: `Database Error: ${response.status}`,
                detail: errText.substring(0, 100)
            }, { status: 500 });
        }

        const data = await response.json();

        // Check for Turso errors
        if (data.results && data.results[0]?.type === "error") {
            return NextResponse.json({
                success: false,
                error: "Database query failed",
                detail: JSON.stringify(data.results[0])
            }, { status: 500 });
        }

        return NextResponse.json({
            success: true,
            orderId,
            message: "Manual payment submitted. Waiting for Admin approval."
        });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message || String(error)
        }, { status: 500 });
    }
}

export async function GET() {
    return NextResponse.json({
        success: true,
        message: "Manual Purchase API is alive",
        timestamp: Date.now()
    });
}
