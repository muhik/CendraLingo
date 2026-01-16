import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "local.db");

// POST: Submit feedback
export async function POST(request: Request) {
    let db;
    try {
        const body = await request.json();
        const { userId, userName, message, type } = body;

        // Validation based on requirements
        if (!userId || !message) {
            return NextResponse.json({ error: "Missing fields" }, { status: 400 });
        }

        db = new Database(dbPath);

        // Insert feedback
        db.prepare(`
            INSERT INTO feedbacks (user_id, user_name, message, type, created_at)
            VALUES (?, ?, ?, ?, ?)
        `).run(
            userId,
            userName || "Anonymous",
            message,
            type || 'saran',
            new Date().toISOString()
        );

        db.close();
        return NextResponse.json({ success: true, message: "Feedback submitted" });

    } catch (error) {
        console.error("Feedback submit error:", error);
        if (db) db.close();
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
