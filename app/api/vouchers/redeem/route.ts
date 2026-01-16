import { db } from "@/db/drizzle";
export const runtime = "edge";
import { vouchers, userProgress } from "@/db/schema";
import { eq, and, gte, sql } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { code, userId } = body; // Get userId

        // 1. Find Voucher
        const voucher = await db.select().from(vouchers).where(eq(vouchers.code, code)).get();

        if (!voucher) {
            return NextResponse.json({ success: false, message: "KODE TIDAK DITEMUKAN" }, { status: 404 });
        }

        if (voucher.isClaimed) {
            return NextResponse.json({ success: false, message: "VOUCHER SUDAH TERPAKAI" }, { status: 400 });
        }

        // 2. Limit Check (1000 Unique Users / Month)
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Check if user already claimed this month (is he an existing active user?)
        // Note: We need a raw query or helper to check existence efficiently. 
        // For SQLite simplicity, we check directly.
        const userClaimsThisMonth = await db.select().from(vouchers).where(and(
            eq(vouchers.claimedBy, userId),
            gte(vouchers.claimedAt, startOfMonth)
        )).get();

        if (!userClaimsThisMonth) {
            // New user for this month. Check Quota.
            // Count distinct users who claimed this month
            // Drizzle SQLite workaround for distinct count:
            const allClaims = await db.select({ userId: vouchers.claimedBy }).from(vouchers)
                .where(gte(vouchers.claimedAt, startOfMonth));

            const uniqueUsers = new Set(allClaims.map((c: any) => c.userId)).size;

            if (uniqueUsers >= 1000) {
                return NextResponse.json({ success: false, message: "KUOTA BULANAN HABIS (Max 1000 User)" }, { status: 400 });
            }
        }

        // 3. Mark as Claimed (Atomic Logic)
        const result = await db.update(vouchers)
            .set({
                isClaimed: true,
                claimedBy: userId || "Unknown User",
                claimedAt: new Date() // Record Time
            })
            .where(and(eq(vouchers.id, voucher.id), eq(vouchers.isClaimed, false))) // Atomic lock
            .returning();

        if (result.length === 0) {
            return NextResponse.json({ success: false, message: "YAH, KEDULUAN KLAIM ORANG LAIN!" }, { status: 400 });
        }

        // 4. Update User Balance (Credit Rewards)
        // Check if there are rewards to credit
        if (voucher.gemsAmount > 0 || voucher.cashbackAmount > 0) {
            await db.update(userProgress)
                .set({
                    points: sql`${userProgress.points} + ${voucher.gemsAmount}`,
                    cashbackBalance: sql`${userProgress.cashbackBalance} + ${voucher.cashbackAmount}`
                })
                .where(eq(userProgress.userId, userId));
        }

        // 3. Return Reward Info
        return NextResponse.json({
            success: true,
            gems: voucher.gemsAmount,
            cashback: voucher.cashbackAmount,
            message: `BERHASIL! +${voucher.gemsAmount} Gems & Simpanan Rp ${voucher.cashbackAmount}`
        });

    } catch (error) {
        console.error("Redeem Error:", error);
        return NextResponse.json({ success: false, message: "Server Error" }, { status: 500 });
    }
}
