
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
            const cell = row[i];
            obj[col] = (cell && typeof cell === 'object' && 'value' in cell) ? cell.value : cell;
        });
        return obj;
    });
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, courseId, timestamp } = body;

        console.log(`[MANAGER_NOTIFY] User ${userId} Completed Course ${courseId} at ${timestamp}`);

        // 1. Fetch User Details for nicer notification
        // Try user_progress first
        let userName = "Unknown User";
        let userImage = "/mascot.svg";

        const progressRaw = await tursoExecute(
            "SELECT user_name, user_image FROM user_progress WHERE user_id = ?",
            [{ type: "text", value: userId }]
        );
        const progressRows = mapRows(progressRaw);

        if (progressRows.length > 0) {
            userName = progressRows[0].user_name || "User";
            userImage = progressRows[0].user_image || "/mascot.svg";
        } else {
            // Fallback to users table
            const userRaw = await tursoExecute(
                "SELECT name, '/mascot.svg' as user_image FROM users WHERE id = ?",
                [{ type: "text", value: userId }]
            );
            const userRows = mapRows(userRaw);
            if (userRows.length > 0) {
                userName = userRows[0].name || "User";
            }
        }

        // 2. Insert Notification
        await tursoExecute(
            "INSERT INTO manager_notifications (user_id, user_name, user_image, type, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            [
                { type: "text", value: userId },
                { type: "text", value: userName },
                { type: "text", value: userImage },
                { type: "text", value: "course_completion" },
                { type: "text", value: `User ${userName} telah menyelesaikan kursus! (Unit & Block Habis)` },
                { type: "integer", value: "0" },
                { type: "text", value: new Date().toISOString() }
            ]
        );

        return NextResponse.json({ success: true, message: "Manager notified successfully" });
    } catch (error) {
        console.error("Notify Manager Error:", error);
        return NextResponse.json({ success: false, error: "Failed to notify manager" }, { status: 500 });
    }
}
