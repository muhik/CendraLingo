import { db } from "@/db/drizzle";
import { vouchers } from "@/db/schema";
import { desc, and, gte, lte, count } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "50");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const offset = (page - 1) * limit;

        // Build Helper Conditions
        const conditions = [];
        if (startDate) conditions.push(gte(vouchers.createdAt, new Date(startDate)));
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999); // End of day
            conditions.push(lte(vouchers.createdAt, end));
        }

        const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

        // Fetch Data
        const data = await db.select()
            .from(vouchers)
            .where(whereClause)
            .orderBy(desc(vouchers.createdAt))
            .limit(limit)
            .offset(offset);

        // Fetch Total Count (for pagination)
        // Note: In Drizzle SQLite, count() is a bit verbose, simplified for now
        const allVouchers = await db.select({ id: vouchers.id }).from(vouchers).where(whereClause);
        const totalItems = allVouchers.length;
        const totalPages = Math.ceil(totalItems / limit);

        return NextResponse.json({
            data,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages
            }
        });

    } catch (error) {
        console.error("Admin Vouchers Error:", error);
        return NextResponse.json({
            data: [],
            pagination: { page: 1, limit: 50, totalItems: 0, totalPages: 1 }
        }, { status: 500 });
    }
}
