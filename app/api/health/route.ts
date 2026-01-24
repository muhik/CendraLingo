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
    let logs = [];
    try {
        logs.push("Starting Migration...");

        // 1. Create Table if not exists (Safe)
        try {
            await tursoExecute(`
                CREATE TABLE IF NOT EXISTS treasure_settings (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    paid4link_url TEXT,
                    is_enabled INTEGER DEFAULT 1,
                    require_paid4link INTEGER DEFAULT 0,
                    updated_at INTEGER
                )
            `);
            logs.push("Create Table: Success (or existed)");
        } catch (e) {
            logs.push("Create Table Error: " + e);
        }

        // 2. Add Column (This is the critical fix)
        try {
            await tursoExecute("ALTER TABLE treasure_settings ADD COLUMN paid4link_url TEXT");
            logs.push("Add Column 'paid4link_url': SUCCESS");
        } catch (e) {
            logs.push("Add Column 'paid4link_url': " + e); // Will fail if exists, that is OK.
        }

        // 3. Verify
        const check = await tursoExecute("PRAGMA table_info(treasure_settings)");

        return NextResponse.json({
            status: "MIGRATION_ATTEMPTED",
            logs,
            final_schema: check
        });

    } catch (error: any) {
        return NextResponse.json({ status: "CRITIAL_ERROR", error: String(error), logs });
    }
}
