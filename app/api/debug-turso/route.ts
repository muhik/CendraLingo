
import { NextResponse } from "next/server";

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

export async function GET() {
    try {
        // 1. Get Table Schema (Column Names)
        const schema = await tursoExecute("PRAGMA table_info(treasure_settings)");

        // 2. Get All Data
        const rows = await tursoExecute("SELECT * FROM treasure_settings ORDER BY id DESC LIMIT 5");

        return NextResponse.json({
            message: "🔎 LIVE TURSO DATA INSPECTION",
            schema_info: schema,
            raw_data: rows
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
