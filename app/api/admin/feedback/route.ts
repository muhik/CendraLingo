import { NextResponse } from "next/server";
import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "local.db");

// GET: List feedbacks for admin
export async function GET(request: Request) {
    let db;
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const startDate = searchParams.get("startDate"); // YYYY-MM-DD
        const endDate = searchParams.get("endDate");     // YYYY-MM-DD
        const offset = (page - 1) * limit;

        db = new Database(dbPath);

        let query = "SELECT * FROM feedbacks WHERE 1=1";
        let countQuery = "SELECT COUNT(*) as total FROM feedbacks WHERE 1=1";
        const params: any[] = [];

        if (startDate) {
            query += " AND date(created_at) >= ?";
            countQuery += " AND date(created_at) >= ?";
            params.push(startDate);
        }

        if (endDate) {
            query += " AND date(created_at) <= ?";
            countQuery += " AND date(created_at) <= ?";
            params.push(endDate);
        }

        query += " ORDER BY created_at DESC LIMIT ? OFFSET ?";

        // Count total for pagination
        const totalResult = db.prepare(countQuery).get(...params) as { total: number };
        const total = totalResult ? totalResult.total : 0;
        const totalPages = Math.ceil(total / limit);

        // Fetch paginated data
        const data = db.prepare(query).all(...params, limit, offset);

        db.close();
        return NextResponse.json({
            data,
            pagination: {
                total,
                page,
                totalPages,
                limit
            }
        });
    } catch (error) {
        console.error("Feedback list error:", error);
        if (db) db.close();
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
