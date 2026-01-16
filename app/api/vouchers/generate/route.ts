import { db } from "@/db/drizzle";
import { vouchers } from "@/db/schema";
import { NextResponse } from "next/server";

const BONUS_MAP: Record<number, { gems: number, bonus: number }> = {
    1000: { gems: 10, bonus: 2 },
    5000: { gems: 50, bonus: 10 },
    10000: { gems: 100, bonus: 25 },
    15000: { gems: 150, bonus: 50 },
    25000: { gems: 250, bonus: 100 },
    50000: { gems: 500, bonus: 300 },
};

function generateCode(prefix = "CN") {
    const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
    let result = "";
    for (let i = 0; i < 6; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${prefix}-${result}`;
}

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const { qty, valueRp } = body;



        const config = BONUS_MAP[valueRp] || { gems: Math.floor(valueRp / 100), bonus: 0 };
        const totalGems = config.gems + config.bonus;

        // Cashback Strategy (Tiered to save budget)
        const RATE_MAP: Record<number, number> = {
            1000: 0.05,     // 5%
            5000: 0.025,    // 2.5%
            10000: 0.02,    // 2.0% (Assumed)
            15000: 0.015,   // 1.5%
            25000: 0.005,   // 0.5%
            50000: 0.00025  // 0.025%
        };
        const rate = RATE_MAP[valueRp] || 0.01; // Default 1% if unknown
        const cashback = Math.floor(valueRp * rate);

        const newVouchers = [];

        for (let i = 0; i < qty; i++) {
            newVouchers.push({
                code: generateCode(),
                valueRp,
                gemsAmount: totalGems,
                cashbackAmount: cashback,
                isClaimed: false,
                createdAt: new Date(),
            });
        }

        // Batch Insert
        const result = await db.insert(vouchers).values(newVouchers).returning();

        return NextResponse.json({ success: true, vouchers: result });
    } catch (error) {
        console.error("Generate Error:", error);
        return NextResponse.json({ success: false, error: "Failed" }, { status: 500 });
    }
}
