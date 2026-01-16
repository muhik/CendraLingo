import { NextResponse } from "next/server";
import { db } from "@/db/drizzle";
export const runtime = "edge";
import { feedbacks } from "@/db/schema";
import { desc, sql, count, gte, lte, and } from "drizzle-orm";

// GET: List feedbacks for admin
export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const startDate = searchParams.get("startDate"); // YYYY-MM-DD
        const endDate = searchParams.get("endDate");     // YYYY-MM-DD
        const offset = (page - 1) * limit;

        const filters = [];
        if (startDate) {
            filters.push(gte(sql`date(${feedbacks.createdAt})`, startDate));
        }
        if (endDate) {
            filters.push(lte(sql`date(${feedbacks.createdAt})`, endDate));
        }

        // Count total for pagination
        const [totalResult] = await db.select({ total: count() })
            .from(feedbacks)
            .where(and(...filters));

        const total = totalResult ? totalResult.total : 0;
        const totalPages = Math.ceil(total / limit);

        // Fetch paginated data
        const data = await db.select()
            .from(feedbacks)
            .where(and(...filters))
            .orderBy(desc(feedbacks.createdAt))
            .limit(limit)
            .offset(offset);

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
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
