import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const turso = createClient({
    url: process.env.TURSO_CONNECTION_URL || "",
    authToken: process.env.TURSO_AUTH_TOKEN || "",
});

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { userId, courseId, timestamp } = body;

        console.log(`[MANAGER_NOTIFY] User ${userId} Completed Course ${courseId} at ${timestamp}`);

        // 1. Fetch User Details for nicer notification
        const userRes = await turso.execute({
            sql: "SELECT name, user_image FROM users JOIN user_progress ON users.id = user_progress.user_id WHERE users.id = ?",
            args: [userId]
        });

        let userName = "Unknown User";
        let userImage = "/mascot.svg";

        if (userRes.rows.length > 0) {
            userName = userRes.rows[0].name as string || "User";
            // Check if user_progress has name/image override or use users table
            // Actually schema has user_progress.userName too. Let's just use what we found.
            // The query above joins, but user_progress is the main profile source usually.
            // Let's simplified fetch from user_progress directly.
        }

        // Simpler Fetch
        const progressRes = await turso.execute({
            sql: "SELECT user_name, user_image FROM user_progress WHERE user_id = ?",
            args: [userId]
        });

        if (progressRes.rows.length > 0) {
            userName = progressRes.rows[0].user_name as string;
            userImage = progressRes.rows[0].user_image as string;
        }

        // 2. Insert Notification
        await turso.execute({
            sql: "INSERT INTO manager_notifications (user_id, user_name, user_image, type, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)",
            args: [
                userId,
                userName,
                userImage,
                "course_completion",
                `User ${userName} telah menyelesaikan kursus! (Unit & Block Habis)`,
                0,
                new Date().toISOString()
            ]
        });

        return NextResponse.json({ success: true, message: "Manager notified successfully" });
    } catch (error) {
        console.error("Notify Manager Error:", error);
        return NextResponse.json({ success: false, error: "Failed to notify manager" }, { status: 500 });
    }
}
