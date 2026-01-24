
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

export async function GET() {
    try {
        // Direct attempt to add the specific missing column
        // We do this blindly. If it fails, it likely exists or table doesn't exist.

        let log = "";

        try {
            await tursoExecute("ALTER TABLE treasure_settings ADD COLUMN paid4link_url TEXT");
            log = "Added paid4link_url column SUCCESS.";
        } catch (e: any) {
            log = `Attempted add column, result: ${String(e)}`;
        }

        // Verify result by selecting it
        let verify = "Check skipped";
        try {
            const check = await tursoExecute("SELECT paid4link_url FROM treasure_settings LIMIT 1");
            verify = "Column EXISTS and is selectable.";
        } catch (e) {
            verify = "Column still NOT selectable.";
        }

        return NextResponse.json({
            message: "Simple Fix Attempted",
            log: log,
            verification: verify
        });

    } catch (error: any) {
        return NextResponse.json({ error: String(error) }, { status: 200 }); // Return 200 to see error in browser
    }
}
