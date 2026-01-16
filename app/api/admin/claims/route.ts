import { db } from "@/db/drizzle";
import { vouchers, userProgress } from "@/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    try {
        const { searchParams } = new URL(req.url);
        const page = parseInt(searchParams.get("page") || "1");
        const limit = parseInt(searchParams.get("limit") || "10");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");

        const offset = (page - 1) * limit;

        // Build filter conditions
        const conditions = [eq(vouchers.isClaimed, true)];

        if (startDate) {
            const start = new Date(startDate);
            start.setHours(0, 0, 0, 0);
            conditions.push(gte(vouchers.claimedAt, start));
        }
        if (endDate) {
            const end = new Date(endDate);
            end.setHours(23, 59, 59, 999);
            conditions.push(lte(vouchers.claimedAt, end));
        }

        const whereClause = and(...conditions);

        // Fetch paginated claims
        const claims = await db.select({
            code: vouchers.code,
            claimedBy: vouchers.claimedBy,
            userName: userProgress.userName,
            valueRp: vouchers.valueRp,
            cashbackAmount: vouchers.cashbackAmount,
            claimedAt: vouchers.claimedAt,
        })
            .from(vouchers)
            .leftJoin(userProgress, eq(vouchers.claimedBy, userProgress.userId))
            .where(whereClause)
            .orderBy(desc(vouchers.claimedAt))
            .limit(limit)
            .offset(offset);

        // Count total for pagination
        const allClaims = await db.select({ id: vouchers.id })
            .from(vouchers)
            .where(whereClause);

        const totalItems = allClaims.length;
        const totalPages = Math.ceil(totalItems / limit) || 1;

        // Calculate total cashback for this period
        const totalCashback = claims.reduce((sum: number, c: any) => sum + (c.cashbackAmount || 0), 0);

        return NextResponse.json({
            data: claims,
            pagination: {
                page,
                limit,
                totalItems,
                totalPages
            },
            summary: {
                totalCashback
            }
        });
    } catch (error) {
        console.error("Claims Fetch Error:", error);
        return NextResponse.json({
            data: [],
            pagination: { page: 1, limit: 10, totalItems: 0, totalPages: 1 },
            summary: { totalCashback: 0 }
        }, { status: 500 });
    }
}
