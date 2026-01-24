
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
        // 1. Check Table Content
        const content = await tursoExecute("SELECT * FROM treasure_settings");

        // 2. Check Table Info (Columns)
        const info = await tursoExecute("PRAGMA table_info(treasure_settings)");

        return NextResponse.json({
            table_info: info,
            rows: content
        });

    } catch (error: any) {
        return NextResponse.json({ error: String(error) }, { status: 500 });
    }
}
