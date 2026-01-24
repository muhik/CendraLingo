import { NextResponse } from "next/server";

export const runtime = "edge";

export async function POST(req: Request) {
    // STEP 1: Basic response test
    let step = "init";

    try {
        step = "parsing_body";
        const body = await req.json();
        const { userId, customAmount } = body;

        step = "validation";
        if (!userId || !customAmount) {
            return NextResponse.json({ success: false, error: "Missing fields", step }, { status: 400 });
        }

        step = "check_env";
        const dbUrl = process.env.TURSO_CONNECTION_URL || "";
        const dbToken = process.env.TURSO_AUTH_TOKEN || "";

        if (!dbUrl || !dbToken) {
            return NextResponse.json({ success: false, error: "Missing env vars", step, hasUrl: !!dbUrl, hasToken: !!dbToken }, { status: 500 });
        }

        step = "generate_order";
        const orderId = `M-${Date.now()}-${userId.substring(0, 5)}`;

        step = "prepare_fetch";
        const finalUrl = dbUrl.startsWith("libsql://")
            ? dbUrl.replace("libsql://", "https://")
            : dbUrl;

        step = "doing_fetch";
        const response = await fetch(`${finalUrl}/v2/pipeline`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${dbToken}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                requests: [
                    {
                        type: "execute",
                        stmt: {
                            sql: "INSERT INTO transactions (order_id, user_id, gross_amount, status, payment_type, transaction_time, created_at, json_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
                            args: [
                                { type: "text", value: orderId },
                                { type: "text", value: String(userId) },
                                { type: "integer", value: String(customAmount) },
                                { type: "text", value: "pending_manual" },
                                { type: "text", value: "manual_transfer" },
                                { type: "text", value: new Date().toISOString() },
                                { type: "integer", value: String(Date.now()) },
                                { type: "text", value: "{}" }
                            ]
                        }
                    },
                    { type: "close" },
                ],
            }),
        });

        step = "checking_response";
        if (!response.ok) {
            const errText = await response.text();
            return NextResponse.json({ success: false, error: "DB Error", status: response.status, detail: errText.substring(0, 100), step }, { status: 500 });
        }

        step = "parsing_response";
        const data = await response.json();

        step = "done";
        return NextResponse.json({ success: true, orderId, step, dbResponse: data.results?.[0]?.type });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            error: error.message,
            step,
            name: error.name
        }, { status: 500 });
    }
}
