
import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const turso = createClient({
    url: process.env.TURSO_CONNECTION_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN || "",
});

export const runtime = "nodejs";

export async function GET(req: Request) {
    try {
        const url = new URL(req.url);
        const limit = url.searchParams.get("limit") || "20";

        const res = await turso.execute({
            sql: `SELECT * FROM manager_notifications ORDER BY created_at DESC LIMIT ?`,
            args: [Number(limit)]
        });

        // Count unread
        const countRes = await turso.execute("SELECT COUNT(*) as count FROM manager_notifications WHERE is_read = 0");
        const unreadCount = Number(countRes.rows[0]?.count || 0);

        return NextResponse.json({
            success: true,
            data: res.rows,
            unreadCount
        });
    } catch (error) {
        console.error("Fetch Notifications Error:", error);
        return NextResponse.json({ success: false, error: "Failed to fetch notifications" }, { status: 500 });
    }
}

export async function POST(req: Request) {
    // Mark as read or Clear
    try {
        const body = await req.json();
        const { action, id } = body;

        if (action === "mark_read") {
            if (id) {
                await turso.execute({
                    sql: "UPDATE manager_notifications SET is_read = 1 WHERE id = ?",
                    args: [id]
                });
            } else {
                // Mark all read
                await turso.execute("UPDATE manager_notifications SET is_read = 1 WHERE is_read = 0");
            }
        } else if (action === "delete") {
            await turso.execute({
                sql: "DELETE FROM manager_notifications WHERE id = ?",
                args: [id]
            });
        }

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ success: false, error: "Update failed" }, { status: 500 });
    }
}
