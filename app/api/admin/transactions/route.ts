import { NextResponse } from "next/server";
import { createClient } from "@libsql/client";

const turso = createClient({
    url: process.env.TURSO_CONNECTION_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
});

export const runtime = "nodejs";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const offset = (page - 1) * limit;

        // Fetch transactions with pagination
        const transactions = await turso.execute({
            sql: "SELECT * FROM transactions ORDER BY created_at DESC LIMIT ? OFFSET ?",
            args: [limit, offset]
        });

        // Get total count
        const countRes = await turso.execute("SELECT COUNT(*) as total FROM transactions");
        const total = Number(countRes.rows[0].total);

        // Map column names if needed or return rows directly
        return NextResponse.json({
            success: true,
            data: transactions.rows,
            pagination: {
                page,
                limit,
                total,
                totalPages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error("Fetch transactions error:", error);
        return NextResponse.json({ success: false, error: String(error) }, { status: 500 });
    }
}
