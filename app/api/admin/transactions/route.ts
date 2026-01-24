import { NextResponse } from "next/server";

// NOTE: Do NOT use edge runtime or @libsql/client - use raw fetch to Turso HTTP API

export async function GET(req: Request) {
    const dbUrl = process.env.TURSO_CONNECTION_URL || "";
    const dbToken = process.env.TURSO_AUTH_TOKEN || "";

    if (!dbUrl || !dbToken) {
        return NextResponse.json({ success: false, error: "Database not configured" }, { status: 500 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = (page - 1) * limit;

        const finalUrl = dbUrl.startsWith("libsql://")
            ? dbUrl.replace("libsql://", "https://")
            : dbUrl;

        // Fetch transactions with pagination
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
                            sql: "SELECT * FROM transactions ORDER BY created_at DESC LIMIT ? OFFSET ?",
                            args: [
                                { type: "integer", value: String(limit) },
                                { type: "integer", value: String(offset) }
                            ]
                        }
                    },
                    {
                        type: "execute",
                        stmt: { sql: "SELECT COUNT(*) as total FROM transactions" }
                    },
                    { type: "close" },
                ],
            }),
        });

        if (!response.ok) {
            const errText = await response.text();
            return NextResponse.json({ success: false, error: `DB Error: ${response.status}`, detail: errText }, { status: 500 });
        }

        const data = await response.json();

        // Parse Turso response
        const transactionsResult = data.results[0]?.response?.result;
        const countResult = data.results[1]?.response?.result;

        // Convert Turso rows to plain objects
        const columns = transactionsResult?.cols?.map((c: any) => c.name) || [];
        const rows = transactionsResult?.rows?.map((row: any) => {
            const obj: any = {};
            row.forEach((cell: any, idx: number) => {
                obj[columns[idx]] = cell.value;
            });
            return obj;
        }) || [];

        const total = countResult?.rows?.[0]?.[0]?.value || 0;

        return NextResponse.json({
            success: true,
            data: rows,
            pagination: {
                page,
                limit,
                total: Number(total),
                totalPages: Math.ceil(Number(total) / limit)
            }
        });

    } catch (error: any) {
        console.error("Fetch transactions error:", error);
        return NextResponse.json({ success: false, error: error.message || String(error) }, { status: 500 });
    }
}
