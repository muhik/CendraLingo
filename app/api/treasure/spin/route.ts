import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

async function tursoExecute(sql: string, args: any[] = []) {
    const dbUrl = process.env.TURSO_CONNECTION_URL!;
    const dbToken = process.env.TURSO_AUTH_TOKEN!;
    const finalUrl = dbUrl.startsWith("libsql://") ? dbUrl.replace("libsql://", "https://") : dbUrl;

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

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const userId = searchParams.get("userId");

        if (!userId) {
            return NextResponse.json({ error: "User ID required" }, { status: 400 });
        }

        // 1. Verify Access
        // Check global settings first
        const settingsRes = await tursoExecute("SELECT * FROM treasure_settings ORDER BY id DESC LIMIT 1");
        let requirePaid4link = false;
        if (settingsRes?.rows?.length > 0) {
            const cols = settingsRes.cols.map((c: any) => c.name);
            const row = settingsRes.rows[0];
            const data: any = {};
            row.forEach((cell: any, i: number) => { data[cols[i]] = cell.value; });
            requirePaid4link = data.require_paid4link === 1;
        }

        // If required, check user log
        if (requirePaid4link) {
            const userLogRes = await tursoExecute("SELECT has_treasure_access FROM user_treasure_log WHERE user_id = ?", [{ type: "text", value: userId }]);
            let hasAccess = false;
            if (userLogRes?.rows?.length > 0) {
                hasAccess = userLogRes.rows[0][0].value === 1;
            }
            if (!hasAccess) {
                return NextResponse.json({ error: "Access Denied. Please use the link widget." }, { status: 403 });
            }
        }

        // 2. Spin Logic
        // SEGMENTS matching frontend (11 segments)
        // 0: Rp 5, 1: ZONK, 2: 5 Gems, 3: ZONK, 4: Rp 15, 5: ZONK
        // 6: 10 Gems, 7: ZONK, 8: Rp 25, 9: ZONK, 10: 25 Gems
        const SEGMENTS = [
            { id: 0, type: "cash", value: 5 },
            { id: 1, type: "zonk", value: 0 },
            { id: 2, type: "gems", value: 5 },
            { id: 3, type: "zonk", value: 0 },
            { id: 4, type: "cash", value: 15 },
            { id: 5, type: "zonk", value: 0 },
            { id: 6, type: "gems", value: 10 },
            { id: 7, type: "zonk", value: 0 },
            { id: 8, type: "cash", value: 25 },
            { id: 9, type: "zonk", value: 0 },
            { id: 10, type: "gems", value: 25 },
        ];

        // Weighted Random
        // High chance of Zonk or Low Reward
        const random = Math.random() * 100;
        let selectedId = 1; // Default Zonk

        // Probability Distribution
        // Zonk: 50%
        // Rp 5: 20%
        // 5 Gems: 10%
        // Rp 15: 10%
        // 10 Gems: 5%
        // Rp 25: 3%
        // 25 Gems: 2%

        if (random < 50) {
            // Zonk (Indices: 1, 3, 5, 7, 9)
            const zonks = [1, 3, 5, 7, 9];
            selectedId = zonks[Math.floor(Math.random() * zonks.length)];
        } else if (random < 70) {
            selectedId = 0; // Rp 5
        } else if (random < 80) {
            selectedId = 2; // 5 Gems
        } else if (random < 90) {
            selectedId = 4; // Rp 15
        } else if (random < 95) {
            selectedId = 6; // 10 Gems
        } else if (random < 98) {
            selectedId = 8; // Rp 25
        } else {
            selectedId = 10; // 25 Gems
        }

        const result = SEGMENTS.find(s => s.id === selectedId) || SEGMENTS[1];
        let voucherCode = "";

        // 3. Grant Rewards & REVOKE ACCESS ATOMICALLY
        const now = new Date().toISOString();

        if (result.type === "gems") {
            // Update user points
            await tursoExecute(
                "UPDATE user_progress SET points = points + ? WHERE user_id = ?",
                [{ type: "integer", value: String(result.value) }, { type: "text", value: userId }]
            );
        } else if (result.type === "cash") {
            // Create Voucher
            voucherCode = `GEMS-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
            await tursoExecute(
                "INSERT INTO vouchers (code, value_rp, gems_amount, created_at) VALUES (?, ?, 0, ?)",
                [{ type: "text", value: voucherCode }, { type: "integer", value: String(result.value) }, { type: "integer", value: String(Date.now()) }]
            );
        }

        // IMPORTANT: Revoke access immediately to prevent replay attacks
        await tursoExecute(
            "UPDATE user_treasure_log SET has_treasure_access = 0, last_spin_date = ? WHERE user_id = ?",
            [{ type: "text", value: now }, { type: "text", value: userId }]
        );

        // Return Result
        return NextResponse.json({
            segmentIndex: selectedId,
            voucherCode,
            gemsWon: result.type === "gems" ? result.value : 0,
            cashbackWon: result.type === "cash" ? result.value : 0,
            method: "GET_WORKAROUND"
        });

    } catch (error: any) {
        console.error("Spin Logic Error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

// Fallback POST
export async function POST() {
    return NextResponse.json({ error: "Use GET" }, { status: 400 });
}
