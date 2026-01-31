import { NextResponse } from "next/server";

export const runtime = "nodejs";

// NOTE: Do NOT use edge runtime or @libsql/client - use raw fetch to Turso HTTP API

async function tursoExecute(dbUrl: string, dbToken: string, sql: string, args: any[] = []) {
    const finalUrl = dbUrl.startsWith("libsql://")
        ? dbUrl.replace("libsql://", "https://")
        : dbUrl;

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
        throw new Error(`Database Error: ${response.status}`);
    }

    const data = await response.json();
    return data.results[0]?.response?.result;
}

export async function POST(req: Request) {
    const dbUrl = process.env.TURSO_CONNECTION_URL || "";
    const dbToken = process.env.TURSO_AUTH_TOKEN || "";

    if (!dbUrl || !dbToken) {
        return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    try {
        const body = await req.json();
        const { orderId, action } = body;

        if (!orderId || !action) {
            return NextResponse.json({ success: false, error: "Missing fields" }, { status: 400 });
        }

        // Fetch transaction
        const txResult = await tursoExecute(dbUrl, dbToken,
            "SELECT * FROM transactions WHERE order_id = ?",
            [{ type: "text", value: orderId }]
        );

        if (!txResult?.rows || txResult.rows.length === 0) {
            return NextResponse.json({ success: false, error: "Transaction not found" }, { status: 404 });
        }

        // Parse transaction row
        const columns = txResult.cols?.map((c: any) => c.name) || [];
        const row = txResult.rows[0];
        const tx: any = {};
        row.forEach((cell: any, idx: number) => {
            tx[columns[idx]] = cell.value;
        });

        if (action === "reject") {
            await tursoExecute(dbUrl, dbToken,
                "UPDATE transactions SET status = 'deny' WHERE order_id = ?",
                [{ type: "text", value: orderId }]
            );
            return NextResponse.json({ success: true, message: "Transaction Rejected" });
        }

        if (action === "approve") {
            // Update Transaction Status
            await tursoExecute(dbUrl, dbToken,
                "UPDATE transactions SET status = 'settlement' WHERE order_id = ?",
                [{ type: "text", value: orderId }]
            );

            // GRANT REWARDS
            let planType = "GEMS_TOPUP";
            try {
                const jsonData = JSON.parse(String(tx.json_data || "{}"));
                if (jsonData.planType) planType = jsonData.planType;
            } catch (e) { }

            const userId = String(tx.user_id);
            const amountRp = Number(tx.gross_amount);

            if (planType === "JAWARA_PRO" || amountRp >= 49000) {
                const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;
                const expiresAt = Date.now() + thirtyDaysMs;
                await tursoExecute(dbUrl, dbToken,
                    "UPDATE user_progress SET has_active_subscription = 1, points = points + 1000, hearts = 5, subscription_ends_at = ? WHERE user_id = ?",
                    [{ type: "integer", value: String(expiresAt) }, { type: "text", value: userId }]
                );
            } else {
                // Gems Topup
                let gemsToAdd = 0;
                if (amountRp >= 10000) gemsToAdd = 120;
                else if (amountRp >= 5000) gemsToAdd = 55;
                else gemsToAdd = 10;

                await tursoExecute(dbUrl, dbToken,
                    "UPDATE user_progress SET points = points + ? WHERE user_id = ?",
                    [{ type: "integer", value: String(gemsToAdd) }, { type: "text", value: userId }]
                );
            }

            return NextResponse.json({ success: true, message: "Transaction Approved & Rewards Granted" });
        }

        return NextResponse.json({ success: false, error: "Invalid action" }, { status: 400 });

    } catch (error: any) {
        console.error("Manual Approve Error:", error);
        return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
    }
}
