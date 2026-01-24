import { NextResponse } from "next/server";

export const runtime = "edge";
export const dynamic = "force-dynamic";

async function tursoExecute(sql: string) {
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
                { type: "execute", stmt: { sql, args: [] } },
                { type: "close" },
            ],
        }),
    });

    if (!response.ok) {
        throw new Error(`DB Error: ${response.status}`);
    }

    const data = await response.json();
    return data.results[0]?.response?.result;
}

export async function GET() {
    try {
        // READ-ONLY: Just dump table content
        const data = await tursoExecute("SELECT * FROM treasure_settings ORDER BY id DESC LIMIT 5");

        return NextResponse.json({
            status: "DEBUG_READ_ONLY",
            treasure_settings: data
        });

    } catch (error: any) {
        return NextResponse.json({
            status: "ERROR",
            error: String(error)
        });
    }
}
