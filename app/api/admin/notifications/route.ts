
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Raw Turso Executor
async function tursoExecute(sql: string, args: any[] = []) {
    const dbUrl = process.env.TURSO_CONNECTION_URL!;
    const dbToken = process.env.TURSO_AUTH_TOKEN!;
    const finalUrl = dbUrl.startsWith("libsql://") ? dbUrl.replace("libsql://", "https://") : dbUrl;

    const response = await fetch(`${finalUrl}/v2/pipeline`, {
        method: "POST",
        headers: { "Authorization": `Bearer ${dbToken}`, "Content-Type": "application/json" },
        body: JSON.stringify({
            requests: [
                { type: "execute", stmt: { sql, args } },
                { type: "close" },
            ],
        }),
    });

    if (!response.ok) throw new Error(`Database Error: ${response.status}`);
    const data = await response.json();
    return data.results[0]?.response?.result;
}

// Helper to map Turso raw rows to objects
function mapRows(result: any) {
    if (!result || !result.cols || !result.rows) return [];
    const cols = result.cols.map((c: any) => c.name);
    return result.rows.map((row: any) => {
        const obj: any = {};
        cols.forEach((col: string, i: number) => {
            // raw row items might be { type: "text", value: "foo" } or just "foo"
            // usually in v2 pipeline it is { type, value }
            const cell = row[i];
            obj[col] = (cell && typeof cell === 'object' && 'value' in cell) ? cell.value : cell;
        });
        return obj;
    });
}

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const limit = url.searchParams.get("limit") || "20";

        // Fetch
        const rawRes = await tursoExecute(
            `SELECT * FROM manager_notifications ORDER BY created_at DESC LIMIT ?`,
            [{ type: "integer", value: String(limit) }]
        );
        const data = mapRows(rawRes);

        // Count unread
        const rawCount = await tursoExecute("SELECT COUNT(*) as count FROM manager_notifications WHERE is_read = 0");
        const countData = mapRows(rawCount);
        const unreadCount = Number(countData[0]?.count || 0);

        return NextResponse.json({
            success: true,
            data,
            unreadCount
        });
    } catch (error) {
        console.error("Fetch Notifications Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { action, id } = body;

        if (action === "mark_read") {
            if (id) {
                await tursoExecute(
                    "UPDATE manager_notifications SET is_read = 1 WHERE id = ?",
                    [{ type: "integer", value: String(id) }]
                );
            } else {
                await tursoExecute("UPDATE manager_notifications SET is_read = 1 WHERE is_read = 0");
            }
        } else if (action === "delete") {
            await tursoExecute(
                "DELETE FROM manager_notifications WHERE id = ?",
                [{ type: "integer", value: String(id) }]
            );
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    }
}
