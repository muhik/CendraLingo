import { NextResponse } from "next/server";

export const runtime = "edge";

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
            return NextResponse.json({ hasAccess: false, alreadySpunToday: false });
        }

        // 1. Get Settings
        const settingsRes = await tursoExecute("SELECT * FROM treasure_settings ORDER BY id DESC LIMIT 1");
        let settings = { paid4linkUrl: "", isEnabled: true, requirePaid4link: false };

        if (settingsRes?.rows?.length > 0) {
            const cols = settingsRes.cols.map((c: any) => c.name);
            const row = settingsRes.rows[0];
            const data: any = {};
            row.forEach((cell: any, i: number) => {
                data[cols[i]] = cell.value;
            });
            settings = {
                paid4linkUrl: data.paid4link_url || "",
                isEnabled: data.is_enabled === 1,
                requirePaid4link: data.require_paid4link === 1
            };
        }

        if (!settings.isEnabled) {
            return NextResponse.json({ hasAccess: false, alreadySpunToday: false, settings });
        }

        // 2. Get User Log
        const userLogRes = await tursoExecute("SELECT * FROM user_treasure_log WHERE user_id = ?", [{ type: "text", value: userId }]);
        let hasAccess = false;
        let lastSpinDateStr = null;

        if (userLogRes?.rows?.length > 0) {
            const cols = userLogRes.cols.map((c: any) => c.name);
            const row = userLogRes.rows[0];
            const data: any = {};
            row.forEach((cell: any, i: number) => {
                data[cols[i]] = cell.value;
            });

            hasAccess = data.has_treasure_access === 1;
            lastSpinDateStr = data.last_spin_date;
        }

        // Check if spun today
        let alreadySpunToday = false;
        if (lastSpinDateStr) {
            const today = new Date().toISOString().split("T")[0]; // YYYY-MM-DD
            // lastSpinDate is expected to be ISO string or date string
            const lastSpin = new Date(lastSpinDateStr).toISOString().split("T")[0];
            if (today === lastSpin) {
                alreadySpunToday = true;
            }
        }

        // If Paid4Link is NOT required, grant access automatically
        if (!settings.requirePaid4link) {
            hasAccess = true;
        }

        return NextResponse.json({
            hasAccess,
            alreadySpunToday,
            settings
        });

    } catch (error: any) {
        console.error("Access Check Error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, action } = body;

        if (!userId || !action) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        if (action === "setAccess") {
            const now = new Date().toISOString();
            // Check if exists
            const check = await tursoExecute("SELECT id FROM user_treasure_log WHERE user_id = ?", [{ type: "text", value: userId }]);

            if (check?.rows?.length > 0) {
                await tursoExecute(
                    "UPDATE user_treasure_log SET has_treasure_access = 1, treasure_access_date = ? WHERE user_id = ?",
                    [{ type: "text", value: now }, { type: "text", value: userId }]
                );
            } else {
                await tursoExecute(
                    "INSERT INTO user_treasure_log (user_id, has_treasure_access, treasure_access_date) VALUES (?, 1, ?)",
                    [{ type: "text", value: userId }, { type: "text", value: now }]
                );
            }
            return NextResponse.json({ success: true });
        }

        if (action === "recordSpin") {
            const now = new Date().toISOString();
            const check = await tursoExecute("SELECT id FROM user_treasure_log WHERE user_id = ?", [{ type: "text", value: userId }]);

            if (check?.rows?.length > 0) {
                // Revoke access after spin and set last spin date
                await tursoExecute(
                    "UPDATE user_treasure_log SET has_treasure_access = 0, last_spin_date = ? WHERE user_id = ?",
                    [{ type: "text", value: now }, { type: "text", value: userId }]
                );
            } else {
                await tursoExecute(
                    "INSERT INTO user_treasure_log (user_id, has_treasure_access, last_spin_date) VALUES (?, 0, ?)",
                    [{ type: "text", value: userId }, { type: "text", value: now }]
                );
            }
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Invalid action" }, { status: 400 });

    } catch (error: any) {
        console.error("Access Action Error:", error);
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
